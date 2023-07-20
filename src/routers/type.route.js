const express = require('express')
const router = express.Router()
const typeModel = require('../models/type.model')
const cateModel = require('../models/category.model')
const { toStringColor } = require('../utilities/toStringColor')

router.get('/index(/:pageNumber?)', async (req, res) => {
  try {
    const limit = 8

    var sumData = await typeModel.find()
    var sumPage = 0
    if (sumData.length != 0) {
      var sumPage = Math.ceil(sumData.length / limit)
    }

    var pageNumber = req.params.pageNumber

    if (pageNumber == 1 || pageNumber == undefined || pageNumber < 1) {
      pageNumber = 1
    }

    if (pageNumber > sumPage && sumPage != 0) {
      pageNumber = sumPage
    }

    // set up var skip
    var skip = (pageNumber - 1) * limit

    typeModel
      .find()
      .populate('cateId', 'name')
      .limit(limit)
      .skip(skip)
      .sort({ _id: 1 })
      .exec((err, data) => {
        var flag = 0
        var name = ''
        var index = 'types of products'
        var main = 'productTypes/main'
        var dateOfC = []

        data.forEach(item => {
          if (item.cateId) {
            const { name, ...rest } = item.cateId
            item.cateName = name
            delete item.cateId.name
          }
        })

        data.forEach(item => {
          const ymd = item.createdAt.toISOString().substring(0, 10).split('-')
          const dateString = ymd[2] + '-' + ymd[1] + '-' + ymd[0]
          dateOfC.push(dateString)
        })

        data.forEach(product => {
          product.colorCate = toStringColor(product.cateId.name)
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
      })
  } catch (error) {
    res.send({ kq: 0, msg: 'Connection to the database failed' })
  }
})

router.get('/add', async (req, res) => {
  try {
    var index = 'types of products'
    var main = 'productTypes/add.type.ejs'

    const cates = await cateModel.find().exec()
    res.render('index', { main, index, cates })
  } catch (error) {
    res.send({ kq: 0, msg: 'Connection to the database failed' })
  }
})

router.post('/add', async function (req, res) {
  try {
    const name = req.body.name
    const cateName = req.body.cateName

    const cate = await cateModel.findOne({ name: cateName }).exec()

    await typeModel.create({
      name,
      cateId: cate._id
    })
    res.send({ kq: 1, msg: 'Data added successfully' })
  } catch (err) {
    console.log(err)
    res.send({ kq: 0, msg: 'Connection to the database failed' })
  }
})

router.get('/getAllCate', async (req, res) => {
  await typeModel.find().exec((err, data) => {
    if (err) {
      throw new Error(err)
    } else {
      res.send({ kq: 1, data, msg: 'Get all successfully.' })
    }
  })
})

router.get('/search/(:name?)(/:pageNumber?)', async (req, res) => {
  var name = ''
  name = req.params.name

  var obj_find = {}
  if (name != '' && name != undefined) {
    const regex = new RegExp('(' + name + ')', 'i')
    obj_find = { name: { $regex: regex } }
  }

  const limit = 8

  var sumPage = 0
  var sumData = await typeModel.find(obj_find)
  if (sumData.length != 0) {
    var sumPage = Math.ceil(sumData.length / limit)
  }

  var pageNumber = req.params.pageNumber

  if (pageNumber == 1 || pageNumber == undefined || pageNumber < 1) {
    pageNumber = 1
  }

  if (pageNumber > sumPage && sumPage != 0) {
    pageNumber = sumPage
  }

  // set up var skip
  var skip = (pageNumber - 1) * limit

  typeModel
    .find(obj_find)
    .limit(limit)
    .skip(skip)
    .sort({ _id: 1 })
    .exec((err, data) => {
      if (err) {
        throw err
      } else {
        var index = 'types of products'
        var main = 'productTypes/main'
        var flag = 1
        var dateOfC = []
        for (var i = 0; i < data.length; i++) {
          var stringdate = data[i].createdAt.toISOString().substring(0, 10)
          var arr = stringdate.split('-')
          var stringdate = arr[2] + '-' + arr[1] + '-' + arr[0]
          dateOfC.push(stringdate)
        }
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
      }
    })
})

router.post('/delete', function (req, res) {
  var _id = req.body.id
  const check_obj = { $or: [{ _id }] }
  typeModel.find(check_obj).exec((err, data) => {
    if (err) {
      res.send({ kq: 0, msg: 'Connection to database failed' })
    }

    if (data == '') {
      res.send({ kq: 0, msg: 'Data id not exists' })
    } else {
      typeModel.findByIdAndDelete({ _id: data[0]._id }, (err, data) => {
        if (err) {
          res.send({ kq: 0, msg: 'Connection to database failed' })
        } else res.send({ kq: 1, msg: 'Delete data successfully!' })
      })
    }
  })
})

router.post('/deleteGr', function (req, res) {
  var arr = JSON.parse(JSON.stringify(req.body))

  const check_obj = { _id: { $in: arr.arr } }
  typeModel.deleteMany(check_obj, (err, data) => {
    if (err) {
      res.json({ kq: 0, msg: 'Connection to database failed' })
    } else {
      res.json({ kq: 1, msg: 'Delete data successfully!' })
    }
  })
})

router.get('/edit/:id', async function (req, res) {
  try {
    var id = req.params.id

    const check_obj = { $or: [{ _id: id }] }
    typeModel
      .find(check_obj)
      .populate('cateId', 'name')
      .exec(async (err, data) => {
        if (err) {
          throw err
        } else {
          if (data == '') {
            res.send({ kq: 0, msg: 'Data is not exists.' })
          } else {
            data.forEach(item => {
              if (item.cateId) {
                const { name, ...rest } = item.cateId
                item.cateName = name
                delete item.cateId.name
              }
            })
            const cates = await cateModel.find().exec()
            var index = 'product types'
            var main = 'productTypes/edit.type.ejs'
            res.render('index', { main, index, data, cates })
          }
        }
      })
  } catch (error) {
    res.render('404page')
  }
})

router.post('/update', async function (req, res) {
  try {
    const id = req.body.id
    const name = req.body.name
    const cateName = req.body.cateName
    const cate = await cateModel({ name: cateName })

    var obj = { name, cateId: cate._id }
    const check_obj = { $or: [{ name }] }

    typeModel.find(check_obj).exec((err, data) => {
      if (err) {
        res.send({ kq: 0, msg: 'Connection to database failed' })
      } else {
        typeModel.updateMany({ _id: id }, obj, (err, data) => {
          if (err) {
            res.send({ kq: 0, msg: 'Cate name is already exists!' })
          } else {
            res.send({ kq: 1, msg: 'Update data successfully' })
          }
        })
      }
    })
  } catch (error) {
    res.send({ kq: 0, msg: error })
  }
})

router.get('/getTypeByName/:name', async (req, res) => {
  try {
    const name = req.params.name
    const type = await typeModel.find({ name })

    res.send({ kq: 1, data: type, msg: 'Get type successfully.' })
  } catch (error) {
    res.send({ kq: 0, msg: 'Something went wrong!' })
  }
})

module.exports = router
