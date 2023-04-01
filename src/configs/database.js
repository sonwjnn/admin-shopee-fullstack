const mongoose = require('mongoose')
const url =
  'mongodb+srv://sonwin111:hoangson123@admin-products-page.576mbud.mongodb.net/?retryWrites=true&w=majority'
mongoose
  .connect(url)
  .then(() => {
    console.log('Successfully!')
  })
  .catch(() => {
    console.error('Failed to connect Mongodb!')
  })
