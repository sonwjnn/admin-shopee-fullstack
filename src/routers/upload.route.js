const express = require('express')
const {
  uploadImages,
  deleteImages
} = require('../controllers/upload.controller')
const { isAdmin } = require('../middlewares/role.middleware')
const { authServer } = require('../middlewares/token.middleware')
const {
  uploadPhoto,
  productImgResize
} = require('../middlewares/upload.middleware')

const router = express.Router()

router.post(
  '/',
  authServer,
  uploadPhoto.array('product-images', 10),
  productImgResize,
  uploadImages
)

router.delete('/:id', authServer, isAdmin, deleteImages)

module.exports = router
