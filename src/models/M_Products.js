const mongoose = require('mongoose')
const modelOptions = require('./model.option')
const { Schema } = require('mongoose')

const productSchema = mongoose.Schema(
  {
    name: { type: String, require: true, unique: true },
    origin: { type: String, default: '' },
    price: { type: String, require: true },
    imageName: { type: String, default: '' },
    type: { type: String, require: true },
    typeId: { type: Schema.Types.ObjectId, ref: 'ProductTypes', require: true },
    info: { type: String, default: '' },
    producedAt: { type: Date, default: Date() }
  },
  modelOptions
)

// create model
module.exports = mongoose.model('Product', productSchema)
