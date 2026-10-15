const onxrloaded = () => {
  XR8.XrController.configure({
    disableWorldTracking: true,
    imageTargetData: [
      require('../image-targets/corozo-05.json'),  
       require('../image-targets/mamey-02.json'),
            require('../image-targets/sancocho-02.json'),
      require('../image-targets/coco-04.json'),
      require('../image-targets/arepa-03.json'),
      require('../image-targets/postalimpresa.json')
    ],
  })
}

window.XR8 ? onxrloaded() : window.addEventListener('xrloaded', onxrloaded)


