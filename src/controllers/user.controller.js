const userModel = require('../models/M_Users')
const responseHandler = require('../handlers/response.handler')
const env = require('../configs/environment')
const jsonwebtoken = require('jsonwebtoken')

const signin = async (req, res) => {
  try {
    const { username, password } = req.body

    const user = await userModel
      .findOne({ username })
      .select('username password salt id name')
    if (!user) {
      return responseHandler.badrequest(res, 'User not exist')
    }

    if (!user.validPassword(password))
      return responseHandler.badrequest(res, 'Wrong password')

    const token = jsonwebtoken.sign({ data: user.id }, env.SECRET_TOKEN, {
      expiresIn: '24h'
    })
    user.password = undefined
    user.salt = undefined

    responseHandler.created(res, {
      token,
      ...user._doc,
      id: user.id
    })
  } catch (error) {
    responseHandler.error(res)
  }
}

module.exports = { signin }
