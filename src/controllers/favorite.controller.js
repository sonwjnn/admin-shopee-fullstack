const express = require('express')
const router = express.Router()
const responseHandler = require('../handlers/response.handler.js')

const favoriteModel = require('../models/favorite.model.js')
const userModel = require('../models/user.model.js')

const getFavoritesOfUser = async (req, res) => {
  try {
    const favorite = await favoriteModel
      .find({ user: req.user.id })
      .sort('-createdAt')

    return responseHandler.ok(res, favorite)
  } catch (error) {
    responseHandler.error(res)
  }
}

const addFavorite = async (req, res) => {
  try {
    const isFavorite = await favoriteModel.findOne({
      user: req.user.id,
      productId: req.body.productId
    })
    if (isFavorite) return responseHandler.ok(res, isFavorite)

    const favorite = new favoriteModel({
      ...req.body,
      user: req.user.id
    })
    await favorite.save()

    responseHandler.created(res, favorite)

    res.send({ kq: 1, data, msg: 'Add favorite successfully.' })
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
    console.log(error)
    responseHandler.error(res)
  }
}

module.exports = {
  getFavoritesOfUser,
  addFavorite,
  removeFavorite,
  removeFavorites
}
