const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  res.redirect('/admin/dashboards/index')
})

// api
router.use('/api/permission', require('../apis/A_Permission.js'))
router.use('/api/categories', require('../apis/A_Categories.js'))
router.use('/api/products', require('../apis/A_Products.js'))
router.use('/api/permission/cart', require('../apis/A_Carts.js'))
router.use('/api/permission/users', require('../apis/A_Users.js'))

// admin
router.use('/admin', require('../routers/R_Admins.js'))
router.use('/admin/dashboards', require('../routers/R_Dashboards'))
router.use('/admin/categories', require('../routers/R_Categories'))
router.use('/admin/products', require('../routers/R_Products'))
router.use('/admin/users', require('../routers//R_Users'))
router.use('/admin/prolife', require('../routers//R_Prolife'))
router.use('/admin/password', require('../routers/R_Password.js'))

// user
router.use('/user', require('../routers/RU_Users.js'))

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
