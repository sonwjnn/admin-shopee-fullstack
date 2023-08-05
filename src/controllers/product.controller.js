const multer = require('multer')
const fs = require('fs')
const path = require('path')
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
    const { name, productType, cateType, originalImageName } = req.body

    const cate = await categoryModel.findOne({ name: cateType })
    const product = await productModel.findOne({ name, cateId: cate._id })
    const type = await typeModel.findOne({
      name: productType,
      cateId: cate._id
    })

    if (product)
      return responseHandler.badrequest(
        res,
        `Exists a product name in category ${cateType}!`
      )

    const newProduct = new productModel({
      ...req.body,
      cateId: cate._id,
      typeId: type._id
    })

    newProduct.setImage(originalImageName)

    await newProduct.save()

    responseHandler.created(res, {
      ...newProduct._doc,
      message: 'Add product successfully!'
    })
  } catch (error) {
    console.log(error)
    responseHandler.error(res)
  }
}

const update = async (req, res) => {
  try {
    const { id, cateType, productType, originalImageName, name } = req.body

    const cate = await categoryModel.findOne({ name: cateType })
    const type = await typeModel.findOne({
      name: productType,
      cateId: cate._id
    })
    const product = await productModel.findOne({ _id: id })

    if (product.name !== name) {
      const isProduct = await productModel.findOne({ name, cateId: cate._id })
      if (isProduct)
        return responseHandler.badrequest(
          res,
          `Exists a product name in category ${cateType}!`
        )
    }

    if (originalImageName && originalImageName !== product.imageName) {
      const path = 'src/assets/img/products/' + product.imageName
      fs.unlinkSync(path)
      product.setImage(originalImageName)
    }

    product.setInfo({ ...req.body, cateId: cate._id, typeId: type._id })

    await product.save()

    responseHandler.ok(res, {
      product,
      message: 'Update product successfully!'
    })
  } catch (error) {
    console.log(error)
    responseHandler.error(res)
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

    product.favorites = await favoriteModel
      .find({ productId })
      .populate('user')
      .sort('-createdAt')
    return responseHandler.ok(res, product)
  } catch (error) {
    responseHandler.error(res)
  }
}

const getProductOfCate = async (req, res) => {
  try {
    const { cateName } = req.params

    const cate = await categoryModel.findOne({ name: cateName })

    if (!cate) responseHandler.notfound(res)

    const products = await productModel
      .find({ cateId: cate._id })
      .populate('cateId', 'name')
      .populate('typeId', 'name')

    responseHandler.ok(res, products)
  } catch (error) {
    responseHandler.error(res)
  }
}

const getImage = async (req, res) => {
  try {
    const { imageName } = req.params
    // Đường dẫn tới thư mục chứa ảnh trên server
    if (!imageName) return responseHandler.notfound(res)

    const imagePath = path.join(
      __dirname,
      `../assets/img/products/${imageName}`
    )

    fs.readFile(imagePath, (err, data) => {
      // Convert the image data to a base64-encoded string
      const base64Image = Buffer.from(data).toString('base64')

      // Send the base64-encoded image as a response
      return responseHandler.ok(res, base64Image)
    })
  } catch (error) {
    console.log(error)
    responseHandler.error(res)
  }
}

const uploadImage = async (req, res) => {
  try {
    const imageName = req.headers['x-image-name']
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, 'src/assets/img/products')
      },
      filename: function (req, file, cb) {
        if (
          file.mimetype !== 'image/png' &&
          file.mimetype !== 'image/jpg' &&
          file.mimetype !== 'image/jpeg'
        ) {
          return cb(new Error('Wrong type file'))
        }

        cb(null, imageName)
      }
    })

    const limits = { fileSize: 3072000 }
    const upload = multer({ storage, limits }).single('productsImage')

    upload(req, res, err => {
      if (err instanceof multer.MulterError) {
        return responseHandler.error(res, err.message)
      } else if (err) {
        return responseHandler.error(res, err.message)
      }
      // The image was uploaded successfully
      const imageName = req.file.filename
      const originalImageName = req.file.originalname

      return responseHandler.created(res, { imageName, originalImageName })
    })
  } catch (error) {
    console.log(error)
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
  removeProducts,
  uploadImage,
  getProductOfCate,
  getImage
}
