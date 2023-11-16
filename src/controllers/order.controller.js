const { Order, OrderItem } = require('../models/order.model')
const responseHandler = require('../handlers/response.handler')
const { stripe } = require('../lib/stripe')

//CREATE

const createOrder = async (req, res) => {
  try {
    const { products } = req.body

    if (!products || products.length === 0) {
      responseHandler.notfound(res, 'No product ids found')
    }

    const line_items = products.map(product => ({
      quantity: product.quantity,
      price_data: {
        currency: 'VND',
        product_data: {
          name: product.name || product.title
        },
        unit_amount: product.price / product.quantity
      }
    }))

    const order = await Order.create({
      // shopId: mongoose.Types.ObjectId(params.storeId)
      user: req.user.id,
      isPaid: false,
      orderItems: products.map(product => ({
        shopId: product.shopId,
        productId: product.productId,
        quantity: product.quantity
      }))
    })

    // Create orderItems in OrderItemModel
    const orderItems = products.map(product => ({
      orderId: order._id,
      shopId: product.shopId,
      productId: product.productId,
      quantity: product.quantity
    }))
    await OrderItem.create(orderItems)

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true
      },
      success_url: `${process.env.FRONTEND_STORE_URL}/checkout?success=1`,
      cancel_url: `${process.env.FRONTEND_STORE_URL}/checkout?canceled=1`,
      metadata: {
        orderId: order._id.toString()
      }
    })

    responseHandler.ok(res, { url: session.url })
  } catch (error) {
    console.log(error)
    responseHandler.error(res)
  }
}

//UPDATE
const updateOrder = async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body
      },
      { new: true }
    )
    responseHandler.ok(res, updatedOrder)
  } catch (error) {
    responseHandler.error(res)
  }
}

//DELETE
//DELETE
const removeOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
    if (!order) {
      return responseHandler.notfound(res, 'Order not found')
    }

    // Delete order items
    await OrderItem.deleteMany({ orderId: order._id })

    // Delete order
    await Order.deleteOne({ _id: req.params.orderId })

    responseHandler.ok(
      res,
      'Order and related order items deleted successfully'
    )
  } catch (error) {
    responseHandler.error(res)
  }
}

//GET USER ORDERS
const getOrdersByUserId = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('orderItems.productId')
      .exec()
    responseHandler.ok(res, orders)
  } catch (error) {
    responseHandler.error(res)
  }
}

// //GET ALL

const getList = async (req, res) => {
  try {
    const orders = await Order.find()
    responseHandler.ok(res, orders)
  } catch (error) {
    responseHandler.error(res)
  }
}

// GET MONTHLY INCOME

const getMonthlyIncomeOrder = async (req, res) => {
  const date = new Date()
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1))
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1))

  try {
    const income = await Order.aggregate([
      { $match: { createdAt: { $gte: previousMonth } } },
      {
        $project: {
          month: { $month: '$createdAt' },
          sales: '$amount'
        }
      },
      {
        $group: {
          _id: '$month',
          total: { $sum: '$sales' }
        }
      }
    ])
    responseHandler.ok(res, income)
  } catch (error) {
    responseHandler.error(res)
  }
}

module.exports = {
  createOrder,
  updateOrder,
  removeOrder,
  getOrdersByUserId,
  getList,
  getMonthlyIncomeOrder
}
