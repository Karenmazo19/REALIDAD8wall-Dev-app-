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
    let cardsVisible = false
    let lastTouchAt = 0

    ecs.defineState('ready').initial()
      .listen(world.events.globalId, ecs.input.SCREEN_TOUCH_END, () => {
        const now = Date.now()
        if (now - lastTouchAt < 250) return
        lastTouchAt = now

        cardsVisible = !cardsVisible
        const {costilla, mazorca, yuca, amee} = schemaAttribute.get(eid)
        const cardIds = [costilla, mazorca, yuca, amee]

        for (const cardId of cardIds) {
          if (!cardId) continue
          const card = world.getEntity(cardId)
          if (cardsVisible) card.show()
          else card.hide()
        }
      })
  },
})
