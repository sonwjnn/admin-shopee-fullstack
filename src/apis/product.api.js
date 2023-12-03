const express = require('express')
const productController = require('../controllers/product.controller.js')

const router = express.Router({ mergeParams: true })

router.get('/list', productController.getList)
router.get('/detail/:productId', productController.getDetail)
router.get('/list/:cateName', productController.getProductOfCate)
router.get('/list/shop/:shopId', productController.getProductByShopId)
router.get('/image/:imageName', productController.getImage)

module.exports = router
