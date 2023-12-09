const express = require('express')

const shopController = require('../controllers/shop.controller.js')
const tokenMiddleware = require('../middlewares/token.middleware')

const router = express.Router({ mergeParams: true })

router.post('/', tokenMiddleware.auth, shopController.add)

router.get('/', shopController.getList)
router.get('/info', tokenMiddleware.auth, shopController.getInfoByUserId)
router.get('/detail/:shopId', shopController.getDetail)

router.put('/', tokenMiddleware.auth, shopController.update)

module.exports = router
