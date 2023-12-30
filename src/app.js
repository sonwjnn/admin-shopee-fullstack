const express = require('express')
const path = require('path')
const env = require('./configs/environment')
const { connectDb } = require('./configs/mongodb.js')
const { corsOptions } = require('./configs/cors')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const productModel = require('./models/product.model')

connectDb()
  .then(() => boostServer())
  .catch(error => {
    console.error(error)
    process.exit(1)
  })

const boostServer = () => {
  const app = express()
  app.use(express.urlencoded({ extended: true }))

  app.use((req, res, next) => {
    if (req.originalUrl === '/api/webhook') {
      next() // Do nothing with the body because I need it in a raw state.
    } else {
      express.json()(req, res, next) // ONLY do express.json() if the received request is NOT a WebHook from Stripe.
    }
  })

  app.use(express.static(path.join(__dirname, './assets')))
  app.use(express.static(path.join(__dirname, './utils')))
  app.set('views', path.join(__dirname, './views'))
  app.set('view engine', 'ejs')

  app.use(cors(corsOptions))

  app.use(cookieParser())

  app.use('/', require('./configs/controls'))

  app.listen(env.APP_PORT, () => {
    console.log(
      `Hello sonwin, server is running at port: http://${env.APP_HOST}:${env.APP_PORT}/`
    )
  })
}
