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
  requestHandler.validate,
  reviewController.create
)

router.delete('/:reviewId', tokenMiddleware.auth, reviewController.remove)

module.exports = router
