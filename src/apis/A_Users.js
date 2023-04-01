const express = require('express')
const router = express.Router()
const userModel = require('../models/M_Users')
const fs = require('fs')
const filepath = 'angularShopping/src/assets/json/archieveToken4200.json'

var jwt = require('jsonwebtoken')
var secret = 'localhost4200'

const bcrypt = require('bcryptjs')
const salt = bcrypt.genSaltSync(10)

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
  story = req.body.story
  /*   story = req.body.story; */

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

router.post('/updatePassword', function (req, res) {
  var username,
    oldPass,
    newPass,
    flag = 1
  var password = ''

  username = req.body.username
  oldPass = req.body.oldPass
  newPass = req.body.newPass

  newPass = bcrypt.hashSync(newPass, salt)
  const obj = {
    password: newPass
  }

  if (flag == 1) {
    const check_obj = { $or: [{ username }] }
    userModel.find(check_obj).exec((err, data) => {
      if (err) {
        res.send({ kq: 0, msg: 'Connection to database failed' })
      } else {
        password = data[0].password
        if (bcrypt.compareSync(oldPass, password)) {
          userModel.updateMany({ username: username }, obj, (err, data) => {
            if (err) {
              res.send({ kq: 0, msg: 'Connection to database failed' })
            } else {
              res.send({ kq: 1, msg: 'Update password successfully' })
            }
          })
        } else {
          res.send({ kq: 0, msg: 'The password you entered is not correct!' })
        }
      }
    })
  }
})

module.exports = router
