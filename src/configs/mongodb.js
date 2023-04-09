const mongoose = require('mongoose')
const env = require('../configs/environment.js')

const connectDb = async () => {
  mongoose.set('strictQuery', false)
  mongoose
    .connect(env.MONGODB_URL)
    .then(() => {
      console.log('Connected successfully to Mongodb !!')
    })
    .catch(() => {
      console.log('Failed to connect Mongodb!')
    })
}
// let dbInstance = null
// const connectDb = async () => {
//   const client = new MongoClient(env.MONGODB_URL, {
//     useUnifiedTopology: true,
//     useNewUrlParser: true
//   })
//
//   //Connetc the client to server
//   await client.connect()
//   dbInstance = client.db(env.DATABASE_NAME)
//   console.log('Connected successfully to Mongodb !!')
// }

const getDb = () => {
  if (!dbInstance) throw new Error('Must connect to database first!!')
  return dbInstance
}

module.exports = { connectDb, getDb }
