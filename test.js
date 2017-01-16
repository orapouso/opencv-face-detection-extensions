const opencv = require('opencv')
const opencv_ext = require('./')(opencv)

opencv_ext.on('faces', (result) => {
  console.log('emitted faces', result)
})

opencv_ext.on('smiles', (result) => {
  console.log('emitted smiles', result)
})

opencv_ext.smiles('./data/image1.jpg', {scale: 1.05, neighbor: 8, smileScale: 1.01})
  .then((result) => {
    console.log('promised smiles', result)
    result.detections.forEach((detection) => {
      detection.smiles.forEach((smile) => {
        let face = detection.face
        result.image.rectangle([smile.x + face.x, smile.y + face.height/2 + face.y], [smile.width, smile.height], [255, 0, 0], 2)
        
      })
    })
    
    result.image.save('./data/out.jpg')
  })
  .catch((err) => {
    console.log('error', err)
  })