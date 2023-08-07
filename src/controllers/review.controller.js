const reviewModel = require('../models/review.model')
const responseHandler = require('../handlers/response.handler')
const productModel = require('../models/product.model')

const create = async (req, res) => {
  try {
    const { productId } = req.body

    const review = new reviewModel({
      user: req.user.id,
      ...req.body
    })

    await review.save()

    responseHandler.created(res, {
      ...review._doc,
      id: review._id,
      user: req.user
    })

    // set new rating for product
    const ratings = await reviewModel.find({ productId }).select('rating')

    const product = await productModel.findOne({ _id: productId })

    const productRating = (
      ratings.reduce((acc, rating) => acc + +rating.rating, 0) / ratings.length
    ).toFixed(1)

    product.rating = productRating

    await product.save()
  } catch (error) {
    console.log(error)
    responseHandler.error(res)
  }
}

const remove = async (req, res) => {
  try {
    const { reviewId } = req.params

    const review = await reviewModel.findOne({
      _id: reviewId,
      user: req.user.id
    })

    if (!review) return responseHandler.notfound(res)

    const productId = review.productId

    await review.deleteOne()

    responseHandler.ok(res)

    const ratings = await reviewModel.find({ productId }).select('rating')

    const product = await productModel.findOne({ _id: productId })

    const productRating = (
      ratings.reduce((acc, rating) => acc + +rating.rating, 0) / ratings.length
    ).toFixed(1)

    product.rating = productRating

    await product.save()
  } catch (error) {
    responseHandler.error(res)
  }
}

const getReviewsOfUser = async (req, res) => {
  try {
    const reviews = await reviewModel
      .find({
        user: req.user.id
      })
      .sort('-createdAt')

    responseHandler.ok(res, reviews)
  } catch (error) {
    responseHandler.error(res)
  }
}

module.exports = { create, remove, getReviewsOfUser }
