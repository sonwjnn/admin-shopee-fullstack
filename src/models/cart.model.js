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
    quantity: { type: Number, default: 1 }
  },
  modelOptions
)

cartSchema.methods.setInfo = function (props) {
  Object.assign(this, {
    ...props
  })
}

module.exports = mongoose.model('cart', cartSchema)
