const express = require('express')
const path = require('path')
const env = require('./configs/environment')
const { connectDb } = require('./configs/mongodb.js')
const { corsOptions } = require('./configs/cors')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const body = require('body-parser')
const multer = require('multer')
const upload = multer()

connectDb()
  .then(() => boostServer())
  .catch(error => {
    console.error(error)
    process.exit(1)
  })

const boostServer = () => {
  const app = express()
  /*   app.use(express.static('./assets')) */
  app.use(body.urlencoded({ extended: true }))
  app.use(body.json())
  app.use(express.static(path.join(__dirname, './assets')))
  app.use(express.static(path.join(__dirname, './utilities')))
  app.set('views', path.join(__dirname, './views'))
  app.set('view engine', 'ejs')

  app.use(cors(corsOptions))

  app.use(cookieParser())

  var bodyParser = require('body-parser')
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())

  app.use('/', require('./configs/controls'))

  app.listen(env.APP_PORT, () => {
    console.log(
      `Hello sonwin, server is running at port: http://${env.APP_HOST}:${env.APP_PORT}/`
    )
  })
}
