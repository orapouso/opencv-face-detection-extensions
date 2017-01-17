const opencv = require('opencv')
const opencv_ext = require('./')(opencv)

opencv_ext.on('error', (err) => {
  console.log('emitted error', err)
})

opencv_ext.on('faces', (result) => {
  console.log('emitted faces', result.detection.faces.length)
})

opencv_ext.on('smiles', (result) => {
  console.log('emitted smiles', result.detection.smiles.length)
})

smiles()
  .then(() => noFaces())
  .then(() => faceWithouSmile())


// image with smile
function smiles() {
  return opencv_ext.smiles('./data/image1.jpg', {})
    .then((result) => {
      console.log('promised smiles', result.detections.length)
      result.detections.forEach((detection) => {
        detection.smiles.forEach((smile) => {
          let face = detection.face
          result.image.rectangle([smile.x + face.x, smile.y + face.height/2 + face.y], [smile.width, smile.height], [255, 0, 0], 2)
          
        })
      })
      
      result.image.save('./data/out1.jpg')
    })
    .catch((err) => {
      console.log('error', err)
    })
}

// image with no faces
function noFaces() {
  return opencv_ext.smiles('./data/image2.jpg', {})
    .then((result) => console.log('should not print this', result.detections.length))
    .catch((err) => console.log('should throw no face error', err.message))
}

function faceWithouSmile() {
  return opencv_ext.smiles('./data/image3.jpg', {smileNeighbors:100})
  .then((result) => console.log('should not print this', result.detections.length))
  .catch((err) => console.log('should throw no smile error', err.message))
}