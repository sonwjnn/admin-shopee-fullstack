const jsonwebtoken = require('jsonwebtoken')
const responseHandler = require('../handlers/response.handler.js')
const userModel = require('../models/M_Users.js')
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

module.exports = { auth, tokenDecode }
