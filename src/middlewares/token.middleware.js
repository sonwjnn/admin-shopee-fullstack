const jsonwebtoken = require('jsonwebtoken')
const responseHandler = require('../handlers/response.handler.js')
const userModel = require('../models/M_Users.js')
const tokenDecode = req => {
  try {
    const token = req.cookies['actkn']
    console.log(token)

    if (token) {
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

module.exports = { auth, tokenDecode }
