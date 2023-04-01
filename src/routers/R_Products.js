const express = require('express')
const router = express.Router()
const multer = require('multer')
const fs = require('fs')
const productModel = require('../models/M_Products')
const cateModel = require('../models/M_Categories')
const filepath = 'angularShopping/src/assets/json/archiveImage.json'

var jwt = require('jsonwebtoken')
var secret = 'none'

var imageNameSend = ''
var imageNameReal = ''

router.get('/index(/:pageNumber?)', async (req, res) => {
  const limit = 5

  var sumData = await productModel.find()
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

  productModel
    .find()
    .limit(limit)
    .skip(skip)
    .sort({ _id: 1 })
    .exec((err, data) => {
      if (err) {
        throw err
      } else {
        var index = 'products'
        var main = 'products/main'
        var flag = 0
        var name = ''
        res.render('index', {
          main,
          index,
          data,
          sumPage,
          pageNumber,
          name,
          flag
        })
      }
    })
})

router.get('/add', (req, res) => {
  cateModel.find().exec((err, dataCate) => {
    if (err) {
      throw err
    } else {
      var index = 'products'
      var main = 'products/productAdd'
      res.render('index', { main, index, dataCate })
    }
  })
})

router.post('/add', function (req, res) {
  var name,
    origin,
    price,
    cateName,
    imageName,
    info,
    imageNameTrue,
    dateOfM,
    flag = 1
  name = req.body.name
  origin = req.body.origin
  price = req.body.price
  imageName = req.body.imageName
  cateName = req.body.cateName
  info = req.body.info
  dateOfM = req.body.dateOfM
  imageNameTrue = req.body.imageNameReal

  var idUser = ''
  jwt.verify(req.cookies.token, secret, function (err, decoded) {
    if (err) throw err
    else {
      idUser = decoded.data
    }
  })

  if (flag == 1) {
    const obj = {
      name,
      origin,
      price,
      imageName,
      cateName,
      info,
      dateOfM
    }

    const check_obj = { $or: [{ name }] }

    productModel.find(check_obj).exec((err, data) => {
      if (err) {
        res.send({ kq: 0, msg: 'Connection to database failed' })
      } else {
        if (data == '') {
          /* if(imageNameTrue != ''){
                            readJsonFile(filepath, idUser, imageNameTrue);
                        }
                        */
          productModel.create(obj, (err, data) => {
            if (err) {
              res.send({ kq: 0, msg: 'Connection to database failed' })
            } else {
              res.send({ kq: 1, msg: 'Data added successfully' })
            }
          })
        } else {
          res.send({ kq: 0, msg: 'Product name is already exists!' })
        }
      }
    })
  }
})

// declare storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'angularShopping/src/assets/img/products')
  },
  filename: function (req, file, cb) {
    if (
      file.mimetype != 'image/png' &&
      file.mimetype != 'image/jpg' &&
      file.mimetype != 'image/jpeg'
    ) {
      cb('Wrong type file')
    }
    // change image name
    else {
      imageNameReal = file.originalname
      var arrAfter = uniqueImageName(file.originalname)
      imageNameSend = arrAfter
      cb(null, arrAfter)

      const fileSize = parseInt(req.headers['content-length'])
      //console.log(file);

      /*  readJsonFile(filepath, arrAfter, file.mimetype, fileSize).then((msg) => {
                 makeJsonFile(filepath, msg);
             }).catch((msg) => {
                 throw msg;
             }) */
    }
  }
})

// make the image name unique and remove whitespace
function uniqueImageName(fileOriginalname) {
  var arr = fileOriginalname.split('.')
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
  var arrAfter = arr[0] + '-' + uniqueSuffix + '.' + arr[1]
  arrAfter.replaceAll(' ', '-')
  return arrAfter
}

/* // Read file json and make a String text json
const readJsonFile = function (filepath, nameI, typeI, sizeI) {
    return new Promise((resolve, reject) => {
        fs.readFile(filepath, 'utf8', (err, data) => {
            if (err) reject('failed');
            if (data == '') {
                text = '[{"name":"' + nameI + '","type": "' + typeI + '","size":"' + sizeI + '"}]';
                resolve(text);
            }
            else {
                text = data.replaceAll(']', ',{"name":"' + nameI + '","type":"' + typeI + '","size":"' + sizeI + '"}]');
                resolve(text);
            }
        })
    })
}

// Write a new file json 
function makeJsonFile(filepath, msg) {
    fs.writeFile(filepath, msg, function (err) {
        if (err) throw err;
    })
} */

// declare limit of image size
const limits = { fileSize: 3072000 }
const upload = multer({ storage, limits }).single('productsImage')

// upload products image
router.post('/upLoadFile', function (req, res) {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      res.send({ kq: 0, msg: err })
    } else if (err) {
      res.send({ kq: 0, msg: err })
    } else {
      res.send({
        kq: 1,
        msg: 'updload sucessfully',
        imageNameSend,
        imageNameReal
      })
    }
  })
})

router.get('/getAllProduct', function (req, res) {
  productModel.find().exec((err, data) => {
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
  var sumData = await productModel.find(obj_find)
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

  productModel
    .find(obj_find)
    .limit(limit)
    .skip(skip)
    .sort({ _id: 1 })
    .exec((err, data) => {
      if (err) {
        throw err
      } else {
        var index = 'products'
        var main = 'products/main'
        var flag = 1
        res.render('index', {
          main,
          index,
          data,
          sumPage,
          pageNumber,
          name,
          flag
        })
      }
    })
})

router.post('/showDetail', function (req, res) {
  var id = req.body.id

  const check_obj = { _id: id }
  productModel.find(check_obj).exec((err, data) => {
    if (err) {
      res.send({ kq: 0, msg: 'Connection to database failed' })
    } else {
      if (data == '') {
        res.send({ kq: 0, data, msg: 'Data id not exists' })
      } else {
        res.send({ kq: 1, data, msg: 'Get data sucesssfully' })
      }
    }
  })
})

router.post('/update', function (req, res) {
  var id,
    name,
    origin,
    price,
    cateName,
    imageName,
    info,
    dateOfM,
    flag = 1

  id = req.body.id
  name = req.body.name
  origin = req.body.origin
  price = req.body.price
  imageName = req.body.imageName
  cateName = req.body.cateName
  info = req.body.info
  dateOfM = req.body.dateOfM
  var error = ''

  if (flag == 1) {
    var obj
    if (imageName == '') {
      obj = {
        name,
        origin,
        price,
        cateName,
        info,
        dateOfM
      }
    } else {
      obj = {
        name,
        origin,
        price,
        imageName,
        cateName,
        info,
        dateOfM
      }
    }
    // check username or email or phone
    const check_obj = { $or: [{ name }] }

    productModel.find(check_obj).exec((err, data) => {
      if (err) {
        res.send({ kq: 0, msg: 'Connection to database failed' })
      } else {
        if (imageName == '') {
        } else {
          try {
            var path =
              'angularShopping/src/assets/img/products/' + data[0].imageName
            fs.unlinkSync(path)
          } catch (err) {
            if (err.code === 'ENOENT') {
              console.log('File not found!')
            } else {
              throw err
            }
          }
        }
        productModel.updateMany({ _id: id }, obj, (err, data) => {
          if (err) {
            res.send({ kq: 0, msg: 'Product name is already exists!' })
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

router.get('/edit/:id', function (req, res) {
  var id = req.params.id

  if (id != '') {
    const check_obj = { $or: [{ _id: id }] }
    productModel.find(check_obj).exec((err, data) => {
      if (err) {
        throw err
      } else {
        if (data == '') {
          res.send({ kq: 0, msg: 'Data is not exists.' })
        } else {
          cateModel.find().exec((err, dataCate) => {
            if (err) {
              throw err
            } else {
              var index = 'products'
              var main = 'products/productEdit'
              res.render('index', { main, index, data, dataCate })
            }
          })
        }
      }
    })
  } else {
    res.render('404page')
  }
})

router.post('/delete', function (req, res) {
  var _id = req.body.id
  const check_obj = { $or: [{ _id }] }
  productModel.find(check_obj).exec((err, data) => {
    if (err) {
      res.send({ kq: 0, msg: 'Connection to database failed' })
    }

    if (data == '') {
      res.send({ kq: 0, msg: 'Data id not exists' })
    } else {
      productModel.findByIdAndDelete({ _id: data[0]._id }, (err, data2) => {
        if (err) {
          res.send({ kq: 0, msg: 'Connection to database failed' })
        } else {
          try {
            var path =
              'angularShopping/src/assets/img/products/' + data[0].imageName
            fs.unlinkSync(path)
          } catch (err) {
            if (err.code === 'ENOENT') {
              console.log('File not found!')
            } else {
              throw err
            }
          }
          res.send({ kq: 1, msg: 'Delete data successfully!' })
        }
      })
    }
  })
})

router.post('/deleteGr', async function (req, res) {
  var arr = JSON.parse(JSON.stringify(req.body))

  const check_obj = { _id: { $in: arr.arr } }

  await productModel.find(check_obj).exec((err, data) => {
    if (err) {
      res.send({ kq: 0, msg: 'Connection to database failed' })
    } else {
      for (var i = 0; i < data.length; i++) {
        try {
          var path =
            'angularShopping/src/assets/img/products/' + data[i].imageName
          fs.unlinkSync(path)
        } catch (err) {
          if (err.code === 'ENOENT') {
            console.log('File not found!')
          } else {
            throw err
          }
        }
      }
    }
  })

  productModel.deleteMany(check_obj, (err, data) => {
    if (err) {
      res.json({ kq: 0, msg: 'Connection to database failed' })
    } else {
      res.json({ kq: 1, msg: 'Delete data successfully!' })
    }
  })
})

const readJsonFile = function (filepath, id, imageName) {
  var fileString = fs.readFileSync(filepath).toString()
  var fileObj = [{}]
  if (fileString == '') {
    var obj = { id: id, imageName: imageName }
    fileObj.push(obj)
  } else {
    fileObj = JSON.parse(fileString)

    var flag = 1
    for (var i = 0; i < fileObj.length; i++) {
      if (id == fileObj[i].id) {
        fileObj[i].imageName = imageName
        flag = 0
      }
    }

    if (flag == 1) {
      var obj = { id: id, imageName: imageName }
      fileObj.push(obj)
    }
  }

  var json = JSON.stringify(fileObj)
  fs.writeFileSync(filepath, json)
}

module.exports = router
