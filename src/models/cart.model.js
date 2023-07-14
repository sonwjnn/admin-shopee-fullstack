const mongoose = require('mongoose')
const { Schema } = require('mongoose')
const modelOptions = require('./model.option')

const cartSchema = mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', require: true },
    typeId: { type: Schema.Types.ObjectId, ref: 'ProductTypes', require: true },
    cateId: { type: Schema.Types.ObjectId, ref: 'Category', require: true },
    productTitle: { type: String, default: '' },
    productImage: { type: String, default: '' },
    productPrice: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    quantity: { type: String, default: '' },
    status: { type: String, default: '' }
  },
  modelOptions
)

// create model
module.exports = mongoose.model('cart', cartSchema)
/* db.users.createIndex( { "email": 1, "friends_email": 1 }, { unique: true } ) */
