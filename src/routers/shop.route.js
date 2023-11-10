const express = require('express')
const router = express.Router()
const shopController = require('../controllers/shop.controller')
const tokenMiddleware = require('../middlewares/token.middleware')
const { checkAdmin } = require('../middlewares/role.middleware')

router.get('/index(/:pageNumber?)', checkAdmin, shopController.renderIndexPage)

router.get('/edit/:shopId', checkAdmin, shopController.renderEditPage)

router.get('/add', checkAdmin, shopController.renderAddPage)

router.get(
  '/search/(:name?)(/:pageNumber?)',
  checkAdmin,
  shopController.renderSearchPage
)

router.post('/add', tokenMiddleware.authServer, shopController.add)

router.get('/list', shopController.getList)

router.delete(
  '/:shopId',
  checkAdmin,
  tokenMiddleware.authServer,
  shopController.removeShop
)

router.delete(
  '/',
  checkAdmin,
  tokenMiddleware.authServer,
  shopController.removeShops
)

router.put('/update', tokenMiddleware.authServer, shopController.update)

module.exports = router
