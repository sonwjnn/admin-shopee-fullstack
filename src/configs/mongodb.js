const mongoose = require('mongoose')
const env = require('../configs/environment.js')

const connectDb = async () => {
  mongoose.set('strictQuery', false)
  mongoose
    .connect(env.MONGODB_URL)
    .then(() => {
      console.log('Connected successfully to Mongodb !!')
    })
    .catch(error => {
      console.log(error)
      console.log('Failed to connect Mongodb!')
    })
}

const getDb = () => {
  if (!dbInstance) throw new Error('Must connect to database first!!')
  return dbInstance
}

module.exports = { connectDb, getDb }
