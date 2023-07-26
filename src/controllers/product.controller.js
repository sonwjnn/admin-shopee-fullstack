const responseHandler = require('../handlers/response.handler')
const tokenMiddleware = require('../middlewares/token.middleware')
const cartModel = require('../models/cart.model')
const productModel = require('../models/product.model')
const categoryModel = require('../models/category.model')
const reviewModel = require('../models/review.model')
const userModel = require('../models/user.model')
const favoriteModel = require('../models/favorite.model')
const typeModel = require('../models/type.model')
const { toStringDate } = require('../utilities/toStringDate')
const calculateData = require('../utilities/calculateData')
const fs = require('fs')

const renderIndexPage = async (req, res) => {
  try {
    const pageNumberPayload = parseInt(req.params.pageNumber, 10) || 1
    const name = ''

    const { limit, skip, obj_find, sumPage, pageNumber } = await calculateData(
      pageNumberPayload,
      productModel,
      name
    )

    const products = await productModel
      .find(obj_find)
      .populate('cateId', 'name')
      .populate('typeId', 'name')
      .limit(limit)
      .skip(skip)
      .sort({ _id: 1 })

    if (!products) return responseHandler.notfound(res)

    const index = 'products'
    const main = 'products/main'
    const isIndexPage = 1
    res.render('index', {
      main,
      index,
      data: products,
      sumPage,
      pageNumber,
      name,
      isIndexPage
    })
  } catch (error) {
    responseHandler.error(res)
  }
}

const renderAddPage = async (req, res) => {
  try {
    const types = await typeModel.find().select('name')

    // Lọc ra các type có tên trùng nhau
    const uniqueTypeNames = [...new Set(types.map(type => type.name))]

    const status = [
      'Có sẵn',
      'Hoạt động',
      'Ngừng hoạt động',
      'Ngừng sản xuất',
      'Đã xóa'
    ]
    var index = 'products'
    var main = 'products/add.product.ejs'

    res.render('index', { main, index, types: uniqueTypeNames, status })
  } catch (error) {
    res.send({ kq: 0, msg: 'Something went wrong with types or cates!' })
  }
}

const renderEditPage = async (req, res) => {
  try {
    const { productId } = req.params
    const product = await productModel
      .findOne({ _id: productId })
      .populate('cateId', 'name')
      .populate('typeId', 'name')

    if (!product) return responseHandler.notfound(res)

    const types = await typeModel.find().select('name')
    const uniqueTypeNames = [...new Set(types.map(type => type.name))]
    const status = [
      'Có sẵn',
      'Hoạt động',
      'Ngừng hoạt động',
      'Ngừng sản xuất',
      'Đã xóa'
    ]
    const producedAt = toStringDate.ymd(product.producedAt)
    const index = 'products'
    const main = 'products/edit.product.ejs'
    res.render('index', {
      main,
      index,
      data: product,
      types: uniqueTypeNames,
      producedAt,
      status
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
      productModel,
      name
    )

    const products = await productModel
      .find(obj_find)
      .populate('cateId', 'name')
      .populate('typeId', 'name')
      .limit(limit)
      .skip(skip)
      .sort({ _id: 1 })

    if (!products) return responseHandler.notfound(res)

    const index = 'products'
    const main = 'products/main'
    const isIndexPage = 0
    res.render('index', {
      main,
      index,
      data: products,
      sumPage,
      pageNumber,
      name,
      isIndexPage
    })
  } catch (error) {
    responseHandler.error(res)
  }
}

const addProduct = async (req, res) => {
  try {
    const { name, productType, cateType, discount } = req.body

    const isProduct = await productModel.findOne({ name })
    if (isProduct)
      return res.send({ kq: 0, msg: 'Product name is already exists!' })

    const cate = await categoryModel.findOne({ name: cateType })
    const type = await typeModel.findOne({
      name: productType,
      cateId: cate._id
    })

    const product = new productModel({
      ...req.body,
      cateId: cate._id,
      typeId: type._id
    })

    await product.save()

    res.send({ kq: 0, msg: 'Add product successfully!' })

    responseHandler.created(res, product)
  } catch (error) {
    res.send({ kq: 0, msg: 'Connection to database failed' })
    responseHandler.error(res)
  }
}

const update = async (req, res) => {
  try {
    const { id, cateType, productType, imageName } = req.body
    const cate = await categoryModel.findOne({ name: cateType })
    const type = await typeModel.findOne({
      name: productType,
      cateId: cate._id
    })

    const currentProduct = await productModel.findOne({ _id: id })

    if (imageName !== '' && imageName !== currentProduct.imageName) {
      const path = 'src/assets/img/products/' + currentProduct.imageName
      fs.unlinkSync(path)
    }

    const update = {
      ...req.body,
      cateId: cate._id,
      typeId: type._id
    }

    if (imageName === '') delete update.imageName

    await productModel.updateOne({ _id: id }, update)

    res.send({ kq: 1, msg: 'Successfully updated product data' })
  } catch (error) {
    res.send({ kq: 0, msg: 'Failed to edit product' })
  }
}

const removeProduct = async (req, res) => {
  try {
    const { productId } = req.params
    const product = await productModel.findOne({ _id: productId })
    if (!product) {
      res.send({ kq: 0, msg: 'Data id not exists' })
      return responseHandler.notfound(res)
    }

    const path = 'src/assets/img/products/' + product.imageName
    fs.unlinkSync(path)

    await product.deleteOne()

    res.send({ kq: 1, msg: 'Remove product successfully!' })
    responseHandler.ok(res)
  } catch (error) {
    res.send({ kq: 0, msg: 'Failed to remove product' })
  }
}

const removeProducts = async function (req, res) {
  try {
    const productIds = JSON.parse(JSON.stringify(req.body)).ids
    const products = await productModel.find({ _id: { $in: productIds } })
    if (!products) {
      res.send({ kq: 0, msg: 'Data id not exists' })
      return responseHandler.notfound(res)
    }
    for (const product of products) {
      var path = 'src/assets/img/products/' + product.imageName
      fs.unlinkSync(path)
    }

    await productModel.deleteMany({ _id: { $in: productIds } })

    return responseHandler.ok(res, 'Products successfully deleted')
  } catch (error) {
    responseHandler.error(res)
  }
}

const getList = async (req, res) => {
  try {
    const products = await productModel
      .find()
      .populate('cateId', 'name')
      .populate('typeId', 'name')

    if (!products) return responseHandler.notfound(res)

    return responseHandler.ok(res, products)
  } catch (error) {
    responseHandler.error(res)
  }
}

const getDetail = async (req, res) => {
  try {
    const { productId } = req.params
    const product = await productModel
      .findById(productId)
      .populate('cateId', 'name')
      .populate('typeId', 'name')
      .lean()
    const tokenDecoded = tokenMiddleware.tokenDecode(req)
    if (tokenDecoded) {
      const user = await userModel.findById(tokenDecoded.data)
      if (user) {
        const isCart = await cartModel.findOne({
          user: user.id,
          productId
        })
        product.isCart = isCart !== null

        const isFavorite = await favoriteModel.findOne({
          user: user.id,
          productId
        })

        product.isFavorite = isFavorite !== null
      }
    }

    product.reviews = await reviewModel
      .find({ productId })
      .populate('user')
      .sort('-createdAt')
    return responseHandler.ok(res, product)
  } catch (error) {
    responseHandler.error(res)
  }
}

module.exports = {
  renderIndexPage,
  renderAddPage,
  renderEditPage,
  renderSearchPage,
  getList,
  getDetail,
  addProduct,
  update,
  removeProduct,
  removeProducts
}
