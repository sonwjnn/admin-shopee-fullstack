const express = require('express')
const router = express.Router()
const userModel = require('../models/M_Users')
const fs = require('fs')
const filepath = 'src/assets/json/archiveToken.json'

var jwt = require('jsonwebtoken')
var secret = 'none'

const bcrypt = require('bcryptjs')
const salt = bcrypt.genSaltSync(10)

// Read and write token into file json
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

router.get(
  '/login',
  (req, res, next) => {
    if (req.cookies.token == '' || req.cookies.token == undefined) {
      next()
    } else {
      res.redirect('/admin/dashboards/index')
    }
  },
  (req, res) => {
    res.render('login')
  }
)

router.get(
  '/register',
  (req, res, next) => {
    if (req.cookies.token == '' || req.cookies.token == undefined) {
      next()
    } else {
      res.redirect('/admin/dashboards/index')
    }
  },
  (req, res) => {
    res.render('register')
  }
)

router.get('/*', (req, res, next) => {
  jwt.verify(req.cookies.token, secret, function (err, decoded) {
    if (err) {
      // token expired!
      res.redirect('/admin/login')
    } else {
      if (decoded.data != '') {
        // next();
        var fileString = fs.readFileSync(filepath).toString()

        var fileObj = [{}]
        if (fileString == '') {
          res.redirect('/admin/login')
        } else {
          fileObj = JSON.parse(fileString)

          flag = 1
          for (var i = 0; i < fileObj.length; i++) {
            if (decoded.data == fileObj[i].id) {
              next()
              flag = 0
            }
          }
          if (flag == 1) {
            res.redirect('/admin/login')
          }
        }
      } else {
        res.redirect('/admin/login')
      }
    }
  })
})

// new mothod login with token verify
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
          } else if (data[0].role == 'user') {
            res.send({ kq: 0, msg: 'You are not authorized.' })
          } else {
            // using token
            jwt.sign(
              { data: data[0]._id },
              secret,
              { expiresIn: 10 * 365 * 24 * 60 * 60 },
              (err, token) => {
                if (err) {
                  res.send({ kq: 0, msg: err })
                } else {
                  readJsonFile(filepath, data[0]._id, token)

                  res
                    .cookie('token', token, { maxAge: 10 * 365 * 24 * 60 * 60 })
                    .send({ kq: data[0], msg: 'Login successfully.' })
                }
              }
            )
          }
        }
      }
    })
  }
})

module.exports = router
