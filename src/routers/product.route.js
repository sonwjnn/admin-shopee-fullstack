const express = require('express')
const multer = require('multer')
const tokenMiddleware = require('../middlewares/token.middleware')
const productController = require('../controllers/product.controller')
const router = express.Router({ mergeParams: true })

router.get('/index(/:pageNumber?)', productController.renderIndexPage)

router.get(
  '/search/(:name?)(/:pageNumber?)',
  productController.renderSearchPage
)
router.get('/edit/:productId', productController.renderEditPage)

router.get('/add', productController.renderAddPage)

router.post('/add', tokenMiddleware.authServer, productController.addProduct)

router.get('/list', productController.getList)

router.get('/detail/:productId', productController.getDetail)

router.put('/update', tokenMiddleware.authServer, productController.update)

router.delete(
  '/:productId',
  tokenMiddleware.authServer,
  productController.removeProduct
)

router.delete('/', tokenMiddleware.authServer, productController.removeProducts)

// Declare destination and limit of image size
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/assets/img/products')
  },
  filename: function (req, file, cb) {
    if (
      file.mimetype !== 'image/png' &&
      file.mimetype !== 'image/jpg' &&
      file.mimetype !== 'image/jpeg'
    ) {
      return cb(new Error('Wrong type file'))
    }

    // Change image name to be unique and remove whitespace
    const [name, type] = file.originalname.split('.')
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const arrAfter = name + '-' + uniqueSuffix + '.' + type
    const imageNameSend = arrAfter.replace(/ /g, '-')
    cb(null, imageNameSend)
  }
})

const limits = { fileSize: 3072000 }
const upload = multer({ storage, limits }).single('productsImage')

// Upload products image
router.post('/upLoadFile', function (req, res) {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.send({ kq: 0, msg: err.message })
    } else if (err) {
      return res.send({ kq: 0, msg: err.message })
    }

    // The image was uploaded successfully
    const imageNameSend = req.file.filename
    const imageNameReal = req.file.originalname

    return res.send({
      kq: 1,
      imageNameSend,
      imageNameReal
    })
  })
})

module.exports = router
