const fs = require('fs')
const responseHandler = require('../handlers/response.handler')
const {
  cloudinaryUploadImage,
  cloudinaryDeleteImage
} = require('../utils/helpers')

const uploadImages = async (req, res) => {
  try {
    const uploader = path => cloudinaryUploadImage(path, 'product-images')
    const urls = []
    const files = req.files
    for (const file of files) {
      const { path } = file
      const newpath = await uploader(path)
      urls.push(newpath)
      fs.unlinkSync(path)
    }
    const images = urls.map(file => {
      return file
    })
    responseHandler.ok(res, images)
  } catch (error) {
    console.log(error)
    responseHandler.error(res)
  }
}

const deleteImages = async (req, res) => {
  try {
    const { publicIds } = req.body
    for (const id of publicIds) {
      await cloudinaryDeleteImage(id)
    }
    responseHandler.ok(res)
  } catch (error) {
    responseHandler.error(res)
  }
}

module.exports = {
  uploadImages,
  deleteImages
}
