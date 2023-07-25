const reviewModel = require('../models/review.model')
const responseHandler = require('../handlers/response.handler')

const create = async (req, res) => {
  try {
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
  } catch (error) {
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

    await review.deleteOne()

    return responseHandler.ok(res)
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
