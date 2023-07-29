const express = require('express')
const router = express.Router()
const userModel = require('../models/user.model')
const cartModel = require('../models/cart.model')
const favoriteModel = require('../models/favorite.model')
const reviewModel = require('../models/review.model')
const userController = require('../controllers/user.controller')
const { body } = require('express-validator')
const requestHandler = require('../handlers/request.handler')
const tokenMiddleware = require('../middlewares/token.middleware')

router.get('/index(/:pageNumber?)', userController.renderIndexPage)

router.get('/search/(:name?)(/:pageNumber?)', userController.renderSearchPage)

router.get('/edit/:username', userController.renderEditPage)

router.get('/password/:username', userController.renderPasswordPage)

router.get('/add', userController.renderAddPage)

// add user
const phoneRegex = /^(0\d{9})$/
router.post(
  '/add',
  tokenMiddleware.authServer,
  body('username')
    .exists()
    .withMessage('Username is required')
    .isLength({ min: 8 })
    .withMessage('Username minimum 8 characters')
    .custom(async value => {
      const user = await userModel.findOne({ username: value })
      if (user) return Promise.reject('Username already used')
    }),
  body('password')
    .exists()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password minimum 8 characters'),
  body('confirmPassword')
    .exists()
    .withMessage('Confirm password is required')
    .isLength({ min: 8 })
    .withMessage('Confirm password minimum 8 characters')
    .custom((value, { req }) => {
      if (value !== req.body.password)
        throw new Error('Confirm password does not match')
      return true
    }),
  body('displayName')
    .exists()
    .withMessage('Display name is required')
    .isLength({ min: 8 })
    .withMessage('DisplayName minimum 8 characters'),
  body('email')
    .exists()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),

  body('phone')
    .exists()
    .withMessage('Phone is required')
    .matches(phoneRegex)
    .withMessage(
      'Invalid phone number format. It should start with "0" and have 10 digits'
    ),
  body('address').exists().withMessage('Address is required'),
  body('city').exists().withMessage('City is required'),
  body('district').exists().withMessage('District is required'),
  body('sex').exists().withMessage('Sex is required'),
  body('birthday').exists().withMessage('Birthday is required'),
  body('role').exists().withMessage('Role is required'),
  body('story').exists().withMessage('Story is required'),
  requestHandler.validate,
  userController.add
)

// update profile user
router.put(
  '/update-profile',
  tokenMiddleware.authServer,
  body('displayName')
    .exists()
    .withMessage('Display name is required')
    .isLength({ min: 8 })
    .withMessage('DisplayName minimum 8 characters'),
  body('email')
    .exists()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),

  body('phone')
    .exists()
    .withMessage('Phone is required')
    .matches(phoneRegex)
    .withMessage(
      'Invalid phone number format. It should start with "0" and have 10 digits'
    ),
  body('address').exists().withMessage('Address is required'),
  body('city').exists().withMessage('City is required'),
  body('district').exists().withMessage('District is required'),
  body('sex').exists().withMessage('Sex is required'),
  body('birthday').exists().withMessage('Birthday is required'),
  body('role').exists().withMessage('Role is required'),
  body('story').exists().withMessage('Story is required'),
  requestHandler.validate,
  userController.updateProfile
)

router.get(
  '/detail/:userId',
  tokenMiddleware.authServer,
  userController.getDetailOfUser
)

router.get('/list', userController.getList)

router.post('/delete', async function (req, res) {
  try {
    const username = req.body.username

    const check_obj = { username }
    const user = await userModel.findOne(check_obj).exec()
    if (!user) {
      res.send({ kq: 0, msg: 'User does not exist' })
      return
    }

    await favoriteModel.deleteMany({ user: user._id })

    await cartModel.deleteMany({ user: user._id })

    await reviewModel.deleteMany({ user: user._id })

    await userModel.deleteOne({ _id: user._id })

    res.send({ kq: 1, msg: 'Delete user successfully!' })
  } catch (err) {
    res.send({ kq: 0, msg: 'An error occurred' })
  }
})

router.post('/deleteGr', async function (req, res) {
  try {
    const arr = req.body
    const check_obj = { username: { $in: arr.arr } }
    const users = await userModel.find(check_obj).exec()
    const userIds = users.map(item => item._id)
    const check_other = { user: { $in: userIds } }

    await favoriteModel.deleteMany(check_other)

    await cartModel.deleteMany(check_other)

    await reviewModel.deleteMany(check_other)

    const deleteResult = await userModel.deleteMany(check_obj)

    res.json({
      kq: 1,
      msg: 'Delete data successfully!',
      deletedCount: deleteResult.deletedCount
    })
  } catch (err) {
    console.log(err)
    res.json({ kq: 0, msg: 'An error occurred' })
  }
})

router.post('/updatePassword', function (req, res) {
  var username,
    oldPass,
    newPass,
    flag = 1
  var password = ''

  username = req.body.username
  oldPass = req.body.oldPass
  newPass = req.body.newPass

  newPass = bcrypt.hashSync(newPass, salt)
  const obj = {
    password: newPass
  }

  if (flag == 1) {
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

module.exports = router
