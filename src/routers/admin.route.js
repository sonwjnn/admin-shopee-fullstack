const express = require('express')
const router = express.Router()
const userModel = require('../models/user.model')
const userController = require('../controllers/user.controller')
const tokenMiddleware = require('../middlewares/token.middleware')
const { body } = require('express-validator')
const requestHandler = require('../handlers/request.handler')

router.get('/signin', (req, res) => {
  if (req.cookies.token) return res.clearCookie('token').render('login')
  res.render('login')
})

router.get(
  '/signup',
  (req, res, next) => {
    if (req.cookies.token == '' || req.cookies.token == undefined) {
      next()
    } else {
      res.redirect('/admin/dashboards/index')
    }
  },
  (req, res) => {
    res.render('register')
  }
)

// sign up
router.post(
  '/signup',
  body('username')
    .exists()
    .withMessage('username is required')
    .isLength({ min: 9 })
    .withMessage('username minium 8 characters')
    .custom(async value => {
      const user = await userModel.findOne({ username: value })
      if (user) return Promise.reject('username already used')
    }),
  body('password')
    .exists()
    .withMessage('password is required')
    .isLength({ min: 9 })
    .withMessage('password minium 8 characters'),
  body('confirmPassword')
    .exists()
    .withMessage('confirm password is required')
    .isLength({ min: 9 })
    .withMessage('confirm password minium 8 characters')
    .custom((value, { req }) => {
      if (value !== req.body.password)
        throw new Error('confirm password not match')
      return true
    }),
  body('displayName')
    .exists()
    .withMessage('display name is required')
    .isLength({ min: 9 })
    .withMessage('displayName minium 8 characters'),
  requestHandler.validate,
  userController.signup
)

router.get('/*', tokenMiddleware.authServer)

// new mothod login with token verify
// router.post('/processLogin', function (req, res) {
//   var username = (password = '')
//   var flag = 1

//   username = req.body.username
//   password = req.body.password
//   if (flag == 1) {
//     userModel.find({ username }).exec((err, data) => {
//       if (err) {
//         res.send({ kq: 0, msg: 'Connection to db failed.' })
//       } else {
//         if (data == '') {
//           res.send({ kq: 0, msg: 'Your username is not exists.' })
//         } else {
//           var result = bcrypt.compareSync(password, data[0].password)

//           if (result == false) {
//             res.send({ kq: 0, msg: 'Your password is not correct.' })
//           } else if (data[0].role == 'user') {
//             res.send({ kq: 0, msg: 'You are not authorized.' })
//           } else {
//             // using token
//             jwt.sign(
//               { data: data[0]._id },
//               secret,
//               { expiresIn: 10 * 365 * 24 * 60 * 60 },
//               (err, token) => {
//                 if (err) {
//                   res.send({ kq: 0, msg: err })
//                 } else {
//                   readJsonFile(filepath, data[0]._id, token)

//                   res
//                     .cookie('token', token, { maxAge: 10 * 365 * 24 * 60 * 60 })
//                     .send({ kq: data[0], msg: 'Login successfully !!' })
//                 }
//               }
//             )
//           }
//         }
//       }
//     })
//   }
// })

// sign in
router.post(
  '/signin',
  body('username')
    .exists()
    .withMessage('username is required')
    .isLength({ min: 9 })
    .withMessage('username minium 8 characters'),
  body('password')
    .exists()
    .withMessage('password is required')
    .isLength({ min: 9 })
    .withMessage('password minium 8 characters'),
  requestHandler.validate,
  userController.signin
)

module.exports = router
