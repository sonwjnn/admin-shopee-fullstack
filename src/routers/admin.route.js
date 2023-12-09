const express = require('express')
const router = express.Router()
const userModel = require('../models/user.model')
const userController = require('../controllers/user.controller')
const tokenMiddleware = require('../middlewares/token.middleware')
const { body } = require('express-validator')
const requestHandler = require('../handlers/request.handler')
const { isAdmin } = require('../middlewares/role.middleware')

router.get('/signin', (req, res) => {
  if (req.cookies.token) return res.clearCookie('token').render('login')
  res.render('login')
})

router.get(
  '/signup',
  (req, res, next) => {
    if (req.cookies.token) {
      return res.redirect('/admin/dashboards/index')
    }
    next()
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
    .isLength({ min: 8 })
    .withMessage('username minium 8 characters')
    .custom(async value => {
      const user = await userModel.findOne({ username: value })
      if (user) return Promise.reject('username already used')
    }),
  body('password')
    .exists()
    .withMessage('password is required')
    .isLength({ min: 8 })
    .withMessage('password minium 8 characters'),
  body('confirmPassword')
    .exists()
    .withMessage('confirm password is required')
    .isLength({ min: 8 })
    .withMessage('confirm password minium 8 characters')
    .custom((value, { req }) => {
      if (value !== req.body.password)
        throw new Error('confirm password not match')
      return true
    }),
  body('displayName')
    .exists()
    .withMessage('display name is required')
    .isLength({ min: 8 })
    .withMessage('displayName minium 8 characters'),
  requestHandler.validate,
  userController.signup
)

router.get('/*', tokenMiddleware.authServer)

// sign in
router.post(
  '/signin',
  body('username')
    .exists()
    .withMessage('username is required')
    .isLength({ min: 8 })
    .withMessage('username minium 8 characters'),
  body('password')
    .exists()
    .withMessage('password is required')
    .isLength({ min: 8 })
    .withMessage('password minium 8 characters'),
  requestHandler.validate,
  userController.signin
)

module.exports = router
