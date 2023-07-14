const mongoose = require('mongoose')
const modelOptions = require('./model.option')
const { Schema } = require('mongoose')

const typeSchema = mongoose.Schema(
  {
    name: { type: String, require: true },
    cateId: { type: Schema.Types.ObjectId, ref: 'Category', require: true }
  },
  modelOptions
)

// create model
module.exports = mongoose.model('ProductType', typeSchema)
