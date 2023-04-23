require('dotenv').config()

const env = {
  MONGODB_URL: process.env.MONGODB_URL,
  APP_HOST: process.env.APP_HOST,
  APP_PORT: process.env.APP_PORT,
  DATABASE_NAME: process.env.DATABASE_NAME,
  SECRET_TOKEN: process.env.SECRET_TOKEN
}

module.exports = env
