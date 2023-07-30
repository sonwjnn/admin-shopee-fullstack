const express = require('express')
const categoryController = require('../controllers/category.controller.js')

const router = express.Router({ mergeParams: true })

router.get('/list', categoryController.getList)

module.exports = router
