const onxrloaded = () => {
  XR8.XrController.configure({
    imageTargetData: [
      require('../image-targets/corozo-05.json')
    ],
  })
}

window.XR8 ? onxrloaded() : window.addEventListener('xrloaded', onxrloaded)

const onxrloaded = () => {
  XR8.XrController.configure({
    imageTargetData: [
      require('../image-targets/sancocho-02.json')
    ],
  })
}

window.XR8 ? onxrloaded() : window.addEventListener('xrloaded', onxrloaded)

const onxrloaded = () => {
  XR8.XrController.configure({
    imageTargetData: [
      require('../image-targets/mamey-02.json')
    ],
  })
}

window.XR8 ? onxrloaded() : window.addEventListener('xrloaded', onxrloaded)

const onxrloaded = () => {
  XR8.XrController.configure({
    imageTargetData: [
      require('../image-targets/arepa-03.json')
    ],
  })
}

window.XR8 ? onxrloaded() : window.addEventListener('xrloaded', onxrloaded)

const onxrloaded = () => {
  XR8.XrController.configure({
    imageTargetData: [
      require('../image-targets/coco-04.json')
    ],
  })
}

window.XR8 ? onxrloaded() : window.addEventListener('xrloaded', onxrloaded)
