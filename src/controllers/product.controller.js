const multer = require('multer')
const fs = require('fs')
const path = require('path')
const slugify = require('slugify')
const responseHandler = require('../handlers/response.handler')
const tokenMiddleware = require('../middlewares/token.middleware')
const cartModel = require('../models/cart.model')
const productModel = require('../models/product.model')
const categoryModel = require('../models/category.model')
const reviewModel = require('../models/review.model')
const userModel = require('../models/user.model')
const favoriteModel = require('../models/favorite.model')
const typeModel = require('../models/type.model')
const { toStringDate } = require('../utils/formatter')
const calculateData = require('../utils/calculateData')
const shopModel = require('../models/shop.model')
const { formatPriceToVND } = require('../utils/formatter')
const { cloudinaryDeleteImage } = require('../utils/helpers')
const { USER_ROLE } = require('../utils/constants')
const { getProductsQuery } = require('../utils/queries')

const renderIndexPage = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin'
    const pageNumber = parseInt(req.params.pageNumber, 10) || 1

    const limit = 10

    const shop = await shopModel.findOne({ user: req.user.id })
    const count = isAdmin
      ? await productModel.countDocuments()
      : await productModel.countDocuments({ shopId: shop._id })
    const sumPage = Math.ceil(count / limit)

    if (!pageNumber || pageNumber < 1) {
      pageNumber = 1
    }

    if (pageNumber > sumPage && sumPage !== 0) {
      pageNumber = sumPage
    }

    const skip = (pageNumber - 1) * limit

    const products = isAdmin
      ? await productModel
          .find()
          .populate('cateId', 'name')
          .populate('typeId', 'name')
          .limit(limit)
          .skip(skip)
          .sort({ _id: 1 })
      : await productModel
          .find({ shopId: shop._id })
          .populate('cateId', 'name')
          .populate('typeId', 'name')
          .limit(limit)
          .skip(skip)
          .sort({ _id: 1 })

    if (!products) return responseHandler.notfound(res)

    const index = 'products'
    const main = 'products/main'
    const isIndexPage = 1

    const formattedProducts = products.map(product => ({
      _id: product._id,
      name: product.name,
      origin: product.origin,
      typeName: product.typeId.name,
      imageName: product.imageName,
      cateName: product.cateId.name,
      imageName: product.imageName,
      price: formatPriceToVND(Number(product.discountPrice))
    }))
    res.render('index', {
      main,
      index,
      data: formattedProducts,
      sumPage,
      pageNumber,
      name: '',
      isIndexPage,
      role: req.user.role,
      USER_ROLE
    })
  } catch (error) {
    console.log(error)
    responseHandler.error(res)
  }
}

const renderAddPage = async (req, res) => {
  try {
    const shop = await shopModel.findOne({ user: req.user.id })
    const types = await typeModel.find({ shopId: shop._id }).select('name')

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

    res.render('index', {
      main,
      index,
      types: uniqueTypeNames,
      status,
      role: req.user.role
    })
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
      status,
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
      productModel,
      name,
      req.user
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
      isIndexPage,
      role: req.user.role
    })
  } catch (error) {
    responseHandler.error(res)
  }
}

const addProduct = async (req, res) => {
  try {
    const { productType, cateType } = req.body

    const shop = await shopModel.findOne({ user: req.user.id })
    if (!req.user.role !== 'admin' && !shop) return

    const cate = await categoryModel.findOne({ name: cateType })
    const type = await typeModel.findOne({
      name: productType,
      cateId: cate._id
    })

    if (req.body.name) {
      req.body.slug = slugify(req.body.name)
    }

    const newProduct = new productModel({
      ...req.body,
      cateId: cate._id,
      typeId: type._id,
      shopId: shop._id
    })

    await newProduct.save()

    shop.productCount += 1
    await shop.save()

    responseHandler.created(res, {
      ...newProduct._doc,
      message: 'Add product successfully!'
    })
  } catch (error) {
    responseHandler.error(res)
  }
}

const update = async (req, res) => {
  try {
    const { id, cateType, productType } = req.body

    const cate = await categoryModel.findOne({ name: cateType })
    const type = await typeModel.findOne({
      name: productType,
      cateId: cate._id
    })
    const product = await productModel.findOne({ _id: id })

    // delete old image
    const oldImages = product.images.map(image => image.public_id)

    for (const id of oldImages) {
      await cloudinaryDeleteImage(id)
    }

    // update product
    if (req.body.name) {
      req.body.slug = slugify(req.body.name)
    }
    product.setInfo({ ...req.body, cateId: cate._id, typeId: type._id })

    await product.save()

    responseHandler.ok(res, {
      product,
      message: 'Update product successfully!'
    })
  } catch (error) {
    responseHandler.error(res)
  }
}

const removeProduct = async (req, res) => {
  try {
    const { productId } = req.params

    const shop = await shopModel.findOne({ user: req.user.id })
    const product = await productModel.findOne({ _id: productId })
    if (!product) {
      res.send({ kq: 0, msg: 'Data id not exists' })
      return responseHandler.notfound(res)
    }

    await favoriteModel.deleteMany({ productId })
    await cartModel.deleteMany({ productId })
    await reviewModel.deleteMany({ productId })

    // delete old image
    const oldImages = product.images.map(image => image.public_id)

    for (const id of oldImages) {
      await cloudinaryDeleteImage(id)
    }

    await product.deleteOne()

    const updateProductCount =
      shop.productCount - 1 < 0 ? 0 : shop.productCount - 1
    shop.productCount = updateProductCount
    await shop.save()

    responseHandler.ok(res, {
      message: 'Delete product successfully!'
    })
  } catch (error) {
    responseHandler.error(res)
  }
}

const removeProducts = async function (req, res) {
  try {
    const shop = await shopModel.findOne({ user: req.user.id })
    const productIds = JSON.parse(JSON.stringify(req.body)).ids
    const products = await productModel.find({ _id: { $in: productIds } })
    if (!products) {
      res.send({ kq: 0, msg: 'Data id not exists' })
      return responseHandler.notfound(res)
    }

    // delete old image
    for (const product of products) {
      const oldImages = product.images.map(image => image.public_id)
      for (const id of oldImages) {
        await cloudinaryDeleteImage(id)
      }
    }

    await productModel.deleteMany({ _id: { $in: productIds } })
    await favoriteModel.deleteMany({ productId: { $in: productIds } })
    await cartModel.deleteMany({ productId: { $in: productIds } })
    await reviewModel.deleteMany({ productId: { $in: productIds } })

    // update shop data
    const len = productIds.length
    const updateProductCount =
      shop.productCount - len < 0 ? 0 : shop.productCount - len
    shop.productCount = updateProductCount
    await shop.save()

    responseHandler.ok(res, { message: 'Delete products successfully!' })
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
      .populate('shopId')

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
      .populate('shopId')
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
    console.log(error)
    responseHandler.error(res)
  }
}

const getProductsOfCateBySlug = async (req, res) => {
  try {
    const { cateSlug } = req.params

    const cate = await categoryModel.findOne({ slug: cateSlug })

    if (!cate) responseHandler.notfound(res)

    const products = await productModel
      .find({ cateId: cate._id })
      .populate('cateId')
      .populate('typeId')
      .populate('shopId')

    responseHandler.ok(res, products)
  } catch (error) {
    responseHandler.error(res)
  }
}

const getListByCategory = async (req, res) => {
  try {
    let {
      sortOrder,
      rating,
      price,
      category,
      page = 1,
      limit = 10,
      city
    } = req.body
    const categoryFilter = category ? { category } : {}
    const basicQuery = getProductsQuery(price, rating, city)

    const categoryDoc = await categoryModel.findOne({
      slug: categoryFilter.category
    })

    if (categoryDoc) {
      basicQuery.push({
        $match: {
          cateId: categoryDoc._id
        }
      })
    }

    const productsCount = await productModel.aggregate(basicQuery)
    const count = productsCount.length
    const size = count > limit ? page - 1 : 0
    const currentPage = count > limit ? Number(page) : 1

    // paginate query
    const paginateQuery = [
      { $sort: sortOrder },
      { $skip: size * limit },
      { $limit: limit * 1 }
    ]

    const products = await productModel.aggregate(
      basicQuery.concat(paginateQuery)
    )

    responseHandler.ok(res, {
      products,
      totalPages: Math.ceil(count / limit),
      currentPage,
      count
    })
  } catch (error) {
    console.log('error', error)
    responseHandler.error(res)
  }
}

const getProductsByShopId = async (req, res) => {
  try {
    const { shopId } = req.params

    const products = await productModel
      .find({ shopId })
      .populate('shopId')
      .populate('cateId')
      .populate('typeId')

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

    fs.readFile(imagePath, (error, data) => {
      // Convert the image data to a base64-encoded string
      const base64Image = data ? Buffer.from(data).toString('base64') : ''

      if (!base64Image) return responseHandler.notfound(res)

      // Send the base64-encoded image as a response
      return responseHandler.ok(res, base64Image)
    })
  } catch (error) {
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
  getProductsOfCateBySlug,
  getProductsByShopId,
  getImage,
  getListByCategory
}
