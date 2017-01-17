# OpenCV Face Detection Extensions

Extensions for face detection using OpenCV. It needs an instance of `require('opencv')`

## Example code
```js
const opencv = require('opencv')
const opencv_ext = require('opencv-face-detection-extensions')(opencv)

opencv_ext.smiles('./data/image1.jpg', {})
  .then((result) => {
    console.log('promised smiles', result.detections.length)
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
```

# API

The extensions work through Promises and a event emitter.
Events are emitted as soon as a feature is detected, while the Promise api aggregates all the results together.

## Events

Events are emitted as soon as a feature is detected, one for each detected feature.

```js
.on('smiles', (result) => {
  /*{
    detection:{
      smiles: Array[Array[coords]],
      face: Array[coords]}
    },
    image: Matrix,
    path: String
  }*/ 
})
```
```js
.on('faces', (result) => {
    /*{
      detection:{
        faces: Array[Array[coords]]}
      },
      image: Matrix,
      path: String
    }*/ 
})
```

## Smiles

Detects smiles in faces

Emits: `smiles`, `faces`

```js
opencv_ext.smiles(path, opts)
  .then((result) => {
    /*{
      detections:[{
        smiles: Array[Array[coords]],
        face: Array[coords]}
      }],
      image: Matrix,
      path: String
    }*/
  })
```

options
 - scale: OpenCV [scaleFator](http://docs.opencv.org/2.4/modules/objdetect/doc/cascade_classification.html#cascadeclassifier-detectmultiscale) parameter
 - neighbors: OpenCV [minNeighbors](http://docs.opencv.org/2.4/modules/objdetect/doc/cascade_classification.html#cascadeclassifier-detectmultiscale) parameter
 - smileScale: same as above but applied to the faces found in images
 - smileNeighbors: same as above but applied to the faces found in images
