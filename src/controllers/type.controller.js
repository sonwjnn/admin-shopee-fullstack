const responseHandler = require('../handlers/response.handler')
const typeModel = require('../models/type.model')
const cateModel = require('../models/category.model')
const { toStringDate } = require('../utilities/toStringDate')
const calculateData = require('../utilities/calculateData')
const productModel = require('../models/product.model')
const shopModel = require('../models/shop.model')

const renderIndexPage = async (req, res) => {
  try {
    const pageNumber = parseInt(req.params.pageNumber, 10) || 1

    const limit = 10

    // if (user && user.role !== 'admin') obj_find.user = user.id

    const shop = await shopModel.findOne({ user: req.user.id })
    const count = await typeModel.countDocuments({ shopId: shop._id })
    const sumPage = Math.ceil(count / limit)

    if (!pageNumber || pageNumber < 1) {
      pageNumber = 1
    }

    if (pageNumber > sumPage && sumPage !== 0) {
      pageNumber = sumPage
    }

    const skip = (pageNumber - 1) * limit

    const types = await typeModel
      .find({ shopId: shop._id })
      .populate('cateId', 'name')
      .limit(limit)
      .skip(skip)
      .sort({ _id: 1 })
    const dateOfC = types.map(type => toStringDate.dmy(type.createdAt))

    const name = ''
    const isIndexPage = 1
    const index = 'types of products'
    const main = 'productTypes/main'

    res.render('index', {
      main,
      index,
      data: types,
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

const renderSearchPage = async (req, res) => {
  try {
    const name = req.params.name || ''
    const pageNumberPayload = parseInt(req.params.pageNumber, 10) || 1

    const { limit, skip, obj_find, sumPage, pageNumber } = await calculateData(
      pageNumberPayload,
      typeModel,
      name,
      req.user
    )

    const types = await typeModel
      .find(obj_find)
      .populate('cateId', 'name')
      .limit(limit)
      .skip(skip)
      .sort({ _id: 1 })

    const dateOfC = types.map(type => toStringDate.dmy(type.createdAt))

    const index = 'types of products'
    const main = 'productTypes/main'
    const isIndexPage = 0

    res.render('index', {
      main,
      index,
      data: types,
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
    const { typeId } = req.params

    const type = await typeModel
      .findOne({ _id: typeId })
      .populate('cateId', 'name')
    const cates = await cateModel.find()
    if (!type) {
      return responseHandler.notfoundpage(res)
    }
    const index = 'product types'
    const main = 'productTypes/edit.type.ejs'
    res.render('index', { main, index, data: type, cates, role: req.user.role })
  } catch (error) {
    responseHandler.notfoundpage(res)
  }
}

const renderAddPage = async (req, res) => {
  try {
    var index = 'types of products'
    var main = 'productTypes/add.type.ejs'

    const cates = await cateModel.find()
    res.render('index', { main, index, cates, role: req.user.role })
  } catch (error) {
    responseHandler.error(res)
  }
}

const add = async (req, res) => {
  try {
    const { name, cateName } = req.body

    const shop = await shopModel.findOne({ user: req.user.id })
    const cate = await cateModel.findOne({ name: cateName })
    const type = await typeModel.findOne({ name, cateId: cate._id })

    if (type) {
      return responseHandler.badrequest(
        res,
        'Product type name is already exists!'
      )
    }

    const newType = new typeModel({
      ...req.body,
      cateId: cate._id,
      shopId: shop._id
    })

    await newType.save()

    responseHandler.created(res, {
      ...newType._doc,
      message: 'Add product type successfully!'
    })
  } catch (error) {
    responseHandler.error(res)
  }
}

const getList = async (req, res) => {
  try {
    const types = await typeModel.find()

    if (!types) return responseHandler.notfound(res)

    return responseHandler.ok(res, types)
  } catch (error) {
    responseHandler.error(res)
  }
}

const removeType = async (req, res) => {
  try {
    const { typeId } = req.params

    const type = await typeModel.findOne({
      _id: typeId
    })

    if (!type) {
      return responseHandler.notfound(res)
    }

    const product = await productModel.findOne({
      typeId: typeId
    })

    if (product) {
      return responseHandler.error(
        res,
        'Cannot delete this type, have product used this type'
      )
    }

    await type.deleteOne()

    return responseHandler.ok(res, 'Remove type succcessfully')
  } catch (error) {
    responseHandler.error(res)
  }
}

const removeTypes = async (req, res) => {
  try {
    const typeIds = JSON.parse(JSON.stringify(req.body)).ids
    const types = await typeModel.find({
      _id: { $in: typeIds }
    })

    if (!types) {
      return responseHandler.notfound(res)
    }

    const product = await productModel.findOne({
      typeId: typeId
    })

    if (product) {
      return responseHandler.error(
        res,
        'Cannot delete this type, have product used this type'
      )
    }
    await typeModel.deleteMany({
      _id: { $in: typeIds }
    })

    return responseHandler.ok(res, 'types successfully deleted')
  } catch (error) {
    console.log(error)
    responseHandler.error(res)
  }
}

const update = async (req, res) => {
  try {
    const { id, name, cateName } = req.body
    const cate = await cateModel.findOne({ name: cateName })
    const type = await typeModel.findOne({ name, cateId: cate._id })
    if (type)
      return responseHandler.badrequest(res, {
        message: 'type name is already exists!'
      })
    await typeModel.updateOne({ _id: id }, { name, cateId: cate._id })
    return responseHandler.ok(res, { message: 'Update type successfully!' })
  } catch (error) {
    responseHandler.error(res)
  }
}

const getInfoByName = async (req, res) => {
  try {
    const { name } = req.params
    const types = await typeModel.find({ name })
    return responseHandler.ok(res, types)
  } catch (error) {
    responseHandler.error(res)
  }
}

const getTypesOfCate = async (req, res) => {
  try {
    const { cateName } = req.params

    const cate = await cateModel.findOne({ name: cateName })

    if (!cate) responseHandler.notfound(res)

    const types = await typeModel.find({ cateId: cate._id })

    responseHandler.ok(res, types)
  } catch (error) {
    responseHandler.error(error)
  }
}

module.exports = {
  getList,
  renderIndexPage,
  renderAddPage,
  add,
  getList,
  removeType,
  removeTypes,
  renderEditPage,
  renderSearchPage,
  update,
  getInfoByName,
  getTypesOfCate
}
