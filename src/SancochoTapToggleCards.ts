import * as ecs from '@8thwall/ecs'

const maxTapMovement = 0.05

const getImageTargetEntity = (world: ecs.World, eid: bigint) => {
  for (let current: bigint | undefined = eid; current; current = world.getParent(current)) {
    if (ecs.ImageTarget.has(world, current)) return current
  }
  return undefined
}

const isTapForImageTarget = (
  world: ecs.World,
  imageTarget: bigint | undefined,
  targetTracked: boolean,
  ...touchTargets: Array<bigint | undefined>
) => {
  let hitImageTarget = false
  for (const touchTarget of touchTargets) {
    for (let current = touchTarget; current; current = world.getParent(current)) {
      if (!ecs.ImageTarget.has(world, current)) continue
      hitImageTarget = true
      if (current !== imageTarget) return false
      break
    }
  }
  return hitImageTarget || targetTracked
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
    video: ecs.eid,
  },

  stateMachine: ({world, eid, schemaAttribute}) => {
    const imageTarget = getImageTargetEntity(world, eid)
    const targetName = imageTarget ? ecs.ImageTarget.get(world, imageTarget).name : undefined
    let targetTracked = !targetName
    let nextToggleAt = 0

    const toggleCards = () => {
      const {costilla, mazorca, yuca, amee, video} = schemaAttribute.get(eid)
      const cards = [costilla, mazorca, yuca, amee, video]
        .filter(Boolean)
        .map(cardId => world.getEntity(cardId))
      if (cards.length === 0) return

      // Respect the actual scene visibility so the first tap always flips the current state.
      const showCards = cards.some(card => card.isHidden())
      for (const card of cards) {
        if (showCards) card.show()
        else card.hide()
      }

      // Stop playback while hidden, and resume it from the user's tap when shown.
      if (video && ecs.VideoControls.has(world, video)) {
        ecs.VideoControls.mutate(world, video, (controls) => {
          controls.paused = !showCards
        })
      }
    }

    ecs.defineState('ready').initial()
      .listen(world.events.globalId, ecs.events.REALITY_IMAGE_FOUND, ({data}) => {
        if (targetName && isImageTargetEvent(data, targetName)) targetTracked = true
      })
      .listen(world.events.globalId, ecs.events.REALITY_IMAGE_LOST, ({data}) => {
        if (targetName && isImageTargetEvent(data, targetName)) {
          targetTracked = false
        }
      })
      .listen(world.events.globalId, ecs.input.SCREEN_TOUCH_END, ({data}) => {
        if (!isTapForImageTarget(world, imageTarget, targetTracked, data.target, data.endTarget)) return
        const distance = Math.hypot(data.position.x - data.start.x, data.position.y - data.start.y)
        if (distance > maxTapMovement || world.time.elapsed < nextToggleAt) return

        toggleCards()
        nextToggleAt = world.time.elapsed + 250
      })
  },
})
