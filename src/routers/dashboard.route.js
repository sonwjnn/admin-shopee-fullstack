const express = require('express')
const router = express.Router()
const { USER_ROLE } = require('../utilities/constants')

router.get('/index', (req, res) => {
  var index = 'dashboard'
  var main = 'dashboards/main'
  res.render('index', { main, index, role: req.user.role, USER_ROLE })
})

module.exports = router
