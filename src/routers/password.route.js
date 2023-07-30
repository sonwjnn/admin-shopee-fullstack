const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')
const tokenMiddleware = require('../middlewares/token.middleware')
const requestHandler = require('../handlers/request.handler')
const { body } = require('express-validator')

router.get('/index', (req, res) => {
  const index = 'password'
  const main = 'password/main'
  res.render('index', { main, index })
})

router.put(
  '/update-password',
  tokenMiddleware.authServer,
  body('password')
    .exists()
    .withMessage('password is required')
    .isLength({ min: 9 })
    .withMessage('password minium 8 characters'),
  body('newPassword')
    .exists()
    .withMessage('new password is required')
    .isLength({ min: 9 })
    .withMessage('new password minium 8 characters'),
  body('confirmNewPassword')
    .exists()
    .withMessage('confirm new password is required')
    .isLength({ min: 9 })
    .withMessage('confirm new password minium 8 characters')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword)
        throw new Error('confirm new password not match')
      return true
    }),
  requestHandler.validate,
  userController.updatePassword
)

module.exports = router
