const express = require('express')
const productController = require('../controllers/product.controller.js')

const router = express.Router({ mergeParams: true })

router.get('/list', productController.getList)
router.get('/detail/:productId', productController.getDetail)
router.get('/list/slug/:cateSlug', productController.getProductsOfCateBySlug)
router.get('/list/shop/:shopId', productController.getProductsByShopId)
router.get('/image/:imageName', productController.getImage)
router.post('/list/category', productController.getListByCategory)

module.exports = router
