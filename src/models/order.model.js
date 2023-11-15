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

// const OrderSchema = new mongoose.Schema(
//   {
//     products: [
//       {
//         productId: {
//           type: String
//         },
//         quantity: {
//           type: Number,
//           default: 1
//         }
//       }
//     ],
//     amount: { type: Number, required: true },
//     address: { type: Object, required: true },
//     status: { type: String, default: 'pending' }
//   },
//   { timestamps: true }
// )
