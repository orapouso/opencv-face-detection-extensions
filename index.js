const EventEmitter = require('events').EventEmitter;
const path = require('path');
const Promise = require('bluebird')

module.exports = function (opencv) {
  class OpenCVExtensions extends EventEmitter {
    constructor() {
      super()    
    }
    
    smiles(imagePath, {scale:scale=1.1, neighbors:neighbors=2, smileScale: smileScale=1.1, smileNeighbors:smileNeighbors=22}) {
      return new Promise((res, rej) => {
        opencv.readImage(imagePath, (err, image) => {
          if (err) { return emitError(DetectionError.from(err, imagePath), {rej: rej, emitter: this}) }

          image.detectObject(opencv.FACE_CASCADE, {scale: scale, neighbors: neighbors}, (err, faces) => {
            if (err) { return emitError(DetectionError.from(err, imagePath), {rej: rej, emitter: this}) }
            
            if (faces && faces.length) {
              this.emit('faces', {detection: {faces: faces}, image: image, path: imagePath})
              
              Promise.reduce(faces, (detections, face) => {
                let hh = parseInt(face.height / 2)
                let faceImage = image.roi(face.x, face.y + hh, face.width, hh)
                
                return new Promise((res, rej) => {
                  faceImage.detectObject(OpenCVExtensions.SMILE_CASCADE, {scale: smileScale, neighbors: smileNeighbors}, (err, smiles) => {
                    if (err) { rej(err) }

                    if (smiles && smiles.length) {
                      let detectionObj = {smiles: smiles, face: face}
                      this.emit('smiles', {detection: detectionObj, image: image, path: imagePath})
                      detections.push(detectionObj)
                    }

                    res(detections)
                  })                 
                })
              }, [])
              .then((detections) => {
                if (detections && detections.length) {
                  return res({image: image, path: imagePath, detections: detections})
                } else {
                  return emitError(new DetectionError('no smiles detected', imagePath), {rej: rej})
                }                  
              })
              .catch((err) => {
                emitError(DetectionError.from(err, imagePath), {rej: rej})
              })
            } else {
              emitError(new DetectionError('no faces detected', imagePath), {rej: rej})
            }
          })      
        })
      })
    }
  }
  
  OpenCVExtensions.SMILE_CASCADE = path.join(__dirname, './data/haarcascade_smile.xml')
  
  OpenCVExtensions.errors = {
    DetectionError: DetectionError
  }

  return new OpenCVExtensions()
}

function emitError(err, {emitter:emitter, rej:rej}) {
  if (emitter) {
    emitter.emit('error', err)
  }
  if (rej) {
    rej(err)
  }
}

class DetectionError extends Error {
  constructor(msg, path) {
    super(msg)
    this.image_path = path
  }
}

DetectionError.from = function (err, path) {
  return new DetectionError(err.message, path)
}