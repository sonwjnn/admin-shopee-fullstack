const express = require('express')
const { body } = require('express-validator')
const tokenMiddleware = require('../middlewares/token.middleware.js')
const router = express.Router()
const cartController = require('../controllers/cart.controller.js')
const favoriteController = require('../controllers/favorite.controller.js')
const userController = require('../controllers/user.controller.js')
const orderController = require('../controllers/order.controller.js')

const bcrypt = require('bcryptjs')
const salt = bcrypt.genSaltSync(10)

router.post('/update', function (req, res) {
  const id = req.body.id
  const username = req.body.username
  const name = req.body.name
  const email = req.body.email
  const phone = req.body.phone
  const address = req.body.address
  const city = req.body.city
  const district = req.body.district
  const sex = req.body.sex
  const birthday = req.body.birthday
  const story = req.body.story

  let error = ''
  let flag = 1

  if (flag == 1) {
    const obj = {
      name,
      email,
      phone,
      address,
      city,
      district,
      sex,
      birthday,
      story
    }
    // check username or email or phone
    const check_obj = { $or: [{ email }, { phone }] }

    userModel.find(check_obj).exec((err, data) => {
      if (err) {
        res.send({ kq: 0, msg: 'Connection to database failed' })
      } else {
        if (data.length == 0) {
          userModel.updateMany({ username: username }, obj, (err, data) => {
            if (err) {
              res.send({ kq: 0, msg: 'Connection to database failed' })
            } else {
              res.send({ kq: 1, msg: 'Update data successfully' })
            }
          })
        } else if (data.length == 1) {
          if (data[0]._id == id) {
            userModel.updateMany({ username: username }, obj, (err, data) => {
              if (err) {
                res.send({ kq: 0, msg: 'Connection to database failed' })
              } else {
                res.send({ kq: 1, msg: 'Update data successfully' })
              }
            })
          } else {
            res.send({
              kq: 0,
              msg: 'Data already exists! <br> Please check again your phone and email.'
            })
          }
        } else {
          res.send({
            kq: 0,
            msg: 'Data already exists! <br> Please check again your phone and email.'
          })
        }
      }
    })
  } else {
    res.send({ kq: 0, msg: error })
  }
})

router.post('/updatePassword', function (req, res) {
  const username = req.body.username
  const oldPass = req.body.oldPass

  let newPass = req.body.newPass
  let flag = 1
  let password = ''

  newPass = bcrypt.hashSync(newPass, salt)
  const obj = {
    password: newPass
  }

  if (flag === 1) {
    const check_obj = { $or: [{ username }] }
    userModel.find(check_obj).exec((err, data) => {
      if (err) {
        res.send({ kq: 0, msg: 'Connection to database failed' })
      } else {
        password = data[0].password
        if (bcrypt.compareSync(oldPass, password)) {
          userModel.updateMany({ username: username }, obj, (err, data) => {
            if (err) {
              res.send({ kq: 0, msg: 'Connection to database failed' })
            } else {
              res.send({ kq: 1, msg: 'Update password successfully' })
            }
          })
        } else {
          res.send({ kq: 0, msg: 'The password you entered is not correct!' })
        }
      }
    })
  }
})

router.post(
  '/signin',
  // body('username')
  //   .exists()
  //   .withMessage('username is required')
  //   .isLength({ min: 9 })
  //   .withMessage('username minium 8 characters'),
  // body('password')
  //   .exists()
  //   .withMessage('password is required')
  //   .isLength({ min: 9 })
  //   .withMessage('password minium 8 characters'),
  // requestHandler.validate,
  userController.signin
)

router.post(
  '/signup',
  // body('username')
  //   .exists()
  //   .withMessage('username is required')
  //   .isLength({ min: 9 })
  //   .withMessage('username minium 8 characters')
  //   .custom(async value => {
  //     const user = await userModel.findOne({ username: value })
  //     if (user) return Promise.reject('username already used')
  //   }),
  // body('password')
  //   .exists()
  //   .withMessage('password is required')
  //   .isLength({ min: 9 })
  //   .withMessage('password minium 8 characters'),
  // body('confirmPassword')
  //   .exists()
  //   .withMessage('confirm password is required')
  //   .isLength({ min: 9 })
  //   .withMessage('confirm password minium 8 characters')
  //   .custom((value, { req }) => {
  //     if (value !== req.body.password)
  //       throw new Error('confirm password not match')
  //     return true
  //   }),
  // body('displayName')
  //   .exists()
  //   .withMessage('display name is required')
  //   .isLength({ min: 9 })
  //   .withMessage('displayName minium 8 characters'),
  // requestHandler.validate,
  userController.signup
)

router.put(
  '/update-password',

  tokenMiddleware.auth,

  // body("password")
  //   .exists()
  //   .withMessage("password is required")
  //   .isLength({ min: 9 })
  //   .withMessage("password minium 8 characters"),
  // body("newPassword")
  //   .exists()
  //   .withMessage("new password is required")
  //   .isLength({ min: 9 })
  //   .withMessage("new password minium 8 characters"),
  // body("confirmNewPassword")
  //   .exists()
  //   .withMessage("confirm new password is required")
  //   .isLength({ min: 9 })
  //   .withMessage("confirm new password minium 8 characters")
  //   .custom((value, { req }) => {
  //     if (value !== req.body.newPassword)
  //       throw new Error("confirm new password not match");
  //     return true;
  //   }),
  // requestHandler.validate,
  userController.updatePassword
)

router.put(
  '/update-profile',

  tokenMiddleware.auth,

  // body("password")
  //   .exists()
  //   .withMessage("password is required")
  //   .isLength({ min: 9 })
  //   .withMessage("password minium 8 characters"),
  // body("newPassword")
  //   .exists()
  //   .withMessage("new password is required")
  //   .isLength({ min: 9 })
  //   .withMessage("new password minium 8 characters"),
  // body("confirmNewPassword")
  //   .exists()
  //   .withMessage("confirm new password is required")
  //   .isLength({ min: 9 })
  //   .withMessage("confirm new password minium 8 characters")
  //   .custom((value, { req }) => {
  //     if (value !== req.body.newPassword)
  //       throw new Error("confirm new password not match");
  //     return true;
  //   }),
  // requestHandler.validate,
  userController.updateProfile
)

router.get('/info', tokenMiddleware.auth, userController.getInfo)

router.get('/carts', tokenMiddleware.auth, cartController.getCartsOfUser)
router.post('/carts', tokenMiddleware.auth, cartController.addCart)
router.delete('/carts/:cartId', tokenMiddleware.auth, cartController.removeCart)
router.delete('/carts', tokenMiddleware.auth, cartController.removeCarts)
router.put('/carts', tokenMiddleware.auth, cartController.updateCart)

router.get(
  '/favorites',
  tokenMiddleware.auth,
  favoriteController.getFavoritesOfUser
)
router.post('/favorites', tokenMiddleware.auth, favoriteController.addFavorite)
router.delete(
  '/favorites/:favoriteId',
  tokenMiddleware.auth,
  favoriteController.removeFavorite
)
router.delete(
  '/favorites',
  tokenMiddleware.auth,
  favoriteController.removeFavorites
)

router.get('/orders', tokenMiddleware.auth, orderController.getOrdersByUserId)
// router.post('/orders', tokenMiddleware.auth, orderController.addCart)
router.delete(
  '/orders/:orderId',
  tokenMiddleware.auth,
  orderController.removeOrder
)
// router.delete('/orders', tokenMiddleware.auth, orderController.removeCarts)
// router.put('/orders', tokenMiddleware.auth, orderController.updateCart)

module.exports = router
