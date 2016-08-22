'use strict'

var ndarray = require('ndarray')
var ops = require('ndarray-ops')
var through = require('through')

function handleData (array, data, frame) {
  var i, j, ptr = 0, c
  if (array.shape.length === 4) {
    return handleData(array.pick(frame), data, 0)
  } else if (array.shape.length === 3) {
    if (array.shape[2] === 3) {
      ops.assign(
        ndarray(data,
          [array.shape[0], array.shape[1], 3],
          [4, 4 * array.shape[0], 1]),
        array)
      ops.assigns(
        ndarray(data,
          [array.shape[0] * array.shape[1]],
          [4],
          3),
        255)
    } else if (array.shape[2] === 4) {
      ops.assign(
        ndarray(data,
          [array.shape[0], array.shape[1], 4],
          [4, array.shape[0] * 4, 1]),
        array)
    } else if (array.shape[2] === 1) {
      ops.assign(
        ndarray(data,
          [array.shape[0], array.shape[1], 3],
          [4, 4 * array.shape[0], 1]),
        ndarray(array.data,
          [array.shape[0], array.shape[1], 3],
          [array.stride[0], array.stride[1], 0],
          array.offset))
      ops.assigns(
        ndarray(data,
          [array.shape[0] * array.shape[1]],
          [4],
          3),
        255)
    } else {
      return new Error('Incompatible array shape')
    }
  } else if (array.shape.length === 2) {
    ops.assign(
      ndarray(data,
        [array.shape[0], array.shape[1], 3],
        [4, 4 * array.shape[0], 1]),
      ndarray(array.data,
        [array.shape[0], array.shape[1], 3],
        [array.stride[0], array.stride[1], 0],
        array.offset))
    ops.assigns(
      ndarray(data,
        [array.shape[0] * array.shape[1]],
        [4],
        3),
      255)
  } else {
    return new Error('Incompatible array shape')
  }
  return data
}

function haderror (err) {
  var result = through()
  result.emit('error', err)
  return result
}

module.exports = function savePixels (array, type, options) {
  options = options || {}
  switch (type.toUpperCase()) {
    case 'CANVAS':
      var canvas = document.createElement('canvas')
      var context = canvas.getContext('2d')
      canvas.width = array.shape[0]
      canvas.height = array.shape[1]
      var imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      var data = imageData.data
      data = handleData(array, data)
      if (typeof data === 'Error') return haderror(data)
      context.putImageData(imageData, 0, 0)
      return canvas

    default:
      return haderror(new Error('Unsupported file type: ' + type))
  }
}
