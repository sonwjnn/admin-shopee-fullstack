const express = require('express')
const router = express.Router()
const cateModel = require('../models/M_Categories')

router.get('/index(/:pageNumber?)', async (req, res) => {
  const limit = 5

  var sumData = await cateModel.find()
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

  cateModel
    .find()
    .limit(limit)
    .skip(skip)
    .sort({ _id: 1 })
    .exec((err, data) => {
      if (err) {
        throw err
      } else {
        var flag = 0
        var name = ''
        var index = 'categories'
        var main = 'categories/main'
        var dateOfC = []
        for (var i = 0; i < data.length; i++) {
          var stringdate = data[i].date_created.toISOString().substring(0, 10)
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

router.get('/add', (req, res) => {
  var index = 'categories'
  var main = 'categories/cateAdd'
  res.render('index', { main, index })
})

router.post('/add', function (req, res) {
  var name,
    type,
    flag = 1

  name = req.body.name
  type = req.body.type

  if (flag == 1) {
    const obj = {
      name,
      type
    }

    // check username or email or phone
    const check_obj = { $or: [{ name }] }

    cateModel.find(check_obj).exec((err, data) => {
      if (err) {
        res.send({ kq: 0, msg: 'Connection to database failed' })
      } else {
        if (data == '') {
          cateModel.create(obj, (err, data) => {
            if (err) {
              res.send({ kq: 0, msg: 'Connection to database failed' })
            } else {
              res.send({ kq: 1, msg: 'Data added successfully' })
            }
          })
        } else {
          res.send({ kq: 0, msg: 'Your cate name is already exists.' })
        }
      }
    })
  } else {
    res.send({ kq: 0, msg: error })
  }
})

router.get('/getAllCate', function (req, res) {
  cateModel.find().exec((err, data) => {
    if (err) {
      throw err
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

  const limit = 5

  var sumPage = 0
  var sumData = await cateModel.find(obj_find)
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

  cateModel
    .find(obj_find)
    .limit(limit)
    .skip(skip)
    .sort({ _id: 1 })
    .exec((err, data) => {
      if (err) {
        throw err
      } else {
        var index = 'categories'
        var main = 'categories/main'
        var flag = 1
        var dateOfC = []
        for (var i = 0; i < data.length; i++) {
          var stringdate = data[i].date_created.toISOString().substring(0, 10)
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
  cateModel.find(check_obj).exec((err, data) => {
    if (err) {
      res.send({ kq: 0, msg: 'Connection to database failed' })
    }

    if (data == '') {
      res.send({ kq: 0, msg: 'Data id not exists' })
    } else {
      cateModel.findByIdAndDelete({ _id: data[0]._id }, (err, data) => {
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
  cateModel.deleteMany(check_obj, (err, data) => {
    if (err) {
      res.json({ kq: 0, msg: 'Connection to database failed' })
    } else {
      res.json({ kq: 1, msg: 'Delete data successfully!' })
    }
  })
})

router.get('/edit/:id', function (req, res) {
  var id = req.params.id

  if (id != '') {
    const check_obj = { $or: [{ _id: id }] }
    cateModel.find(check_obj).exec((err, data) => {
      if (err) {
        throw err
      } else {
        if (data == '') {
          res.send({ kq: 0, msg: 'Data is not exists.' })
        } else {
          var index = 'categories'
          var main = 'categories/cateEdit'
          res.render('index', { main, index, data })
        }
      }
    })
  } else {
    res.render('404page')
  }
})

router.post('/update', function (req, res) {
  var id,
    name,
    type,
    flag = 1

  id = req.body.id
  name = req.body.name
  type = req.body.type

  if (flag == 1) {
    var obj = { name, type }
    const check_obj = { $or: [{ name }] }

    cateModel.find(check_obj).exec((err, data) => {
      if (err) {
        res.send({ kq: 0, msg: 'Connection to database failed' })
      } else {
        cateModel.updateMany({ _id: id }, obj, (err, data) => {
          if (err) {
            res.send({ kq: 0, msg: 'Cate name is already exists!' })
          } else {
            res.send({ kq: 1, msg: 'Update data successfully' })
          }
        })
      }
    })
  } else {
    res.send({ kq: 0, msg: error })
  }
})

module.exports = router
