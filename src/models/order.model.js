const mongoose = require('mongoose')
const modelOptions = require('./model.option')
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
      default: 'Not Processed',
      enum: [
        'Not Processed',
        'Cash on Delivery',
        'Processing',
        'Dispatched',
        'Cancelled',
        'Delivered'
      ]
    }
  },
  modelOptions
)

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [orderItemSchema],
    isPaid: { type: Boolean, default: false },
    address: { type: String, default: '' },
    phone: { type: String, default: '' }
  },
  modelOptions
)

const Order = mongoose.model('Order', orderSchema)
const OrderItem = mongoose.model('OrderItem', orderItemSchema)

module.exports = { Order, OrderItem }
