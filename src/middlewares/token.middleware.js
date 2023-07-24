const jsonwebtoken = require('jsonwebtoken')
const responseHandler = require('../handlers/response.handler.js')
const userModel = require('../models/user.model.js')
const fs = require('fs')
const filepath = 'src/assets/json/archiveToken.json'

const tokenDecode = req => {
  try {
    const bearerHeader = req.headers['authorization']
    if (bearerHeader) {
      const token = bearerHeader.split(' ')[1]
      return jsonwebtoken.verify(token, process.env.SECRET_TOKEN)
    }

    if (req.cookies.token) {
      const token = req.cookies.token
      return jsonwebtoken.verify(token, process.env.SECRET_TOKEN)
    }
    return false
  } catch (error) {
    return false
  }
}

const auth = async (req, res, next) => {
  const tokenDecoded = tokenDecode(req)

  if (!tokenDecoded) {
    return responseHandler.unauthorized(res)
  }

  const user = await userModel.findById(tokenDecoded.data)

  if (!user) {
    return responseHandler.unauthorized(res)
  }
  req.user = user
  next()
}

const authServer = async (req, res, next) => {
  const tokenDecoded = tokenDecode(req)
  if (!tokenDecoded) {
    return res.redirect('/admin/signin')
  }
  const user = await userModel.findById(tokenDecoded.data)
  if (!user) {
    return res.redirect('/admin/signin')
  }

  req.user = user
  next()
}

module.exports = { auth, tokenDecode, authServer }
