import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'Show Image On Tap',

  schema: {
    // Entity to show when the model is tapped.
    // @label Image
    image: ecs.eid,
  },

  stateMachine: ({world, eid, schemaAttribute}) => {
    const taps = new Set<number>()
    const maxTapMovement = 0.025

    const hitsModel = (target: bigint | undefined) => {
      for (let current = target; current; current = world.getParent(current)) {
        if (ecs.Ui.has(world, current)) return false
        if (current === eid) return true
      }
      return false
    }

    ecs.defineState('ready').initial()
      .onExit(() => taps.clear())
      .listen(world.events.globalId, ecs.input.SCREEN_TOUCH_START, ({data}) => {
        if (hitsModel(data.target)) taps.add(data.pointerId)
      })
      .listen(world.events.globalId, ecs.input.SCREEN_TOUCH_MOVE, ({data}) => {
        const distance = Math.hypot(data.position.x - data.start.x, data.position.y - data.start.y)
        if (distance > maxTapMovement) taps.delete(data.pointerId)
      })
      .listen(world.events.globalId, ecs.input.GESTURE_START, ({data}) => {
        if (data.touchCount > 1) taps.clear()
      })
      .listen(world.events.globalId, ecs.input.SCREEN_TOUCH_END, ({data}) => {
        if (!taps.delete(data.pointerId) || !hitsModel(data.target) || !hitsModel(data.endTarget)) return
        const distance = Math.hypot(data.position.x - data.start.x, data.position.y - data.start.y)
        if (distance > maxTapMovement) return

        const image = schemaAttribute.get(eid).image
        if (image) world.getEntity(image).show()
      })
  },
})
