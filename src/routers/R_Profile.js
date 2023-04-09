const express = require('express')
const router = express.Router()
const userModel = require('../models/M_Users')

var jwt = require('jsonwebtoken')
var secret = 'none'

router.get('/index', (req, res) => {
  jwt.verify(req.cookies.token, secret, function (err, decoded) {
    var id = decoded.data
    userModel.find({ _id: id }).exec((err, data) => {
      if (err) {
        throw err
      } else {
        if (data == '') {
        } else {
          var index = 'profile'
          var main = 'profile/main'
          res.render('index', { main, index, data })
        }
      }
    })
  })
})

router.post('/update', function (req, res) {
  var id,
    name,
    username,
    phone,
    email,
    address,
    city,
    district,
    sex,
    birthday,
    role,
    story,
    error = '',
    flag = 1

  id = req.body.id
  username = req.body.username
  name = req.body.name
  email = req.body.email
  phone = req.body.phone
  address = req.body.address
  city = req.body.city
  district = req.body.district
  sex = req.body.sex
  birthday = req.body.birthday
  role = req.body.role
  story = req.body.story

  if (flag == 1) {
    const obj = {
      name,
      email,
      phone,
      address,
      city,
      district,
      sex,
      birthday,
      role,
      story
    }

    // check username or email or phone
    const check_obj = { $or: [{ email }, { phone }] }

    userModel.find(check_obj).exec((err, data) => {
      if (err) {
        res.send({ kq: 0, msg: 'Connection to database failed' })
      } else {
        if (data.length == 0) {
          userModel.updateMany({ username: username }, obj, (err, data) => {
            if (err) {
              res.send({ kq: 0, msg: 'Connection to database failed' })
            } else {
              res.send({ kq: 1, msg: 'Update data successfully' })
            }
          })
        } else if (data.length == 1) {
          if (data[0]._id == id) {
            userModel.updateMany({ username: username }, obj, (err, data) => {
              if (err) {
                res.send({ kq: 0, msg: 'Connection to database failed' })
              } else {
                res.send({ kq: 1, msg: 'Update data successfully' })
              }
            })
          } else {
            res.send({
              kq: 0,
              msg: 'Data already exists! <br> Please check again your phone and email.'
            })
          }
        } else {
          res.send({
            kq: 0,
            msg: 'Data already exists! <br> Please check again your phone and email.'
          })
        }
      }
    })
  } else {
    res.send({ kq: 0, msg: error })
  }
})

module.exports = router
