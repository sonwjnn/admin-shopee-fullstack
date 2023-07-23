const express = require('express')
const router = express.Router()
const userModel = require('../models/user.model')
const responseHandler = require('../handlers/response.handler')
const userController = require('../controllers/user.controller')
const requestHandler = require('../handlers/resquest.handler')
const { body } = require('express-validator')

var jwt = require('jsonwebtoken')

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
    res.render('index', { main, index, data: user })
  } catch (error) {
    responseHandler.error(res)
  }
})

router.post(
  '/update',
  body('displayName')
    .exists()
    .withMessage('display name is required')
    .isLength({ min: 9 })
    .withMessage('displayName minium 8 characters'),
  requestHandler.validate,
  userController.updateProfile
)

module.exports = router
