const userModel = require('../models/user.model')
const responseHandler = require('../handlers/response.handler')
const jsonwebtoken = require('jsonwebtoken')
const { readJsonFile } = require('../utilities/readJsonFile')
const filePath = 'src/assets/json/archiveToken.json'

const signin = async (req, res) => {
  try {
    const { username, password, admin } = req.body

    const user = await userModel
      .findOne({ username })
      .select(
        'username password salt id name email phone address city district sex birthday'
      )
    if (!user) {
      return responseHandler.badrequest(res, 'User not exist')
    }

    if (!user.validPassword(password))
      return responseHandler.badrequest(res, 'Wrong password')

    if (admin && !user.role === 'admin')
      return responseHandler.unauthorized(res)

    const token = jsonwebtoken.sign(
      { data: user.id },
      process.env.SECRET_TOKEN,
      {
        expiresIn: '24h'
      }
    )
    user.password = undefined
    user.salt = undefined

    // add token and id to file with link file is filePath
    readJsonFile(filePath, user.id, token)

    // add token to cookie
    res.cookie('token', token, { maxAge: 24 * 60 * 60 * 1000 })

    responseHandler.created(res, {
      token,
      ...user._doc,
      id: user.id,
      msg: 'Login successfully!'
    })
  } catch (error) {
    responseHandler.error(res)
  }
}

const signup = async (req, res) => {
  try {
    const { username, password, displayName, confirmPassword, role } = req.body
    const checkUser = await userModel.findOne({ username })
    if (checkUser) {
      return responseHandler.badrequest(res, 'User name already used')
    }

    const user = new userModel()

    user.name = displayName
    user.username = username
    user.role = role

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
      id: user.id,
      msg: 'Sign up successfully!'
    })
  } catch (error) {
    console.log(error)
    responseHandler.error(res)
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

    responseHandler.ok(res, { message: 'Update password successfully!' })
  } catch (error) {
    responseHandler.error(res)
  }
}

const updateProfile = async (req, res) => {
  try {
    const { email, phone } = req.body
    const username = req.body.username || req.user.username
    const checkUnique = await userModel.findOne({ $or: [{ email }, { phone }] })
    if (checkUnique && checkUnique.username !== username)
      return responseHandler.badrequest(
        res,
        'Data already exists! Please check again your username, phone, and email!'
      )
    const user = await userModel.findOne({ username })
    user.setProfile(req.body)
    //save to database
    await user.save()

    responseHandler.ok(res, { message: 'Update user successfully!' })
  } catch (error) {
    responseHandler.error(res)
  }
}

const getInfo = async (req, res) => {
  try {
    const id = req.user._id
    const user = await userModel.findById(id)

    if (!user) return responseHandler.notfound(res)

    return responseHandler.ok(res, user)
  } catch (error) {
    responseHandler.error(res)
  }
}

const getDetailOfUser = async (req, res) => {
  try {
    const userId = req.params.userId
    const user = await userModel.findById(userId)

    if (!user) return responseHandler.notfound(res)

    return responseHandler.ok(res, user)
  } catch (error) {
    responseHandler.error(res)
  }
}

const add = async (req, res) => {
  try {
    const { username, password, email, phone, displayName, role } = req.body
    const check_obj = { $or: [{ username }, { email }, { phone }] }
    const checkUser = await userModel.findOne(check_obj)
    if (checkUser) {
      return responseHandler.badrequest(
        res,
        'Data already exists! Please check again your username, phone, and email!'
      )
    }
    const user = new userModel()

    user.name = displayName
    user.username = username
    user.role = role

    user.setProfile(req.body)

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
      id: user.id,
      msg: 'Add user successfully!'
    })
  } catch (error) {
    responseHandler.error(res)
  }
}

module.exports = {
  signin,
  signup,
  updatePassword,
  getInfo,
  updateProfile,
  add,
  getDetailOfUser
}
