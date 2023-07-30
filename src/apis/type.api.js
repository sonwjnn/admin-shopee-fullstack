const express = require('express')
const typeController = require('../controllers/type.controller')

const router = express.Router({ mergeParams: true })

router.get('/list', typeController.getList)
router.get('/list/:cateName', typeController.getTypesOfCate)

module.exports = router
