const express = require('express')
const router = express.Router()
const userModel = require('../models/user.model')
const responseHandler = require('../handlers/response.handler')
const userController = require('../controllers/user.controller')
const requestHandler = require('../handlers/request.handler')
const { body } = require('express-validator')
const jwt = require('jsonwebtoken')
const phoneRegex = /^(0\d{9})$/
const { USER_ROLE } = require('../utils/constants')

router.get('/index', async (req, res) => {
  try {
    const decoded = await jwt.verify(
      req.cookies.token,
      process.env.SECRET_TOKEN
    )
    const id = decoded.data
    const user = await userModel.findOne({ _id: id })

    if (!user) return responseHandler.notfound(res)

    const index = 'profile'
    const main = 'profile/main'
    res.render('index', {
      main,
      index,
      data: user,
      role: req.user.role,
      USER_ROLE
    })
  } catch (error) {
    responseHandler.error(res)
  }
})

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

module.exports = router
