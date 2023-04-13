const express = require('express')
const router = express.Router()
const userModel = require('../models/M_Users')
const fs = require('fs')
const filepath = 'angularShopping/src/assets/json/archieveToken4200.json'

var jwt = require('jsonwebtoken')
var secret = 'localhost4200'

const bcrypt = require('bcryptjs')
const salt = bcrypt.genSaltSync(10)

const readJsonFile = function (filepath, id, token) {
  var fileString = fs.readFileSync(filepath).toString()
  var fileObj = [{}]
  if (fileString == '') {
    var obj = { id: id, token: token }
    fileObj.push(obj)
  } else {
    fileObj = JSON.parse(fileString)

    var flag = 1
    for (var i = 0; i < fileObj.length; i++) {
      if (id == fileObj[i].id) {
        fileObj[i].token = token
        flag = 0
      }
    }

    if (flag == 1) {
      var obj = { id: id, token: token }
      fileObj.push(obj)
    }
  }

  var json = JSON.stringify(fileObj)
  fs.writeFileSync(filepath, json)
}

const deleteToken = function (filepath, id) {
  var fileString = fs.readFileSync(filepath).toString()
  var fileObj = [{}]
  var index = 0
  var flag = 0
  if (fileString == '') {
  } else {
    fileObj = JSON.parse(fileString)
    for (var i = 0; i < fileObj.length; i++) {
      if (id == fileObj[i].id) {
        flag = 1
        index = i
      }
    }
  }

  if (flag == 1) {
    fileObj.splice(index, 1)
  }
  var json = JSON.stringify(fileObj)
  fs.writeFileSync(filepath, json)
}

const isExists = function (filepath, token) {
  var fileString = fs.readFileSync(filepath).toString()
  var fileObj = [{}]
  var flag = 0
  if (fileString == '') {
    return false
  } else {
    fileObj = JSON.parse(fileString)
    for (var i = 0; i < fileObj.length; i++) {
      if (token == fileObj[i].token) {
        flag = 1
      }
    }
  }

  if (flag == 1) {
    return true
  }
}

router.post('/processLogin', function (req, res) {
  var username = (password = '')
  var flag = 1

  username = req.body.username
  password = req.body.password

  if (flag == 1) {
    userModel.find({ username }).exec((err, data) => {
      if (err) {
        res.send({ kq: 0, msg: 'Connection to db failed.' })
      } else {
        if (data == '') {
          res.send({ kq: 0, msg: 'Your username is not exists.' })
        } else {
          var result = bcrypt.compareSync(password, data[0].password)

          if (result == false) {
            res.send({ kq: 0, msg: 'Your password is not correct.' })
          } else {
            jwt.sign(
              { data: data[0]._id },
              secret,
              { expiresIn: 10 * 365 * 24 * 60 * 60 },
              (err, token) => {
                if (err) {
                  res.send({ kq: 0, msg: err })
                } else {
                  readJsonFile(filepath, data[0]._id, token)
                  res.send({
                    kq: 1,
                    msg: token,
                    id: data[0]._id,
                    username: data[0].username
                  })
                }
              }
            )
          }
        }
      }
    })
  }
})

router.post('/logout', function (req, res) {
  var token = (id = '')

  token = req.body.token

  jwt.verify(token, secret, function (err, decoded) {
    if (err) {
      // token expired!
      res.send({ kq: 0, msg: 'token expired' })
    } else {
      if (decoded.data != '') {
        id = decoded.data
        deleteToken(filepath, id)
        res.send({ kq: 1, msg: 'token deleted!' })
      } else {
        res.send({ kq: 0, msg: 'No data!' })
      }
    }
  })
})

router.post('/getMaintainUser', function (req, res) {
  var token = req.body.token

  var flag = isExists(filepath, token)

  if (flag == false) {
    res.send({ kq: 0, msg: 'none token' })
  } else {
    jwt.verify(token, secret, function (err, decoded) {
      if (err) {
        // token expired!
        res.send({ kq: 0, msg: 'token expired' })
      } else {
        if (decoded.data != '') {
          userModel.find({ $or: [{ _id: decoded.data }] }).exec((err, data) => {
            if (err) throw err
            else {
              if (data.length != 0) {
                res.send({
                  kq: 1,
                  msg: 'success',
                  username: data[0].username,
                  id: decoded.data,
                  data: data
                })
              } else {
                res.send({ kq: 0, msg: 'error' })
              }
            }
          })
        } else {
          res.send({ kq: 0, msg: 'No data!' })
        }
      }
    })
  }
})

router.post('/add', function (req, res) {
  var name = (username = password = email = phone = address = '')
  var flag = 1

  name = req.body.name
  username = req.body.username
  password = req.body.password
  email = req.body.email
  phone = req.body.phone
  address = req.body.address
  role = 'user'

  if (flag == 1) {
    const obj = {
      name,
      username,
      password: bcrypt.hashSync(password, salt),
      email,
      phone,
      address,
      role
    }

    userModel
      .find({ $or: [{ username }, { email }, { phone }] })
      .exec((err, data) => {
        if (err) res.send({ kq: 0, msg: 'Connect failed to DB' })

        if (data != '') {
          res.send({ kq: 0, msg: 'DB is already exists' })
        } else {
          userModel.insertMany(obj, (err, data) => {
            if (err) res.send({ kq: 0, msg: 'Connect failed to DB' })

            res.send({ kq: 1, msg: data })
          })
        }
      })
  }
})

router.post('/*', (req, res, next) => {
  var token = req.body.token
  var flag = isExists(filepath, token)

  if (flag == false) {
    res.send({ kq: 0, msg: 'none token' })
  } else {
    next()
  }
})

module.exports = router
