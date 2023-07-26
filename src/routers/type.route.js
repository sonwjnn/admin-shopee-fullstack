const express = require('express')
const router = express.Router()
const typeController = require('../controllers/type.controller')
const tokenMiddleware = require('../middlewares/token.middleware')

router.get('/index(/:pageNumber?)', typeController.renderIndexPage)

router.get('/search/(:name?)(/:pageNumber?)', typeController.renderSearchPage)

router.get('/add', typeController.renderAddPage)

router.get('/edit/:typeId', typeController.renderEditPage)

router.put('/update', tokenMiddleware.authServer, typeController.update)

router.post('/add', tokenMiddleware.authServer, typeController.add)

router.get('/list', typeController.getList)

router.delete('/:typeId', tokenMiddleware.authServer, typeController.removeType)

router.delete('/', tokenMiddleware.authServer, typeController.removeTypes)

router.get('/by-name/:name', typeController.getInfoByName)

module.exports = router
