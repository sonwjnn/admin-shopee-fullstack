const express = require('express')
const router = express.Router()
const responseHandler = require('../handlers/response.handler.js')

const cartModel = require('../models/M_Carts.js')
const userModel = require('../models/M_Users')

const getCartsOfUser = async (req, res) => {
  try {
    const cart = await cartModel.find({ user: req.user.id }).sort('-createdAt')

    return responseHandler.ok(res, cart)
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
      isCart.quantity = (+isCart.quantity + +req.body.quantity).toString()
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
    console.log(error)
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
    const cartIds = req.body
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

// router.post('/updateStatus', function (req, res) {
//   var status = (idUser = token = address = phone = '')
//   var flagError = 0
//   /*  var arr = JSON.parse(req.body.arr); */

//   var arr = JSON.parse(req.body.arr)
//   token = req.body.token
//   phone = req.body.phone
//   address = req.body.address
//   status = 'done'

//   if (token == '' || token == undefined) {
//     res.send({ kq: 0, msg: 'None user' })
//   } else {
//     jwt.verify(token, secret, function (err, decoded) {
//       if (err) {
//         // token expired!
//         res.send({ kq: 0, msg: 'token expired' })
//       } else {
//         if (decoded.data != '') {
//           idUser = decoded.data

//           for (var i = 0; i < arr.arr.length; i++) {
//             const obj = { phone, address, status }

//             cartModel.updateMany(
//               { idUser: idUser, idProduct: arr.arr[i], status: 'ready' },
//               obj,
//               (err, data) => {
//                 if (err) {
//                   flagError = 1
//                   throw err
//                 }
//               }
//             )
//           }

//           if (flagError == 0) {
//             res.send({ kq: 1, msg: 'Update data successfully' })
//           } else {
//             res.send({ kq: 0, msg: 'Error DB' })
//           }
//         } else {
//           res.send({ kq: 0, msg: 'No data!' })
//         }
//       }
//     })
//   }
// })

// router.post('/delete', function (req, res) {
//   var idUser = req.body.idUser
//   var idProduct = req.body.idProduct

//   const check_obj = { idUser, idProduct }
//   cartModel.find(check_obj).exec((err, data) => {
//     if (err) {
//       res.send({ kq: 0, msg: 'Connection to database failed' })
//     }

//     if (data == '') {
//       res.send({ kq: 0, msg: 'Data id not exists' })
//     } else {
//       cartModel.findByIdAndDelete({ _id: data[0]._id }, (err, data) => {
//         if (err) {
//           res.send({ kq: 0, msg: 'Connection to database failed' })
//         } else res.send({ kq: 1, msg: 'Delete data successfully!' })
//       })
//     }
//   })
// })

module.exports = { getCartsOfUser, addCart, removeCart, removeCarts }
