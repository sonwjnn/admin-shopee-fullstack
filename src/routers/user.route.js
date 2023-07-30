const express = require('express')
const router = express.Router()
const userModel = require('../models/user.model')
const userController = require('../controllers/user.controller')
const { body } = require('express-validator')
const requestHandler = require('../handlers/request.handler')
const tokenMiddleware = require('../middlewares/token.middleware')

router.get('/index(/:pageNumber?)', userController.renderIndexPage)

router.get('/search/(:name?)(/:pageNumber?)', userController.renderSearchPage)

router.get('/edit/:username', userController.renderEditPage)

router.get('/password/:username', userController.renderPasswordPage)

router.get('/add', userController.renderAddPage)

router.get('/list', userController.getList)

router.get(
  '/detail/:userId',
  tokenMiddleware.authServer,
  userController.getDetailOfUser
)

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

router.delete('/delete', tokenMiddleware.authServer, userController.removeUser)

router.delete('/', tokenMiddleware.authServer, userController.removeUsers)

module.exports = router
