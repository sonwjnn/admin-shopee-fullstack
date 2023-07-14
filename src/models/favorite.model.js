const mongoose = require('mongoose')
const { Schema } = require('mongoose')
const modelOptions = require('./model.option')

const favoriteSchema = mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', require: true },
    productTitle: { type: String, default: '' },
    productImage: { type: String, default: '' },
    productPrice: { type: String, default: '' },
    productType: { type: String, default: '' },
    status: { type: String, default: '' }
  },
  modelOptions
)

// create model
module.exports = mongoose.model('favorite', favoriteSchema)
