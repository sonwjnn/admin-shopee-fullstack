const responseHandler = require('../handlers/response.handler')
const shopModel = require('../models/shop.model')
const { toStringDate } = require('../utilities/toStringDate')
const calculateData = require('../utilities/calculateData')
const userModel = require('../models/user.model')
const { USER_ROLE } = require('../utilities/constants')

const renderIndexPage = async (req, res) => {
  try {
    const pageNumberPayload = parseInt(req.params.pageNumber, 10) || 1
    const name = ''

    const { limit, skip, sumPage, pageNumber } = await calculateData(
      pageNumberPayload,
      shopModel,
      name,
      req.user
    )

    const shops = await shopModel
      .find()
      .limit(limit)
      .skip(skip)
      .sort({ _id: 1 })

    const dateOfC = shops.map(shop => toStringDate.dmy(shop.createdAt))

    const isIndexPage = 1
    const index = 'shops'
    const main = 'shops/main'

    res.render('index', {
      main,
      index,
      data: shops,
      sumPage,
      pageNumber,
      name,
      isIndexPage,
      dateOfC,
      role: req.user.role,
      USER_ROLE
    })
  } catch (error) {
    responseHandler.error(res)
  }
}

const renderSearchPage = async (req, res) => {
  try {
    const name = req.params.name || ''
    const pageNumberPayload = parseInt(req.params.pageNumber, 10) || 1

    const { limit, skip, obj_find, sumPage, pageNumber } = await calculateData(
      pageNumberPayload,
      shopModel,
      name,
      req.user
    )

    const shops = await shopModel
      .find(obj_find)
      .limit(limit)
      .skip(skip)
      .sort({ _id: 1 })

    const dateOfC = shops.map(shop => toStringDate.dmy(shop.createdAt))

    const index = 'shops'
    const main = 'shops/main'
    // flag = 1 render index page, flag = 2 render search page
    const isIndexPage = 0

    res.render('index', {
      main,
      index,
      data: shops,
      sumPage,
      pageNumber,
      name,
      isIndexPage,
      dateOfC,
      role: req.user.role
    })
  } catch (error) {
    responseHandler.notfoundpage(res)
  }
}

const renderEditPage = async (req, res) => {
  try {
    const { shopId } = req.params

    const shop = await shopModel.findOne({ _id: shopId })

    if (!shop) {
      return responseHandler.notfoundpage(res)
    }
    const index = 'shops'
    const main = 'shops/edit.shop.ejs'
    res.render('index', {
      main,
      index,
      data: shop,
      role: req.user.role,
      USER_ROLE
    })
  } catch (error) {
    responseHandler.notfoundpage(res)
  }
}

const renderAddPage = async (req, res) => {
  try {
    const index = 'shops'
    const main = 'shops/add.shop.ejs'
    res.render('index', { main, index, role: req.user.role })
  } catch (error) {
    responseHandler.notfoundpage(res)
  }
}

const add = async (req, res) => {
  try {
    // Kiểm tra xem người dùng đã có cửa hàng chưa
    const existingShop = await shopModel.findOne({ user: req.user.id })

    if (existingShop) {
      return responseHandler.badrequest(res, {
        message: 'Your shop is already exists!'
      })
    }

    const newShop = new shopModel({ ...req.body, user: req.user.id })

    await newShop.save()

    await userModel.updateOne({ _id: req.user.id }, { role: USER_ROLE.SHOP })

    responseHandler.created(res, {
      ...newShop._doc,
      message: 'Add shop successfully!'
    })
  } catch (error) {
    responseHandler.error(res)
  }
}

const getInfoByUserId = async (req, res) => {
  try {
    const id = req.user._id // Lấy _id từ req.user

    // Tìm cửa hàng dựa trên _id của người dùng
    const shop = await shopModel.findOne({ user: id })

    if (!shop) {
      return responseHandler.notfound(res)
    }

    return responseHandler.ok(res, shop)
  } catch (error) {
    // Xử lý lỗi khi có ngoại lệ xảy ra
    responseHandler.error(res)
  }
}

const getList = async (req, res) => {
  try {
    const shops = await shopModel.find()

    if (!shops) return responseHandler.notfound(res)

    return responseHandler.ok(res, shops)
  } catch (error) {
    responseHandler.error(res)
  }
}

const removeShop = async (req, res) => {
  try {
    const { shopId } = req.params

    const shop = await shopModel.findOne({
      _id: shopId
    })

    if (!shop) {
      return responseHandler.notfound(res)
    }

    await shop.deleteOne()

    await userModel.updateOne({ _id: req.user.id }, { role: 'user' })

    return responseHandler.ok(res, 'Remove shop succcessfully')
  } catch (error) {
    responseHandler.error(res)
  }
}

const removeShops = async (req, res) => {
  try {
    const shopIds = JSON.parse(JSON.stringify(req.body)).ids
    const shops = await shopModel.find({
      _id: { $in: shopIds }
    })

    if (!shops || shops.length === 0) {
      return responseHandler.notfound(res)
    }

    // Lấy danh sách các người dùng có liên quan đến các cửa hàng bị xóa
    const userIds = shops.map(shop => shop.user_id)

    // Cập nhật vai trò của người dùng từ 'sale' thành 'user'
    await userModel.updateMany(
      { _id: { $in: userIds }, role: USER_ROLE.SHOP },
      { $set: { role: USER_ROLE.USER } }
    )

    // Xóa các cửa hàng
    await shopModel.deleteMany({
      _id: { $in: shopIds }
    })

    return responseHandler.ok(res, 'Shops successfully deleted!')
  } catch (error) {
    responseHandler.error(res)
  }
}

const getDetail = async (req, res) => {
  try {
    const { shopId } = req.params

    const shop = await shopModel.findOne({ _id: shopId })

    if (!shop) {
      return responseHandler.notfound(res)
    }

    return responseHandler.ok(res, shop)
  } catch (error) {
    responseHandler.error(res)
  }
}

const update = async (req, res) => {
  try {
    const shop = await shopModel.findOne({ user: req.user.id })

    if (!shop) {
      return responseHandler.notfound(res)
    }
    shop.setData(req.body)

    await shop.save()

    return responseHandler.ok(res, { message: 'Update shop successfully!' })
  } catch (error) {
    responseHandler.error(res)
  }
}

module.exports = {
  getInfoByUserId,
  getList,
  getDetail,
  renderIndexPage,
  renderAddPage,
  add,
  getList,
  removeShop,
  removeShops,
  renderEditPage,
  renderSearchPage,
  update
}
