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

const signup = async (req, res) => {
  try {
    const { username, password, displayName } = req.body
    const checkUser = await userModel.findOne({ username })
    if (checkUser) {
      return responseHandler.badrequest(res, 'username already used')
    }

    const user = new userModel()

    user.name = displayName
    user.username = username
    user.role = 'User'
    user.setPassword(password)

    await user.save()

    const token = jsonwebtoken.sign(
      { data: user.id },
      process.env.SECRET_TOKEN,
      { expiresIn: '24h' }
    )

    responseHandler.created(res, {
      token,
      ...user._doc,
      id: user.id
    })
  } catch (error) {
    responseHandler.error(error)
  }
}

const updatePassword = async (req, res) => {
  try {
    const { password, newPassword } = req.body
    const username = req.user.username
    const user = await userModel.findOne({ username }).select('password salt')
    if (!user) return responseHandler.unauthorized(res)
    if (!user.validPassword(password))
      return responseHandler.badrequest(res, 'Wrong Password')
    user.setPassword(newPassword)

    //save to database
    await user.save()

    responseHandler.ok(res)
  } catch (error) {
    console.log(error)
    responseHandler.error(error)
  }
}

const getInfo = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id)

    if (!user) return responseHandler.notfound(res)

    responseHandler.ok(res, user)
  } catch (error) {
    responseHandler.error(error)
  }
}

module.exports = { signin, signup, updatePassword, getInfo }
