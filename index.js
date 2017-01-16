const EventEmitter = require('events').EventEmitter;
const path = require('path');
const debug = require('debug')('opencv_ext')

module.exports = function (opencv) {
  class OpenCVExtensions extends EventEmitter {
    constructor() {
      super()    
    }
    
    smiles(imagePath, {scale:scale=1.05, neighbor:neighbor=8, smileScale: smileScale=1.1, smileNeighbor:smileNeighbor=10}) {
      return new Promise((res, rej) => {
        opencv.readImage(imagePath, (err, image) => {
          if (err) { return this.detectionError(err, rej, imagePath) }

          image.detectObject(opencv.FACE_CASCADE, {scale: scale, neighbor: neighbor}, (err, faces) => {
            if (err) { return this.detectionError(err, rej, imagePath) }
            
            if (faces && faces.length) {
              this.emit('faces', {detection: {faces: faces}, image: image, path: imagePath})
              
              let promises = []
              faces.forEach((face) => {
                debug('face', face)
                let hh = parseInt(face.height / 2)
                let faceImage = image.roi(face.x, face.y + hh, face.width, hh)
                faceImage.convertGrayscale()
                faceImage.equalizeHist()
                
                promises.push(new Promise((res, rej) => {
                  faceImage.detectObject(OpenCVExtensions.SMILE_CASCADE, {scale: smileScale, neighbor: smileNeighbor}, (err, smiles) => {
                    debug('smiles', smiles)                  
                    if (err) { return this.detectionError(err, rej, imagePath) }

                    if (smiles && smiles.length) {
                      let detectionObj = {smiles: smiles, face: face}
                      res(detectionObj)

                      this.emit('smiles', {detection: detectionObj, image: image, path: imagePath})
                    }
                  })                  
                }))
              })
              
              Promise.all(promises)
                .then((detections) => {
                  if (detections && detections.length) {
                    return res({image: image, path: imagePath, detections: detections})
                  } else {
                    return this.detectionError(new Error('no smiles detected'), rej, imagePath)
                  }                  
                })
                .catch((errs) => {
                  this.detectionError(errs, rej, imagePath)
                })
            } else {
              this.detectionError(new Error('no faces detected'), rej, imagePath)
            }
          })      
        })
      })
    }
    
    detectionError(err, reject, path) {
      err.image_path = path
      this.emit('error', err)
      reject(err)
    }
  }
  
  OpenCVExtensions.SMILE_CASCADE = path.join(__dirname, './data/haarcascade_smile.xml')

  return new OpenCVExtensions()
}