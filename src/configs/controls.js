const express = require('express')
const { isAdmin } = require('../middlewares/role.middleware')
const router = express.Router()

router.get('/', (req, res) => {
  res.redirect('/admin/dashboards/index')
})

// client
router.use('/categories', require('../apis/category.api'))
router.use('/product-types', require('../apis/type.api'))
router.use('/products', require('../apis/product.api'))
router.use('/user', require('../apis/user.api'))
router.use('/reviews', require('../apis/review.api'))
router.use('/shops', require('../apis/shop.api'))
router.use('/user/orders', require('../routers/order.route'))

// api
router.use('/api', require('../routers/stripe.route'))

// admin
router.use('/admin', require('../routers/admin.route'))
router.use('/admin/dashboards', require('../routers/dashboard.route'))
router.use('/admin/categories', require('../routers/category.route'))
router.use('/admin/products', require('../routers/product.route'))
router.use('/admin/users', require('../routers/user.route'))
router.use('/admin/profile', require('../routers/profile.route'))
router.use('/admin/shops', require('../routers/shop.route'))
router.use('/admin/orders', require('../routers/order.route'))
router.use('/admin/password', require('../routers/password.route'))
router.use('/admin/product-types', require('../routers/type.route'))
router.use('/admin/upload', require('../routers/upload.route'))

// user
router.use('/user', require('../routers/ui_user.route'))

//cookie
router.get('/createCookie', (req, res) => {
  res.cookie('key', 'value', { maxAge: 20000 }).send('Cookie created.')
})

router.get('/useCookie', (req, res) => {
  res.send(req.cookies.key)
})

router.get('/deleteCookie', (req, res) => {
  res.clearCookie('token').send('Cookie deleted.')
})

router.use(function (req, res, next) {
  res.render('404page')
})

module.exports = router
