import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'Sancocho Tap Toggle Cards',

  schema: {
    costilla: ecs.eid,
    mazorca: ecs.eid,
    yuca: ecs.eid,
    amee: ecs.eid,
  },

  stateMachine: ({world, eid, schemaAttribute}) => {
    const activeTouches = new Set<number>()
    let lastToggleAt = 0

    ecs.defineState('ready').initial()
      .onExit(() => activeTouches.clear())
      .listen(world.events.globalId, ecs.input.SCREEN_TOUCH_START, ({data}) => {
        activeTouches.add(data.pointerId)
      })
      .listen(world.events.globalId, ecs.input.SCREEN_TOUCH_MOVE, ({data}) => {
        if (Math.hypot(data.position.x - data.start.x, data.position.y - data.start.y) > 0.05) {
          activeTouches.delete(data.pointerId)
        }
      })
      .listen(world.events.globalId, ecs.input.GESTURE_START, ({data}) => {
        if (data.touchCount > 1) activeTouches.clear()
      })
      .listen(world.events.globalId, ecs.input.SCREEN_TOUCH_END, ({data}) => {
        if (!activeTouches.delete(data.pointerId)) return
        if (Math.hypot(data.position.x - data.start.x, data.position.y - data.start.y) > 0.05) return

        const now = world.time.elapsed
        if (now - lastToggleAt < 250) return
        lastToggleAt = now

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
      })
  },
})
