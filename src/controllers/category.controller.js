const responseHandler = require('../handlers/response.handler.js')
const cateModel = require('../models/category.model.js')
const { toStringDate } = require('../utilities/toStringDate.js')

const renderIndexPage = async (req, res) => {
  try {
    const limit = 8
    const sumData = await cateModel.find()
    const sumPage = Math.ceil(sumData.length / limit)
    let pageNumber = parseInt(req.params.pageNumber, 10) || 1

    pageNumber = pageNumber < 1 ? 1 : pageNumber
    pageNumber = pageNumber > sumPage && sumPage !== 0 ? sumPage : pageNumber

    const skip = (pageNumber - 1) * limit

    const cates = await cateModel
      .find()
      .limit(limit)
      .skip(skip)
      .sort({ _id: 1 })

    const dateOfC = cates.map(cate => toStringDate.dmy(cate.createdAt))

    const flag = 0
    const name = ''
    const index = 'categories'
    const main = 'categories/main'

    res.render('index', {
      main,
      index,
      data: cates,
      sumPage,
      pageNumber,
      name,
      flag,
      dateOfC
    })
  } catch (error) {
    console.log(error)
    responseHandler.error(res)
  }
}

const calculateSearchCate = async (name, pageNumber) => {
  const limit = 8
  const obj_find = {}

  if (name && name !== undefined) {
    const regex = new RegExp(`(${name})`, 'i')
    obj_find.name = { $regex: regex }
  }

  const sumData = await cateModel.find(obj_find)
  const sumPage = Math.ceil(sumData.length / limit)

  if (!pageNumber || pageNumber < 1) {
    pageNumber = 1
  }

  if (pageNumber > sumPage && sumPage !== 0) {
    pageNumber = sumPage
  }

  const skip = (pageNumber - 1) * limit
  const cates = await cateModel
    .find(obj_find)
    .limit(limit)
    .skip(skip)
    .sort({ _id: 1 })

  return { data: cates, sumPage, pageNumber }
}

const renderSearchPage = async (req, res) => {
  try {
    const name = req.params.name || ''
    const pageNumberPayload = parseInt(req.params.pageNumber, 10) || 1

    const { data, sumPage, pageNumber } = await calculateSearchCate(
      name,
      pageNumberPayload
    )

    const index = 'categories'
    const main = 'categories/main'
    const flag = 1
    const dateOfC = data.map(category => {
      const stringDate = category.createdAt.toISOString().substring(0, 10)
      const [year, month, day] = stringDate.split('-')
      return `${day}-${month}-${year}`
    })

    res.render('index', {
      main,
      index,
      data,
      sumPage,
      pageNumber,
      name,
      flag,
      dateOfC
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
    res.render('index', { main, index, data: cate })
  } catch (error) {
    responseHandler.notfoundpage(res)
  }
}

const renderAddPage = async (req, res) => {
  try {
    const index = 'categories'
    const main = 'categories/add.category.ejs'
    res.render('index', { main, index })
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

    const newCate = new cateModel({ ...req.body })

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
    return responseHandler.ok(res, cates)
  } catch (error) {
    responseHandler.error(res)
  }
}

const removeCate = async (req, res) => {
  try {
    const { cateId } = req.params

    const cate = await cateModel.findOne({
      _id: cateId
    })

    if (!cate) {
      return responseHandler.notfound(res)
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
    const cates = await cateModel.find({
      _id: { $in: cateIds }
    })

    if (!cates) {
      return responseHandler.notfound(res)
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
    await cateModel.updateOne({ _id: id }, { name })
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
