const mongoose = require('mongoose')
const { Schema } = require('mongoose')

const cartSchema = mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: { type: Schema.Types.ObjectId, require: true },
  productTitle: { type: String, default: '' },
  productImage: { type: String, default: '' },
  productPrice: { type: String, default: '' },
  cateName: { type: String, default: '' },
  status: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  quantity: { type: String, default: '' }
})

// create model
module.exports = mongoose.model('cart', cartSchema)
/* db.users.createIndex( { "email": 1, "friends_email": 1 }, { unique: true } ) */
