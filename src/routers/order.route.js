const express = require('express')
const router = express.Router()
const orderController = require('../controllers/order.controller')
const tokenMiddleware = require('../middlewares/token.middleware')

// router.get('/index(/:pageNumber?)', orderController.renderIndexPage)
// router.get('/edit/:orderId', orderController.renderEditPage)
// router.get('/add', orderController.renderAddPage)
// router.get('/search/(:name?)(/:pageNumber?)', orderController.renderSearchPage)

router.get('/index(/:pageNumber?)', orderController.renderIndexPage)

router.get('/search/(:name?)(/:pageNumber?)', orderController.renderSearchPage)

router.get('/edit/:orderId', orderController.renderEditPage)

router.get('/', tokenMiddleware.auth, orderController.getList)

router.get(
  '/income',
  tokenMiddleware.authServer,
  orderController.getMonthlyIncomeOrder
)

router.get(
  '/find/:userId',
  tokenMiddleware.auth,
  orderController.getOrdersByUserId
)

router.post('/', tokenMiddleware.auth, orderController.createOrder)

router.put('/:orderId', tokenMiddleware.authServer, orderController.updateOrder)

router.delete('/:id', tokenMiddleware.authServer, orderController.removeOrder)
// router.delete('/', tokenMiddleware.authServer, orderController.removeOrders)

router.get('/detail/:orderId', orderController.getDetailOrderItem)

module.exports = router
