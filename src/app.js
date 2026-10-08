const onxrloaded = () => {
  XR8.XrController.configure({
    imageTargetData: [
      require('../mi imagen-1.json')
    ],
  })
}
window.XR8 ? onxrloaded() : window.addEventListener('xrloaded', onxrloaded)