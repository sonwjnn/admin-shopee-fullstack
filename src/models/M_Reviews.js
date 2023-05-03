const mongoose = require('mongoose')
const { Schema } = require('mongoose')
const modelOptions = require('./model.option')

const reviewSchema = mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      require: true
    },
    productType: {
      type: String,
      require: true
    },
    productId: {
      type: String,
      require: true
    },
    productTitle: {
      type: String,
      require: true
    },
    productImage: {
      type: String,
      require: true
    }
  },
  modelOptions
)

module.exports = mongoose.model('Review', reviewSchema)
