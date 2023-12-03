const mongoose = require('mongoose')
const modelOptions = require('./model.option')
const { Schema } = require('mongoose')

const cateSchema = mongoose.Schema(
  {
    name: { type: String, require: true, unique: true, index: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  modelOptions
)

// create model
module.exports = mongoose.model('Category', cateSchema)
