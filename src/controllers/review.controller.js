const reviewModel = require('../models/M_Reviews')
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
    responseHandler.error(error)
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

    responseHandler.ok(res)
  } catch (error) {
    responseHandler.error(error)
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
    responseHandler.error(error)
  }
}

module.exports = { create, remove, getReviewsOfUser }
