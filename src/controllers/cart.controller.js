const responseHandler = require('../handlers/response.handler.js')

const cartModel = require('../models/cart.model.js')

const getCartsOfUser = async (req, res) => {
  try {
    const cart = await cartModel
      .find({ user: req.user.id })
      .populate('productId')
      .sort('-createdAt')

    return responseHandler.ok(res, cart)
  } catch (error) {
    responseHandler.error(res)
  }
}

const updateCart = async (req, res) => {
  try {
    const { cartId } = req.body
    const cart = await cartModel.findOne({ _id: cartId })
    if (!cart) return responseHandler.notfound(res)
    cart.setInfo({ ...req.body })
    await cart.save()
    return responseHandler.ok(res, { message: 'Update cart successfully!' })
  } catch (error) {
    responseHandler.error(res)
  }
}

const addCart = async (req, res) => {
  try {
    const isCart = await cartModel.findOne({
      user: req.user.id,
      productId: req.body.productId
    })
    if (isCart) {
      isCart.quantity = req.body.quantity
      await isCart.save()
      return responseHandler.ok(res, isCart)
    }

    const cart = new cartModel({
      ...req.body,
      user: req.user.id
    })
    await cart.save()

    responseHandler.created(res, cart)
  } catch (error) {
    responseHandler.error(res)
  }
}

const removeCart = async (req, res) => {
  try {
    const { cartId } = req.params

    const cart = await cartModel.findOne({
      user: req.user.id,
      _id: cartId
    })

    if (!cart) return responseHandler.notfound(res)

    await cart.deleteOne()

    return responseHandler.ok(res)
  } catch (error) {
    responseHandler.error(res)
  }
}

const removeCarts = async (req, res) => {
  try {
    const { cartIds } = req.body
    console.log(cartIds)
    const carts = await cartModel.find({
      user: req.user.id,
      _id: { $in: cartIds }
    })

    if (!carts) return responseHandler.notfound(res)
    await cartModel.deleteMany({
      user: req.user.id,
      _id: { $in: cartIds }
    })

    return responseHandler.ok(res)
  } catch (error) {
    console.log(error)
    responseHandler.error(res)
  }
}

module.exports = {
  getCartsOfUser,
  addCart,
  removeCart,
  removeCarts,
  updateCart
}
