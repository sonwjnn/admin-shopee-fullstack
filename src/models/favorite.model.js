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
    productId: { type: Schema.Types.ObjectId, ref: 'Product', require: true }
  },
  modelOptions
)

// create model
module.exports = mongoose.model('favorite', favoriteSchema)
