const express = require('express')
const multer = require('multer')
const fs = require('fs')
const productModel = require('../models/product.model')
const cateModel = require('../models/category.model')
const typeModel = require('../models/type.model')
const filepath = 'angularShopping/src/assets/json/archiveImage.json'
const tokenMiddleware = require('../middlewares/token.middleware')
const productController = require('../controllers/product.controller')

var jwt = require('jsonwebtoken')
const { toStringColor } = require('../utilities/toStringColor')
var secret = 'none'

var imageNameSend = ''
var imageNameReal = ''

const router = express.Router({ mergeParams: true })

router.get('/index(/:pageNumber?)', async (req, res) => {
  try {
    const limit = 8
    const productsCount = await productModel.countDocuments()
    var sumPage = 0
    if (productsCount != 0) {
      sumPage = Math.ceil(productsCount / limit)
    }

    var pageNumber = req.params.pageNumber

    if (pageNumber == 1 || pageNumber == undefined || pageNumber < 1) {
      pageNumber = 1
    }

    if (pageNumber > sumPage && sumPage != 0) {
      pageNumber = sumPage
    }

    // set up var skip
    const skip = (pageNumber - 1) * limit

    const products = await productModel
      .find()
      .populate('cateId', 'name')
      .populate('typeId', 'name')
      .limit(limit)
      .skip(skip)
      .sort({ _id: 1 })

    products.forEach(product => {
      product.colorType = toStringColor(product.typeId.name)
      product.colorCate = toStringColor(product.cateId.name)
    })

    const index = 'products',
      main = 'products/main',
      flag = 0,
      name = ''
    res.render('index', {
      main,
      index,
      data: products,
      sumPage,
      pageNumber,
      name,
      flag
    })
  } catch (error) {
    res.send({ kq: 0, msg: error })
  }
})

router.get('/add', productController.addProductPayload)

router.post('/add', productController.addProduct)

// declare storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/assets/img/products')
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
  arrAfter.replace(/ /g, '-')
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
        // msg: 'updload sucessfully',
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

  const limit = 8

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

router.get('/detail/:productId', productController.getDetail)

router.post('/edit', productController.editProduct)

router.get('/edit/:productId', productController.editProductPayload)

router.delete('/:productId', productController.removeProduct)

router.post('/deleteGroup', productController.removeProducts)

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
