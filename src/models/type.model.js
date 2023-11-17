const mongoose = require('mongoose')
const modelOptions = require('./model.option')
const { Schema } = require('mongoose')

const typeSchema = mongoose.Schema(
  {
    name: { type: String, require: true },
    cateId: { type: Schema.Types.ObjectId, ref: 'Category', require: true },
    shopId: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true
    }
  },
  modelOptions
)

// create model
module.exports = mongoose.model('ProductType', typeSchema)
