const MongoClient = require('mongodb').MongoClient
const env = require('../configs/environment.js')

let dbInstance = null
const connectDb = async () => {
  const client = new MongoClient(env.MONGODB_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  })

  //Connetc the client to server
  await client.connect()
  dbInstance = client.db(env.DATABASE_NAME)
  console.log('Connected successfully to Mongodb !!')
}

const getDb = () => {
  if (!dbInstance) throw new Error('Must connect to database first!!')
  return dbInstance
}

module.exports = { connectDb, getDb }
