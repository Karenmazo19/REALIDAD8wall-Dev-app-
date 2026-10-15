import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'Show Postal On Target',

  schema: {
    // Image entity shown while the postal image target is tracked.
    // @label Postal Image
    image: ecs.eid,
  },

  stateMachine: ({world, eid, schemaAttribute}) => {
    const taps = new Set<number>()
    const maxTapMovement = 0.025

    const setImageVisible = (visible: boolean) => {
      const image = schemaAttribute.get(eid).image
      if (!image) return
      const entity = world.getEntity(image)
      if (visible) entity.show()
      else entity.hide()
    }

    const toggleImage = () => {
      const image = schemaAttribute.get(eid).image
      if (!image) return
      const entity = world.getEntity(image)
      if (entity.isHidden()) entity.show()
      else entity.hide()
    }

    ecs.defineState('waiting-for-postal').initial()
      .onEnter(() => setImageVisible(false))
      .listen(world.events.globalId, ecs.events.REALITY_IMAGE_FOUND, ({data}) => {
        const {name} = data as {name?: string}
        if (name === 'postalimpresa') setImageVisible(true)
      })
      .listen(world.events.globalId, ecs.events.REALITY_IMAGE_LOST, ({data}) => {
        const {name} = data as {name?: string}
        if (name === 'postalimpresa') setImageVisible(false)
      })
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
        toggleImage()
      })
  },
})
