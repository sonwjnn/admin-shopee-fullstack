const express = require('express')
const productController = require('../controllers/product.controller.js')

const router = express.Router({ mergeParams: true })

router.get('/list', productController.getList)

module.exports = router
