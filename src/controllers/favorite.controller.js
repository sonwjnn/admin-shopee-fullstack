const responseHandler = require('../handlers/response.handler.js')
const productModel = require('../models/product.model.js')
const favoriteModel = require('../models/favorite.model.js')

const getFavoritesOfUser = async (req, res) => {
  try {
    const favorite = await favoriteModel
      .find({ user: req.user.id })
      .populate('productId')
      .sort('-createdAt')

    return responseHandler.ok(res, favorite)
  } catch (error) {
    responseHandler.error(res)
  }
}

const addFavorite = async (req, res) => {
  try {
    const { productId } = req.body
    const isFavorite = await favoriteModel.findOne({
      user: req.user.id,
      productId: productId
    })
    if (isFavorite) return responseHandler.ok(res, isFavorite)

    const favorite = new favoriteModel({
      ...req.body,
      user: req.user.id
    })

    await favorite.save()

    const product = await productModel.findOne({ _id: productId })
    product.favorites = +product.favorites + 1

    await product.save()

    responseHandler.created(res, favorite)
  } catch (error) {
    responseHandler.error(res)
  }
}

const removeFavorite = async (req, res) => {
  try {
    const { favoriteId } = req.params

    const favorite = await favoriteModel.findOne({
      user: req.user.id,
      _id: favoriteId
    })

    if (!favorite) return responseHandler.notfound(res)
    const product = await productModel.findOne({ _id: favorite.productId })
    product.favorites = +product.favorites - 1

    await product.save()

    await favorite.deleteOne()

    return responseHandler.ok(res)
  } catch (error) {
    responseHandler.error(res)
  }
}

const removeFavorites = async (req, res) => {
  try {
    const favoriteIds = req.body
    const favorites = await favoriteModel.find({
      user: req.user.id,
      _id: { $in: favoriteIds }
    })

    if (!favorites) return responseHandler.notfound(res)
    await favoriteModel.deleteMany({
      user: req.user.id,
      _id: { $in: favoriteIds }
    })

    return responseHandler.ok(res)
  } catch (error) {
    responseHandler.error(res)
  }
}

module.exports = {
  getFavoritesOfUser,
  addFavorite,
  removeFavorite,
  removeFavorites
}
