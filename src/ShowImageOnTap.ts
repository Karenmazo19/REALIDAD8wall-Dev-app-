import * as ecs from '@8thwall/ecs'

const registerImageToggle = (name: string, ignoreVideoTouches = false) => ecs.registerComponent({
  name,

  schema: {
    // Image entity to toggle when the model is tapped.
    // @label Image
    image: ecs.eid,
  },

  stateMachine: ({world, eid, schemaAttribute}) => {
    const taps = new Set<number>()
    const maxTapMovement = 0.025

    const isVideoTarget = (target?: bigint) => {
      if (!ignoreVideoTouches) return false
      for (let current = target; current; current = world.getParent(current)) {
        if (ecs.VideoControls.has(world, current)) return true
      }
      return false
    }

    ecs.defineState('ready').initial()
      .onExit(() => taps.clear())
      .listen(world.events.globalId, ecs.input.SCREEN_TOUCH_START, ({data}) => {
        taps.add(data.pointerId)
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
        if (isVideoTarget(data.target) || isVideoTarget(data.endTarget)) return
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
registerImageToggle('Show Image On Tap Outside Video', true)

ecs.registerComponent({
  name: 'Show Sancocho Cards On Tap',

  schema: {
    costilla: ecs.eid,
    mazorca: ecs.eid,
    yuca: ecs.eid,
    amee: ecs.eid,
  },

  stateMachine: ({world, eid, schemaAttribute}) => {
    const taps = new Set<number>()
    const maxTapMovement = 0.025

    const toggleCards = () => {
      const {costilla, mazorca, yuca, amee} = schemaAttribute.get(eid)
      const cardIds = [costilla, mazorca, yuca, amee].filter(Boolean)
      const cards = cardIds.map(cardId => world.getEntity(cardId))
      const shouldShow = cards.some(card => card.isHidden())
      cards.forEach(card => (shouldShow ? card.show() : card.hide()))
    }

    ecs.defineState('ready').initial()
      .onExit(() => taps.clear())
      .listen(world.events.globalId, ecs.input.SCREEN_TOUCH_START, ({data}) => {
        taps.add(data.pointerId)
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
        const distance = Math.hypot(data.position.x - data.start.x, data.position.y - data.start.y)
        if (distance > maxTapMovement) return
        toggleCards()
      })
  },
})

ecs.registerComponent({
  name: 'Show Dulce Cards On Tap',

  schema: {
    mamey: ecs.eid,
    patilla: ecs.eid,
  },

  stateMachine: ({world, eid, schemaAttribute}) => {
    const taps = new Set<number>()
    const maxTapMovement = 0.025

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
      .listen(world.events.globalId, ecs.input.SCREEN_TOUCH_START, ({data}) => {
        taps.add(data.pointerId)
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
        const distance = Math.hypot(data.position.x - data.start.x, data.position.y - data.start.y)
        if (distance > maxTapMovement) return
        toggleCards()
      })
  },
})
