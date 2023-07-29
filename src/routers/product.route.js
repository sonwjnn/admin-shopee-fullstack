const express = require('express')
const tokenMiddleware = require('../middlewares/token.middleware')
const productController = require('../controllers/product.controller')
const router = express.Router({ mergeParams: true })
const { body } = require('express-validator')
const requestHandler = require('../handlers/request.handler')

router.get('/index(/:pageNumber?)', productController.renderIndexPage)

router.get(
  '/search/(:name?)(/:pageNumber?)',
  productController.renderSearchPage
)

router.get('/edit/:productId', productController.renderEditPage)

router.get('/add', productController.renderAddPage)

// add product
router.post(
  '/add',
  tokenMiddleware.authServer,
  body('name')
    .exists()
    .withMessage('Name is required')
    .isLength({ min: 8, max: 50 })
    .withMessage('Name must have a maximum of 50 characters'),
  body('origin')
    .exists()
    .withMessage('Origin is required')
    .isLength({ min: 2, max: 20 }),
  body('price')
    .exists()
    .withMessage('Price is required')
    .isInt({ min: 1 })
    .withMessage('Price must be a positive integer'),
  body('originalImageName')
    .exists()
    .withMessage('Image is required')
    .isLength({ min: 10, max: 100 })
    .withMessage('Image name must have a minmum of 10 characters'),
  body('productType').exists().withMessage('Product type is required'),
  body('cateType').exists().withMessage('Category type is required'),
  body('producedAt').exists().withMessage('Produced at is required'),
  body('info').exists().withMessage('Product info is required'),
  body('discount')
    .optional()
    .isNumeric({ min: 0, max: 100 })
    .withMessage('Discount must be a number between 0 and 100'),
  body('status').exists().withMessage('Status is required'),
  requestHandler.validate,
  productController.addProduct
)

router.get('/list', productController.getList)

router.get('/detail/:productId', productController.getDetail)

// update product
router.put(
  '/update',
  tokenMiddleware.authServer,
  body('name')
    .exists()
    .withMessage('Name is required')
    .isLength({ min: 8, max: 50 })
    .withMessage('Name must have a maximum of 50 characters'),
  body('origin')
    .exists()
    .withMessage('Origin is required')
    .isLength({ min: 2, max: 20 }),
  body('price')
    .exists()
    .withMessage('Price is required')
    .isInt({ min: 1 })
    .withMessage('Price must be a positive integer'),
  body('productType').exists().withMessage('Product type is required'),
  body('cateType').exists().withMessage('Category type is required'),
  body('producedAt').exists().withMessage('Produced at is required'),
  body('info').exists().withMessage('Product info is required'),
  body('discount')
    .optional()
    .isNumeric({ min: 0, max: 100 })
    .withMessage('Discount must be a number between 0 and 100'),
  body('status').exists().withMessage('Status is required'),
  requestHandler.validate,
  productController.update
)

router.delete(
  '/:productId',
  tokenMiddleware.authServer,
  productController.removeProduct
)

router.delete('/', tokenMiddleware.authServer, productController.removeProducts)

router.post(
  '/upload-image',
  tokenMiddleware.authServer,
  productController.uploadImage
)

module.exports = router
