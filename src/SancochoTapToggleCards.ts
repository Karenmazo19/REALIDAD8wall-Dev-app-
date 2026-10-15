import * as ecs from '@8thwall/ecs'

const maxTapMovement = 0.05

const getImageTargetEntity = (world: ecs.World, eid: bigint) => {
  for (let current: bigint | undefined = eid; current; current = world.getParent(current)) {
    if (ecs.ImageTarget.has(world, current)) return current
  }
  return undefined
}

const isImageTargetEvent = (data: unknown, targetName: string) =>
  !!data && typeof data === 'object' && 'name' in data && data.name === targetName

ecs.registerComponent({
  name: 'Sancocho Tap Toggle Cards',

  schema: {
    costilla: ecs.eid,
    mazorca: ecs.eid,
    yuca: ecs.eid,
    amee: ecs.eid,
  },

  stateMachine: ({world, eid, schemaAttribute}) => {
    const taps = new Set<number>()
    const imageTarget = getImageTargetEntity(world, eid)
    const targetName = imageTarget ? ecs.ImageTarget.get(world, imageTarget).name : undefined
    let targetTracked = !targetName
    let nextToggleAt = 0

    const toggleCards = () => {
      const {costilla, mazorca, yuca, amee} = schemaAttribute.get(eid)
      const cards = [costilla, mazorca, yuca, amee]
        .filter(Boolean)
        .map(cardId => world.getEntity(cardId))
      if (cards.length === 0) return

      // Respect the actual scene visibility so the first tap always flips the current state.
      const showCards = cards.some(card => card.isHidden())
      for (const card of cards) {
        if (showCards) card.show()
        else card.hide()
      }
    }

    ecs.defineState('ready').initial()
      .onExit(() => taps.clear())
      .listen(world.events.globalId, ecs.events.REALITY_IMAGE_FOUND, ({data}) => {
        if (targetName && isImageTargetEvent(data, targetName)) targetTracked = true
      })
      .listen(world.events.globalId, ecs.events.REALITY_IMAGE_LOST, ({data}) => {
        if (targetName && isImageTargetEvent(data, targetName)) {
          targetTracked = false
          taps.clear()
        }
      })
      .listen(world.events.globalId, ecs.input.SCREEN_TOUCH_START, ({data}) => {
        if (targetTracked) taps.add(data.pointerId)
      })
      .listen(world.events.globalId, ecs.input.SCREEN_TOUCH_MOVE, ({data}) => {
        const distance = Math.hypot(data.position.x - data.start.x, data.position.y - data.start.y)
        if (distance > maxTapMovement) taps.delete(data.pointerId)
      })
      .listen(world.events.globalId, ecs.input.GESTURE_START, ({data}) => {
        if (data.touchCount > 1) taps.clear()
      })
      .listen(world.events.globalId, ecs.input.SCREEN_TOUCH_END, ({data}) => {
        if (!taps.delete(data.pointerId) || !targetTracked) return
        const distance = Math.hypot(data.position.x - data.start.x, data.position.y - data.start.y)
        if (distance > maxTapMovement || world.time.elapsed < nextToggleAt) return

        toggleCards()
        nextToggleAt = world.time.elapsed + 250
      })
  },
})
