const express = require('express')
const router = express.Router()

router.get('/index', (req, res) => {
  var index = 'dashboard'
  var main = 'dashboards/main'
  res.render('index', { main, index })
})

module.exports = router
