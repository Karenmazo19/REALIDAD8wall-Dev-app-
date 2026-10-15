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

const registerImageToggle = (name: string) => ecs.registerComponent({
  name,

  schema: {
    // Image entity to toggle when the model is tapped.
    // @label Image
    image: ecs.eid,
  },

  stateMachine: ({world, eid, schemaAttribute}) => {
    const taps = new Set<number>()
    const imageTarget = getImageTargetEntity(world, eid)
    const targetName = imageTarget ? ecs.ImageTarget.get(world, imageTarget).name : undefined
    let targetTracked = !targetName

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
        if (isTapForImageTarget(world, imageTarget, targetTracked, data.target)) {
          taps.add(data.pointerId)
        }
      })
      .listen(world.events.globalId, ecs.input.SCREEN_TOUCH_MOVE, ({data}) => {
        const distance = Math.hypot(data.position.x - data.start.x, data.position.y - data.start.y)
        if (distance > maxTapMovement) taps.delete(data.pointerId)
      })
      .listen(world.events.globalId, ecs.input.GESTURE_START, ({data}) => {
        if (data.touchCount > 1) taps.clear()
      })
      .listen(world.events.globalId, ecs.input.SCREEN_TOUCH_END, ({data}) => {
        if (!taps.delete(data.pointerId)) return
        if (!isTapForImageTarget(world, imageTarget, targetTracked, data.target, data.endTarget)) return
        const distance = Math.hypot(data.position.x - data.start.x, data.position.y - data.start.y)
        if (distance > maxTapMovement) return

        const image = schemaAttribute.get(eid).image
        if (!image) return
        const imageEntity = world.getEntity(image)
        if (imageEntity.isHidden()) imageEntity.show()
        else imageEntity.hide()
      })
  },
})

registerImageToggle('Show Image On Tap')
registerImageToggle('Show Corozo On Tap')

ecs.registerComponent({
  name: 'Show Dulce Cards On Tap',

  schema: {
    mamey: ecs.eid,
    patilla: ecs.eid,
  },

  stateMachine: ({world, eid, schemaAttribute}) => {
    const taps = new Set<number>()
    const imageTarget = getImageTargetEntity(world, eid)
    const targetName = imageTarget ? ecs.ImageTarget.get(world, imageTarget).name : undefined
    let targetTracked = !targetName

    const toggleCards = () => {
      const {mamey, patilla} = schemaAttribute.get(eid)
      const cards = [mamey, patilla]
        .filter(Boolean)
        .map(cardId => world.getEntity(cardId))
      const shouldShow = cards.some(card => card.isHidden())
      cards.forEach(card => (shouldShow ? card.show() : card.hide()))
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
        if (isTapForImageTarget(world, imageTarget, targetTracked, data.target)) {
          taps.add(data.pointerId)
        }
      })
      .listen(world.events.globalId, ecs.input.SCREEN_TOUCH_MOVE, ({data}) => {
        const distance = Math.hypot(data.position.x - data.start.x, data.position.y - data.start.y)
        if (distance > maxTapMovement) taps.delete(data.pointerId)
      })
      .listen(world.events.globalId, ecs.input.GESTURE_START, ({data}) => {
        if (data.touchCount > 1) taps.clear()
      })
      .listen(world.events.globalId, ecs.input.SCREEN_TOUCH_END, ({data}) => {
        if (!taps.delete(data.pointerId)) return
        if (!isTapForImageTarget(world, imageTarget, targetTracked, data.target, data.endTarget)) return
        const distance = Math.hypot(data.position.x - data.start.x, data.position.y - data.start.y)
        if (distance > maxTapMovement) return
        toggleCards()
      })
  },
})
