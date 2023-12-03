const fs = require('fs')
const responseHandler = require('../handlers/response.handler')
const {
  cloudinaryUploadImg,
  cloudinaryDeleteImg
} = require('../utilities/cloudinary')

const uploadImages = async (req, res) => {
  try {
    const uploader = path =>
      cloudinaryUploadImg(path, { folder: 'product-images' })
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
    responseHandler.error(res)
  }
}
const deleteImages = async (req, res) => {
  const { id } = req.params
  try {
    const deleted = cloudinaryDeleteImg(id, 'images')
    return responseHandler.ok(res, 'Images successfully deleted')
  } catch (error) {
    responseHandler.error(res)
  }
}

module.exports = {
  uploadImages,
  deleteImages
}
