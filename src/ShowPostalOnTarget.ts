import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'Show Postal On Target',

  schema: {
    // Image entity shown while the postal image target is tracked.
    // @label Postal Image
    image: ecs.eid,
  },

  stateMachine: ({world, eid, schemaAttribute}) => {
    const setImageVisible = (visible: boolean) => {
      const image = schemaAttribute.get(eid).image
      if (!image) return
      const entity = world.getEntity(image)
      if (visible) entity.show()
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
  },
})
