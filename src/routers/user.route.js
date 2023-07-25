const express = require('express')
const router = express.Router()

const userModel = require('../models/user.model')
const cartModel = require('../models/cart.model')
const favoriteModel = require('../models/favorite.model')
const reviewModel = require('../models/review.model')
const userController = require('../controllers/user.controller')
const { body } = require('express-validator')
const requestHandler = require('../handlers/request.handler')
const tokenMiddleware = require('../middlewares/token.middleware.js')

router.get('/index(/:pageNumber?)', async (req, res) => {
  const limit = 8
  var sumPage = 0
  var sumData = await userModel.find()
  if (sumData.length != 0) {
    var sumPage = Math.ceil(sumData.length / limit)
  }

  var pageNumber = req.params.pageNumber

  if (pageNumber == 1 || pageNumber == undefined || pageNumber < 1) {
    pageNumber = 1
  }

  if (pageNumber > sumPage && sumPage != 0) {
    pageNumber = sumPage
  }

  // set up var skip
  var skip = (pageNumber - 1) * limit

  userModel
    .find()
    .limit(limit)
    .skip(skip)
    .sort({ name: 1 })
    .exec((err, data) => {
      if (err) {
        throw err
      } else {
        var index = 'users'
        var main = 'users/main'
        var flag = 0
        var name = ''
        res.render('index', {
          main,
          index,
          data,
          sumPage,
          pageNumber,
          name,
          flag
        })
      }
    })
})

router.get('/edit/:username', async (req, res) => {
  try {
    const username = req.params.username
    const user = await userModel.findOne({ username })

    if (!user) {
      return responseHandler.notfound(res)
    }

    const index = 'users'
    const main = 'users/edit.user.ejs'
    res.render('index', { main, index, data: user })
  } catch (error) {
    console.log(error)
    responseHandler.error(res)
  }
})

router.get('/password/:username', function (req, res) {
  var username = req.params.username

  if (username != '') {
    // check username
    const check_obj = { $or: [{ username }] }
    userModel.find(check_obj).exec((err, data) => {
      if (err) {
        throw err
      } else {
        if (data == '') {
          res.send({ kq: 0, msg: 'Username is not exists' })
        } else {
          var index = 'users'
          var main = 'users/updatePassword.user.ejs'

          res.render('index', { main, index, data })
        }
      }
    })
  } else {
  }
})

router.get('/add', (req, res) => {
  var index = 'users'
  var main = 'users/add.user.ejs'
  res.render('index', { main, index })
})

// add user
const phoneRegex = /^(0\d{9})$/
router.post(
  '/add',
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

// update user
router.put(
  '/update-profile',
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

router.get('/getAllUser', function (req, res) {
  userModel.find().exec((err, data) => {
    if (err) {
      throw err
    } else {
      res.send({ kq: 1, data, msg: 'Get all successfully.' })
    }
  })
})

router.get('/search/(:name?)(/:pageNumber?)', async (req, res) => {
  var name = ''
  name = req.params.name

  var obj_find = {}
  if (name != '' && name != undefined) {
    const regex = new RegExp('(' + name + ')', 'i')
    obj_find = { name: { $regex: regex } }
  }

  const limit = 8

  var sumPage = 0
  var sumData = await userModel.find(obj_find)
  if (sumData.length != 0) {
    var sumPage = Math.ceil(sumData.length / limit)
  }

  var pageNumber = req.params.pageNumber

  if (pageNumber == 1 || pageNumber == undefined || pageNumber < 1) {
    pageNumber = 1
  }

  if (pageNumber > sumPage && sumPage != 0) {
    pageNumber = sumPage
  }

  // set up var skip
  var skip = (pageNumber - 1) * limit

  userModel
    .find(obj_find)
    .limit(limit)
    .skip(skip)
    .sort({ _id: 1 })
    .exec((err, data) => {
      if (err) {
        throw err
      } else {
        var index = 'users'
        var main = 'users/main'
        var flag = 1
        res.render('index', {
          main,
          index,
          data,
          sumPage,
          pageNumber,
          name,
          flag
        })
      }
    })
})

module.exports = router
