const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  res.redirect('/admin/dashboards/index')
})

// custom
router.use('/categories', require('../apis/A_Categories.js'))

// admin
router.use('/admin', require('../routers/R_Admins.js'))
router.use('/admin/dashboards', require('../routers/R_Dashboards'))
router.use('/admin/categories', require('../routers/R_Categories.js'))
router.use('/admin/products', require('../routers/R_Products'))
router.use('/admin/users', require('../routers/R_Users'))
router.use('/admin/profile', require('../routers/R_Profile'))
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
