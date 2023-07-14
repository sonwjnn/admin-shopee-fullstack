const mongoose = require('mongoose')
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

const addProduct = async (req, res) => {
  try {
    const { name, productType, cateType } = req.body
    // var idUser = ''
    // jwt.verify(req.cookies.token, secret, function (err, decoded) {
    //   if (err) throw err
    //   else {
    //     idUser = decoded.data
    //   }
    // })

    const isProduct = await productModel.findOne({ name })
    if (isProduct)
      return res.send({ kq: 0, msg: 'Product name is already exists!' })

    const cate = await categoryModel.findOne({ name: cateType })
    const type = await typeModel.findOne({ name: productType })

    const product = new productModel({
      ...req.body,
      cateId: cate._id,
      typeId: type._id
    })

    await product.save()

    res.send({ kq: 0, msg: 'Add product successfully!' })

    // error must to fix
    responseHandler.created(res, product)
  } catch (error) {
    res.send({ kq: 0, msg: 'Connection to database failed' })
    responseHandler.error(res)
  }
}

const editProduct = async (req, res) => {
  try {
    const id = req.params.id
    const objectId = mongoose.Types.ObjectId(id)
    const product = await productModel
      .findOne({ _id: objectId })
      .populate('cateId', 'name')
      .populate('typeId', 'name')

    if (!product) return res.send({ kq: 0, msg: 'Data is not exists.' })

    const types = await typeModel.find().select('name')
    const uniqueTypeNames = [...new Set(types.map(type => type.name))]
    const producedAt = toStringDate.ymd(product.producedAt)
    const index = 'products'
    const main = 'products/edit.product.ejs'
    res.render('index', {
      main,
      index,
      data: product,
      types: uniqueTypeNames,
      producedAt
    })
  } catch (error) {
    res.send({ kq: 0, msg: 'Edit product failed' })
    responseHandler.error(res)
  }
}

const getList = async (req, res) => {
  try {
    const response = await productModel.find().exec(async (err, data) => {
      if (err) {
        res.send({ kq: 0, msg: 'Connect failed to DB' })
      } else {
        typeCate = [
          'Electronic',
          'Clothes',
          'Office Suply',
          'Books',
          'Bedding',
          'Other'
        ]

        var dataCate = await categoryModel.find()

        var arr = []
        for (var i = 0; i < typeCate.length; i++) {
          var count = 0
          for (var j = 0; j < dataCate.length; j++) {
            if (typeCate[i] == dataCate[j].type) {
              count = 1
            }
          }

          if (count == 0) {
            arr.push({
              name: typeCate[i],
              check: 0
            })
          } else {
            arr.push({
              name: typeCate[i],
              check: 1
            })
          }
        }

        res.send({ kq: 1, msg: data, msgDouble: arr })
      }
    })
    // return responseHandler.ok(res, response)
  } catch (error) {
    responseHandler.error(res)
  }
}

const getDetail = async (req, res) => {
  try {
    const { productId } = req.params
    const product = await productModel.findById(productId).lean()
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

module.exports = { getList, getDetail, addProduct, editProduct }
