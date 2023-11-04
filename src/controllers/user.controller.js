const userModel = require('../models/user.model')
const cartModel = require('../models/cart.model')
const favoriteModel = require('../models/favorite.model')
const reviewModel = require('../models/review.model')
const responseHandler = require('../handlers/response.handler')
const jsonwebtoken = require('jsonwebtoken')
const { readJsonFile } = require('../utilities/readJsonFile')
const filePath = 'src/assets/json/archiveToken.json'
const calculateData = require('../utilities/calculateData')

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
    console.log(error)
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

const renderIndexPage = async (req, res) => {
  try {
    const pageNumberPayload = parseInt(req.params.pageNumber, 10) || 1
    const name = ''

    const { limit, skip, obj_find, sumPage, pageNumber } = await calculateData(
      pageNumberPayload,
      userModel,
      name
    )

    const users = await userModel
      .find(obj_find)
      .limit(limit)
      .skip(skip)
      .sort({ _id: 1 })

    if (!users) return responseHandler.notfound(res)

    const index = 'users'
    const main = 'users/main'
    const isIndexPage = 1
    res.render('index', {
      main,
      index,
      data: users,
      sumPage,
      pageNumber,
      name,
      isIndexPage
    })
  } catch (error) {
    responseHandler.error(res)
  }
}

const renderEditPage = async (req, res) => {
  try {
    const username = req.params.username
    const user = await userModel.findOne({ username })

    if (!user) {
      return responseHandler.notfound(res)
    }

    const index = 'users'
    const main = 'users/edit.user.ejs'
    res.render('index', { main, index, data: user })
  } catch (error) {
    responseHandler.error(res)
  }
}

const renderPasswordPage = async (req, res) => {
  try {
    const username = req.params.username

    const user = await userModel.findOne({ username })

    if (!user) responseHandler.notfound(res)

    const index = 'users'
    const main = 'users/updatePassword.user.ejs'

    res.render('index', { main, index, data: user })
  } catch (error) {
    responseHandler.error(res)
  }
}

const renderAddPage = (req, res) => {
  const index = 'users'
  const main = 'users/add.user.ejs'
  res.render('index', { main, index })
}

const renderSearchPage = async (req, res) => {
  try {
    const pageNumberPayload = parseInt(req.params.pageNumber, 10) || 1
    const name = req.params.name

    const { limit, skip, obj_find, sumPage, pageNumber } = await calculateData(
      pageNumberPayload,
      userModel,
      name
    )

    const users = await userModel
      .find(obj_find)
      .limit(limit)
      .skip(skip)
      .sort({ _id: 1 })

    if (!users) return responseHandler.notfound(res)

    const index = 'users'
    const main = 'users/main'
    const isIndexPage = 0
    res.render('index', {
      main,
      index,
      data: users,
      sumPage,
      pageNumber,
      name,
      isIndexPage
    })
  } catch (error) {
    responseHandler.error(res)
  }
}

const getList = async (req, res) => {
  try {
    const users = await userModel.find()

    if (!users) return responseHandler.notfound(res)

    return responseHandler.ok(res, users)
  } catch (error) {
    responseHandler.error(res)
  }
}

const removeUser = async function (req, res) {
  try {
    const { username } = req.body

    const user = await userModel.findOne({ username })
    if (!user) {
      return responseHandler.notfound(res)
    }

    await favoriteModel.deleteMany({ user: user._id })

    await cartModel.deleteMany({ user: user._id })

    await reviewModel.deleteMany({ user: user._id })

    await userModel.deleteOne({ _id: user._id })

    return responseHandler.ok(res, 'Delete user successfully!')
  } catch (err) {
    responseHandler.error(res)
  }
}

const removeUsers = async function (req, res) {
  try {
    const usersIds = JSON.parse(JSON.stringify(req.body)).ids
    const check_obj = { username: { $in: usersIds } }
    const users = await userModel.find(check_obj)
    const userIds = users.map(item => item._id)
    const check_other = { user: { $in: userIds } }

    await favoriteModel.deleteMany(check_other)

    await cartModel.deleteMany(check_other)

    await reviewModel.deleteMany(check_other)

    await userModel.deleteMany(check_obj)

    return responseHandler.ok(res, 'Delete users successfully!')
  } catch (err) {
    responseHandler.error(res)
  }
}

module.exports = {
  renderIndexPage,
  renderEditPage,
  renderPasswordPage,
  renderAddPage,
  renderSearchPage,
  signin,
  signup,
  updatePassword,
  getInfo,
  updateProfile,
  add,
  getList,
  getDetailOfUser,
  removeUser,
  removeUsers
}
