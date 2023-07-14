const express = require('express')
const categoryController = require('../controllers/category.controller.js')

const router = express.Router({ mergeParams: true })

router.get('/getAllCate', categoryController.getList)

module.exports = router
