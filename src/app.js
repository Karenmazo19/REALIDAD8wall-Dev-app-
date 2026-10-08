import * as ecs from '@8thwall/ecs'

const IMAGE_TARGET_NAME = 'mi imagen-1'

ecs.registerComponent({
  name: 'show-model-on-image-target',
  schema: {},
  schemaDefaults: {},
  add: (world, component) => {
    ecs.Hidden.set(world, component.eid, {})
  },
  stateMachine: ({world, eid}) => {
    ecs.defineState('waiting-for-image-target')
      .initial()
      .listen(world.events.globalId, ecs.events.REALITY_IMAGE_FOUND, (event) => {
        if (event.data.name === IMAGE_TARGET_NAME) {
          ecs.Hidden.remove(world, eid)
        }
      })
      .listen(world.events.globalId, ecs.events.REALITY_IMAGE_LOST, (event) => {
        if (event.data.name === IMAGE_TARGET_NAME) {
          ecs.Hidden.set(world, eid, {})
        }
      })
  },
})

const onxrloaded = () => {
  XR8.XrController.configure({
    imageTargetData: [
      require('../image-targets/mi imagen-1.json')
    ],
  })
}

window.XR8 ? onxrloaded() : window.addEventListener('xrloaded', onxrloaded)
