const mongoose = require('mongoose')
const modelOptions = require('./model.option')
const { ORDER_ITEM_STATUS } = require('../utilities/constants')
const { Schema } = mongoose

const orderItemSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop' },
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    quantity: {
      type: Number,
      default: 1
    },
    status: {
      type: String,
      default: ORDER_ITEM_STATUS.NOT_PROCESSED,
      enum: Object.values(ORDER_ITEM_STATUS)
    }
  },
  modelOptions
)

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isPaid: { type: Boolean, default: false },
    total: {
      type: Number,
      default: 0
    },
    thumbnail: {
      type: String,
      default: ''
    },
    address: { type: String, default: '' },
    phone: { type: String, default: '' }
  },
  modelOptions
)

const Order = mongoose.model('Order', orderSchema)
const OrderItem = mongoose.model('OrderItem', orderItemSchema)

module.exports = { Order, OrderItem }
