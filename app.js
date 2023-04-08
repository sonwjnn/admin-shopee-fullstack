const express = require('express')
const path = require('path')
const env = require('./src/configs/environment')
const { connectDb } = require('./src/configs/mongodb.js')

connectDb()
  .then(() => boostServer())
  .catch(error => {
    console.error(error)
    process.exit(1)
  })

const boostServer = () => {
  const app = express()

  app.use(express.static('./src/assets'))
  app.set('views', path.join(__dirname, './src/views'))
  app.set('view engine', 'ejs')

  const cookieParser = require('cookie-parser')
  app.use(cookieParser())

  var bodyParser = require('body-parser')
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())

  app.use((req, res, next) => {
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    )
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-Requested-With,content-type'
    )
    res.setHeader('Access-Control-Allow-Credentials', true)
    next()
  })

  app.use('/', require('./src/configs/controls'))
  require('./src/configs/mongodb')

  app.listen(env.APP_PORT, () => {
    console.log(
      `Hello sonwin, server is running at port: http://${env.APP_HOST}:${env.APP_PORT}/`
    )
  })
}
