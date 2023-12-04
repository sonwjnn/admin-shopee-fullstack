const responseHandler = require('../handlers/response.handler')
const cateModel = require('../models/category.model')
const { toStringDate } = require('../utilities/toStringDate')
const calculateData = require('../utilities/calculateData')
const productModel = require('../models/product.model')
const typeModel = require('../models/type.model')
const slugify = require('slugify')

const renderIndexPage = async (req, res) => {
  try {
    const pageNumberPayload = parseInt(req.params.pageNumber, 10) || 1
    const name = ''

    const { limit, skip, sumPage, pageNumber } = await calculateData(
      pageNumberPayload,
      cateModel,
      name,
      req.user
    )

    const cates = await cateModel
      .find()
      .limit(limit)
      .skip(skip)
      .sort({ _id: 1 })

    const dateOfC = cates.map(cate => toStringDate.dmy(cate.createdAt))

    const isIndexPage = 1
    const index = 'categories'
    const main = 'categories/main'

    res.render('index', {
      main,
      index,
      data: cates,
      sumPage,
      pageNumber,
      name,
      isIndexPage,
      dateOfC,
      role: req.user.role
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
      cateModel,
      name,
      req.user
    )

    const cates = await cateModel
      .find(obj_find)
      .limit(limit)
      .skip(skip)
      .sort({ _id: 1 })

    const dateOfC = cates.map(cate => toStringDate.dmy(cate.createdAt))

    const index = 'categories'
    const main = 'categories/main'
    // flag = 1 render index page, flag = 2 render search page
    const isIndexPage = 0

    res.render('index', {
      main,
      index,
      data: cates,
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
    const { cateId } = req.params

    const cate = await cateModel.findOne({ _id: cateId })

    if (!cate) {
      return responseHandler.notfoundpage(res)
    }
    const index = 'categories'
    const main = 'categories/edit.category.ejs'
    res.render('index', { main, index, data: cate, role: req.user.role })
  } catch (error) {
    responseHandler.notfoundpage(res)
  }
}

const renderAddPage = async (req, res) => {
  try {
    const index = 'categories'
    const main = 'categories/add.category.ejs'
    res.render('index', { main, index, role: req.user.role })
  } catch (error) {
    responseHandler.notfoundpage(res)
  }
}

const add = async (req, res) => {
  try {
    const { name } = req.body

    const cate = await cateModel.findOne({ name })

    if (cate)
      return responseHandler.badrequest(res, 'Category name is already exists!')

    if (req.body.name) {
      req.body.slug = slugify(req.body.name)
    }

    const newCate = new cateModel({ ...req.body, user: req.user.id })

    await newCate.save()

    responseHandler.created(res, {
      ...newCate._doc,
      message: 'Add cate successfully!'
    })
  } catch (error) {
    responseHandler.error(res)
  }
}

const getList = async (req, res) => {
  try {
    const cates = await cateModel.find()

    if (!cates) return responseHandler.notfound(res)

    return responseHandler.ok(res, cates)
  } catch (error) {
    responseHandler.error(res)
  }
}

const removeCate = async (req, res) => {
  try {
    const { cateId } = req.params

    const [cate, product, type] = await Promise.all([
      cateModel.findOne({ _id: cateId }),
      productModel.findOne({ cateId }),
      typeModel.findOne({ cateId })
    ])

    if (!cate) {
      return responseHandler.notfound(res)
    }

    if (product || type) {
      return responseHandler.error(
        res,
        'Cannot delete this type, have product used this type'
      )
    }

    await cate.deleteOne()

    return responseHandler.ok(res, 'Remove cate succcessfully')
  } catch (error) {
    responseHandler.error(res)
  }
}

const removeCates = async (req, res) => {
  try {
    const cateIds = JSON.parse(JSON.stringify(req.body)).ids

    const [cates, product, type] = await Promise.all([
      cateModel.find({ _id: { $in: cateIds } }),
      productModel.findOne({ cateId: { $in: cateIds } }),
      typeModel.findOne({ cateId: { $in: cateIds } })
    ])

    if (!cates.length) {
      return responseHandler.notfound(res)
    }

    if (product || type) {
      return responseHandler.error(
        res,
        'Cannot delete this type, have product used this type'
      )
    }

    await cateModel.deleteMany({
      _id: { $in: cateIds }
    })

    return responseHandler.ok(res, 'Categories successfully deleted')
  } catch (error) {
    console.log(error)
    responseHandler.error(res)
  }
}

const update = async (req, res) => {
  try {
    const { id, name } = req.body
    const cate = await cateModel.findOne({ name })
    if (cate)
      return responseHandler.badrequest(res, {
        message: 'Cate name is already exists!'
      })

    if (req.body.name) {
      req.body.slug = slugify(req.body.name)
    }

    await cateModel.updateOne({ _id: id }, { ...req.body })
    return responseHandler.ok(res, { message: 'Update category successfully!' })
  } catch (error) {
    responseHandler.error(res)
  }
}

module.exports = {
  getList,
  renderIndexPage,
  renderAddPage,
  add,
  getList,
  removeCate,
  removeCates,
  renderEditPage,
  renderSearchPage,
  update
}
