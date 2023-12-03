const { Order, OrderItem } = require('../models/order.model')
const responseHandler = require('../handlers/response.handler')
const { stripe } = require('../lib/stripe')
const calculateData = require('../utilities/calculateData')
const { toStringDate } = require('../utilities/toStringDate')
const shopModel = require('../models/shop.model')
const { formatPriceToVND } = require('../utilities/formatter')

const renderIndexPage = async (req, res) => {
  try {
    const pageNumber = parseInt(req.params.pageNumber, 10) || 1

    const limit = 10

    const shop = await shopModel.findOne({ user: req.user.id })
    const count = await OrderItem.countDocuments({ shopId: shop._id })
    const sumPage = Math.ceil(count / limit)

    if (!pageNumber || pageNumber < 1) {
      pageNumber = 1
    }

    if (pageNumber > sumPage && sumPage !== 0) {
      pageNumber = sumPage
    }

    const skip = (pageNumber - 1) * limit

    const orders = await OrderItem.find({ shopId: shop._id })
      .populate('productId')
      .limit(limit)
      .skip(skip)
      .sort({ _id: 1 })
    const dateOfC = orders.map(order => toStringDate.dmy(order.createdAt))

    const name = ''
    const isIndexPage = 1
    const index = 'orders of your shop'
    const main = 'orders/main'

    const formattedOrders = orders.map(item => ({
      id: item._id,
      // phone: item.phone,
      // address: item.address,
      name: item.productId.name,
      price: formatPriceToVND(Number(item.productId.discountPrice)),
      quantity: item.quantity,
      totalPrice: formatPriceToVND(
        Number(item.productId.discountPrice) * +item.quantity
      )
      // isPaid: item.isPaid
    }))

    res.render('index', {
      main,
      index,
      data: formattedOrders,
      sumPage,
      pageNumber,
      name,
      isIndexPage,
      dateOfC,
      role: req.user.role
    })
  } catch (error) {
    console.log(error)
    responseHandler.notfoundpage(res)
  }
}

const renderSearchPage = async (req, res) => {
  try {
    const name = req.params.name || ''
    const pageNumberPayload = parseInt(req.params.pageNumber, 10) || 1

    const { limit, skip, obj_find, sumPage, pageNumber } = await calculateData(
      pageNumberPayload,
      OrderItem,
      name,
      req.user
    )

    const orders = await OrderItem.find(obj_find)
      .populate('productId')
      .limit(limit)
      .skip(skip)
      .sort({ _id: 1 })

    const dateOfC = orders.map(order => toStringDate.dmy(order.createdAt))

    const index = 'orders of products'
    const main = 'orders/main'
    const isIndexPage = 0

    res.render('index', {
      main,
      index,
      data: orders,
      sumPage,
      pageNumber,
      name,
      isIndexPage,
      dateOfC,
      role: req.user.role
    })
  } catch (error) {
    responseHandler.notfoundpage(res)
  }
}

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
const getOrdersItemByShopId = async (req, res) => {
  try {
    const shopId = req.body.shopId
    const orders = await OrderItem.find({ shopId: shopId }).populate(
      'productId'
    )
    if (orders.length === 0) {
      return responseHandler.notfound(res, 'No orders found for this shop')
    }

    responseHandler.ok(res, orderItems)
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

const getDetail = async (req, res) => {
  try {
    const { orderId } = req.params
    const order = await OrderItem.findOne({ _id: orderId })
      .populate('productId')
      .populate('shopId')
      .lean()

    const orderBill = await Order.findOne({ _id: order.orderId }).populate(
      'user'
    )

    const formattedOrders = {
      id: order._id,
      // phone: item.phone,
      address:
        orderBill.address ||
        `${orderBill.user.address}, ${orderBill.user.district}, ${orderBill.user.city}`,
      name: order.productId.name,
      imageName: order.productId.imageName,
      price: formatPriceToVND(Number(order.productId.discountPrice)),
      quantity: order.quantity,
      totalPrice: formatPriceToVND(
        Number(order.productId.discountPrice) * +order.quantity
      )
      // isPaid: item.isPaid
    }

    return responseHandler.ok(res, formattedOrders)
  } catch (error) {
    console.log(error)
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
  renderIndexPage,
  renderSearchPage,
  createOrder,
  updateOrder,
  removeOrder,
  getOrdersByUserId,
  getList,
  getDetail,
  getOrdersItemByShopId,
  getMonthlyIncomeOrder
}