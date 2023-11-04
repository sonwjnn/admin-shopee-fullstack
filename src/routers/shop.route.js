const express = require('express')
const router = express.Router()
const shopController = require('../controllers/shop.controller')
const tokenMiddleware = require('../middlewares/token.middleware')

router.get('/index(/:pageNumber?)', shopController.renderIndexPage)

router.get('/edit/:shopId', shopController.renderEditPage)

router.get('/add', shopController.renderAddPage)

router.get('/search/(:name?)(/:pageNumber?)', shopController.renderSearchPage)

router.post('/add', tokenMiddleware.authServer, shopController.add)

router.get('/list', shopController.getList)

router.delete('/:shopId', tokenMiddleware.authServer, shopController.removeShop)

router.delete('/', tokenMiddleware.authServer, shopController.removeShops)

router.put('/update', tokenMiddleware.authServer, shopController.update)

module.exports = router
