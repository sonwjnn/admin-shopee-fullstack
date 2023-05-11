const mongoose = require('mongoose')
const { Schema } = require('mongoose')

const favoriteSchema = mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: { type: Schema.Types.ObjectId, require: true },
  productTitle: { type: String, default: '' },
  productImage: { type: String, default: '' },
  productPrice: { type: String, default: '' },
  productType: { type: String, default: '' },
  status: { type: String, default: '' }
})

// create model
module.exports = mongoose.model('favorite', favoriteSchema)
