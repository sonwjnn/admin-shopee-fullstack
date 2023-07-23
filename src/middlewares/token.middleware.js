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
  try {
    const token = req.cookies.token
    if (!token) {
      return res.redirect('/admin/login')
    }

    const decoded = await jsonwebtoken.verify(token, process.env.SECRET_TOKEN)

    if (decoded.data) {
      const fileString = fs.readFileSync(filepath).toString()
      const fileObj = JSON.parse(fileString)

      const isValidUser = fileObj.some(user => user.id === decoded.data)

      if (isValidUser) {
        return next()
      }
    }

    return res.redirect('/admin/login')
  } catch (err) {
    return res.redirect('/admin/login')
  }
}

module.exports = { auth, tokenDecode, authServer }
