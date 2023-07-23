const express = require('express')
const { body } = require('express-validator')
const tokenMiddleware = require('../middlewares/token.middleware')
const reviewController = require('../controllers/review.controller')
const requestHandler = require('../handlers/request.handler')

const router = express.Router({ mergeParams: true })

router.get('/', tokenMiddleware.auth, reviewController.getReviewsOfUser)

router.post(
  '/',
  tokenMiddleware.auth,
  // body('productId')
  //   .exists()
  //   .withMessage('productId is required')
  //   .isLength({ min: 1 })
  //   .withMessage('product id cannot empty'),
  // body('content')
  //   .exists()
  //   .withMessage('content is required')
  //   .isLength({ min: 1 })
  //   .withMessage('content cannot empty'),
  // body('productType')
  //   .exists()
  //   .withMessage('product type  is required')
  //   .custom(type => ['movie', 'tv'].includes(type))
  //   .withMessage('product type invalid'),
  // body('productTitle').exists().withMessage('product title is required'),
  // body('productImage')
  //   .exists()
  //   .withMessage('product img title is required'),

  requestHandler.validate,
  reviewController.create
)

router.delete('/:reviewId', tokenMiddleware.auth, reviewController.remove)

module.exports = router
