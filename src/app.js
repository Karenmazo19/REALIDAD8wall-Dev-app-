const onxrloaded = () => {
  XR8.XrController.configure({
    imageTargetData: [
      require('../logo.json')
    ],
  })
}
window.XR8 ? onxrloaded() : window.addEventListener('xrloaded', onxrloaded)