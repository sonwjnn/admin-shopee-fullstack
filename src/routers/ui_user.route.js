const express = require('express')
const router = express.Router()

router.get('/index', (req, res) => {
  var index = 'categories'
  var main = 'ui_User/index'
  res.render('index', { main, index, role: req.user.role })
})

module.exports = router
