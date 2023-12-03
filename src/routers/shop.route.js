const express = require('express')
const router = express.Router()
const shopController = require('../controllers/shop.controller')
const tokenMiddleware = require('../middlewares/token.middleware')
const { isAdmin } = require('../middlewares/role.middleware')

router.get('/index(/:pageNumber?)', isAdmin, shopController.renderIndexPage)

router.get('/edit/:shopId', isAdmin, shopController.renderEditPage)

router.get('/add', isAdmin, shopController.renderAddPage)

router.get(
  '/search/(:name?)(/:pageNumber?)',
  isAdmin,
  shopController.renderSearchPage
)

router.post('/add', tokenMiddleware.authServer, shopController.add)

router.get('/list', shopController.getList)

router.delete(
  '/:shopId',
  isAdmin,
  tokenMiddleware.authServer,
  shopController.removeShop
)

router.delete(
  '/',
  isAdmin,
  tokenMiddleware.authServer,
  shopController.removeShops
)

router.put('/update', tokenMiddleware.authServer, shopController.update)

module.exports = router
