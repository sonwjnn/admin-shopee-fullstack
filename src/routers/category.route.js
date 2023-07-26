const express = require('express')
const router = express.Router()
const cateController = require('../controllers/category.controller')
const tokenMiddleware = require('../middlewares/token.middleware')

router.get('/index(/:pageNumber?)', cateController.renderIndexPage)

router.get('/edit/:cateId', cateController.renderEditPage)

router.get('/add', cateController.renderAddPage)

router.get('/search/(:name?)(/:pageNumber?)', cateController.renderSearchPage)

router.post('/add', tokenMiddleware.authServer, cateController.add)

router.get('/list', cateController.getList)

router.delete('/:cateId', tokenMiddleware.authServer, cateController.removeCate)

router.delete('/', tokenMiddleware.authServer, cateController.removeCates)

router.put('/update', tokenMiddleware.authServer, cateController.update)

module.exports = router
