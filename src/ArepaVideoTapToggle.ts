import * as ecs from '@8thwall/ecs'

const maxTapMovement = 0.05

const getImageTarget = (world: ecs.World, eid: bigint) => {
  for (let current: bigint | undefined = eid; current; current = world.getParent(current)) {
    if (ecs.ImageTarget.has(world, current)) return current
  }
  return undefined
}

const isTargetEvent = (data: unknown, targetName: string) =>
  !!data && typeof data === 'object' && 'name' in data && data.name === targetName

ecs.registerComponent({
  name: 'Arepa Video Tap Toggle',

  schema: {
    video: ecs.eid,
  },

  stateMachine: ({world, eid, schemaAttribute}) => {
    const imageTarget = getImageTarget(world, eid)
    const targetName = imageTarget ? ecs.ImageTarget.get(world, imageTarget).name : undefined
    let targetTracked = false
    let nextToggleAt = 0

    const toggleVideo = () => {
      const {video} = schemaAttribute.get(eid)
      if (!video) return

      const videoObject = world.getEntity(video)
      const showVideo = videoObject.isHidden()
      if (showVideo) videoObject.show()
      else videoObject.hide()

      if (ecs.VideoControls.has(world, video)) {
        ecs.VideoControls.mutate(world, video, (controls) => {
          controls.paused = !showVideo
        })
      }
    }

    ecs.defineState('ready').initial()
      .listen(world.events.globalId, ecs.events.REALITY_IMAGE_FOUND, ({data}) => {
        if (targetName && isTargetEvent(data, targetName)) targetTracked = true
      })
      .listen(world.events.globalId, ecs.events.REALITY_IMAGE_LOST, ({data}) => {
        if (targetName && isTargetEvent(data, targetName)) targetTracked = false
      })
      .listen(world.events.globalId, ecs.input.SCREEN_TOUCH_END, ({data}) => {
        if (!targetTracked) return
        const movement = Math.hypot(data.position.x - data.start.x, data.position.y - data.start.y)
        if (movement > maxTapMovement || world.time.elapsed < nextToggleAt) return

        toggleVideo()
        nextToggleAt = world.time.elapsed + 250
      })
  },
})
