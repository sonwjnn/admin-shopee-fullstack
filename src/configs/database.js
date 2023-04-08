const mongoose = require('mongoose')
const url = process.env.MONGODB_URL

mongoose
  .connect(url)
  .then(() => {
    console.log('Successfully!')
  })
  .catch(() => {
    console.error('Failed to connect Mongodb!')
  })
