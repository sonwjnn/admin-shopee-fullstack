const express = require('express')
const typeController = require('../controllers/type.controller')

const router = express.Router({ mergeParams: true })

router.get('/list', typeController.getList)
router.get('/list/:cateName', typeController.getTypesOfCate)
router.get('/list/shop/:shopId', typeController.getTypesByShopId)

module.exports = router
