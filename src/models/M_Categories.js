const mongoose = require('mongoose')
const modelOptions = require('./model.option')

const cateSchema = mongoose.Schema(
  {
    name: { type: String, require: true, unique: true }
  },
  modelOptions
)

// create model
module.exports = mongoose.model('Category', cateSchema)
