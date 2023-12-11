const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
})

const cloudinaryUploadImage = async (file, folder = '') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(file, { folder }, (error, result) => {
      if (error || !result || !result.secure_url) {
        reject(error || new Error('Upload failed'))
      } else {
        resolve(
          {
            url: result.secure_url,
            asset_id: result.asset_id,
            public_id: result.public_id
          },
          {
            resource_type: 'auto'
          }
        )
      }
    })
  })
}

const cloudinaryDeleteImage = async (file, folder = '') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(file, { folder }, (error, result) => {
      if (error || !result || !result.secure_url) {
        reject(error || new Error('Upload failed'))
      } else {
        resolve(
          {
            url: result.secure_url,
            asset_id: result.asset_id,
            public_id: result.public_id
          },
          {
            resource_type: 'auto'
          }
        )
      }
    })
  })
}

module.exports = { cloudinaryUploadImage, cloudinaryDeleteImage }
