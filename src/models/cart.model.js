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
    quantity: { type: String, default: '' }
  },
  modelOptions
)

cartSchema.methods.setInfo = function (props) {
  Object.assign(this, {
    ...props
  })
}

// create model
module.exports = mongoose.model('cart', cartSchema)
/* db.users.createIndex( { "email": 1, "friends_email": 1 }, { unique: true } ) */
