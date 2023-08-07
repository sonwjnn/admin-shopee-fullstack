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
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'ProductType',
      required: true
    },
    cateId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    content: {
      type: String,
      require: true
    },
    rating: {
      type: String,
      require: true
    },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', require: true },
    productName: {
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
