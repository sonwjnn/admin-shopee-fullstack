const { Order, OrderItem } = require('../models/order.model')
const responseHandler = require('../handlers/response.handler')
const { stripe } = require('../lib/stripe')
const calculateData = require('../utilities/calculateData')
const { toStringDate } = require('../utilities/toStringDate')
const shopModel = require('../models/shop.model')
const { formatPriceToVND } = require('../utilities/formatter')
const productModel = require('../models/product.model')
const { ORDER_ITEM_STATUS, USER_ROLE } = require('../utilities/constants')

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
      name: item.productId?.name || '',
      price: formatPriceToVND(Number(item.productId?.discountPrice)),
      quantity: item.quantity,
      totalPrice: formatPriceToVND(
        Number(item.productId?.discountPrice) * +item.quantity
      ),
      status: item.status
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
      role: req.user.role,
      USER_ROLE
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

const renderEditPage = async (req, res) => {
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
      images: order.productId.images,
      username: orderBill.user.name,
      address:
        orderBill.address ||
        `${orderBill.user.address}, ${orderBill.user.district}, ${orderBill.user.city}`,
      name: order.productId.name,
      imageName: order.productId.imageName,
      price: formatPriceToVND(Number(order.productId.discountPrice)),
      quantity: order.quantity,
      totalPrice: formatPriceToVND(
        Number(order.productId.discountPrice) * +order.quantity
      ),
      status: order.status,
      isDisabledStatus: order.status === ORDER_ITEM_STATUS.CANCELLED
      // isPaid: item.isPaid
    }

    const status = Object.values(ORDER_ITEM_STATUS)
    const index = 'orders'
    const main = 'orders/edit.order.ejs'
    res.render('index', {
      main,
      index,
      data: formattedOrders,
      status,
      role: req.user.role
    })
  } catch (error) {
    responseHandler.error(res)
  }
}
//CREATE

const createOrder = async (req, res) => {
  try {
    const { products, shippingPrice } = req.body

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

    // Add shipping price as a separate line item
    line_items.push({
      quantity: 1,
      price_data: {
        currency: 'VND',
        product_data: {
          name: 'Shipping'
        },
        unit_amount: shippingPrice
      }
    })

    // Calculate total
    const total =
      products.reduce(
        (acc, product) => acc + product.price * product.quantity,
        0
      ) + shippingPrice

    const order = await Order.create({
      user: req.user.id,
      isPaid: false,
      total,
      thumbnail: products[0]?.images[0]?.url || '',
      shippingPrice
    })

    // Create orderItems in OrderItemModel
    const orderItems = products.map(product => ({
      orderId: order._id,
      shopId: product.shopId,
      productId: product.productId,
      quantity: product.quantity,
      status: ORDER_ITEM_STATUS.NOT_PROCESSED
    }))

    await OrderItem.create(orderItems)

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true
      },
      success_url: `${process.env.FRONTEND_STORE_URL}/checkout?success=1&orderId=${order._id}`,
      cancel_url: `${process.env.FRONTEND_STORE_URL}/checkout?canceled=1&orderId=${order._id}`,
      metadata: {
        orderId: order._id.toString()
      }
    })

    responseHandler.ok(res, { url: session.url })
  } catch (error) {
    responseHandler.error(res)
  }
}

const createOrderWithoutPayment = async (req, res) => {
  try {
    const { products, shippingPrice } = req.body

    if (!products || products.length === 0) {
      responseHandler.notfound(res, 'No product ids found')
    }

    // Calculate total
    const total =
      products.reduce(
        (acc, product) => acc + product.price * product.quantity,
        0
      ) + shippingPrice

    const order = await Order.create({
      user: req.user.id,
      isPaid: false,
      total,
      thumbnail: products[0]?.images[0]?.url || '',
      shippingPrice
    })

    // Create orderItems in OrderItemModel
    const orderItems = products.map(product => ({
      orderId: order._id,
      shopId: product.shopId,
      productId: product.productId,
      quantity: product.quantity,
      status: ORDER_ITEM_STATUS.NOT_PROCESSED
    }))

    await OrderItem.create(orderItems)

    responseHandler.ok(res, order)
  } catch (error) {
    console.log(error)
    responseHandler.error(res)
  }
}

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

const updateOrderItem = async (req, res) => {
  try {
    const itemId = req.params.itemId
    const status = req.body.status || ORDER_ITEM_STATUS.CANCELLED

    const orderItem = await OrderItem.findOne({ _id: itemId }).populate(
      'productId'
    )
    const orderId = orderItem.orderId

    const updatedOrderItem = await OrderItem.updateOne(
      { _id: itemId },
      { status: req.body.status }
    )

    if (!updatedOrderItem) {
      return responseHandler.notfound(res)
    }

    if (status === ORDER_ITEM_STATUS.CANCELLED) {
      await productModel.updateOne(
        { _id: orderItem?.productId?._id },
        { $inc: { quantity: orderItem?.productId?.quantity } }
      )

      const items = await OrderItem.find({ orderId })
      const itemStatuses = items.filter(
        item => item.status === ORDER_ITEM_STATUS.CANCELLED
      )

      // All items are cancelled => Cancel order
      if (items.length === itemStatuses.length) {
        await Order.deleteOne({ _id: orderId })
        await OrderItem.deleteMany({ orderId: orderId })

        return responseHandler.ok(res, {
          orderCancelled: true,
          message: `${
            req.user.role === USER_ROLE.SHOP || USER_ROLE.ADMIN
              ? 'Order'
              : 'Your order'
          } has been cancelled successfully`
        })
      }

      return responseHandler.ok(res, {
        message: 'Item has been cancelled successfully!'
      })
    }

    responseHandler.ok(res, {
      message: 'Item status has been updated successfully!'
    })
  } catch (error) {
    console.log(error)
    responseHandler.error(res)
  }
}

//GET USER ORDERS
const getOrdersByUserId = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })

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

const getDetailByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params

    const order = await Order.findOne({ _id: orderId })
    const orderItems = await OrderItem.find({ orderId })
      .populate('productId')
      .populate('shopId')
      .lean()

    const products = orderItems.map(item => {
      return {
        id: item._id,
        imageUrl: item.productId.images[0].url,
        name: item.productId.name,
        price: item.productId.discountPrice,
        quantity: item.quantity,
        totalPrice: item.productId.discountPrice * item.quantity,
        status: item.status
      }
    })

    const formatedOrder = {
      id: order._id,
      createdAt: order.createdAt,
      total: order.total,
      isPaid: order.isPaid,
      products,
      shippingPrice: order.shippingPrice
    }

    responseHandler.ok(res, formatedOrder)
  } catch (error) {
    console.log(error)
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

const getDetailOrderItem = async (req, res) => {
  try {
    const { orderId: orderItemId } = req.params
    const order = await OrderItem.findOne({ _id: orderItemId })
      .populate('productId')
      .populate('shopId')
      .lean()

    const orderBill = await Order.findOne({ _id: order.orderId }).populate(
      'user'
    )

    const formattedOrders = {
      id: order._id,
      // phone: item.phone,
      images: order.productId.images,
      username: orderBill.user.name,
      address:
        orderBill.address ||
        `${orderBill.user.address}, ${orderBill.user.district}, ${orderBill.user.city}`,
      name: order.productId.name,
      imageName: order.productId.imageName,
      price: formatPriceToVND(Number(order.productId.discountPrice)),
      quantity: order.quantity,
      totalPrice: formatPriceToVND(
        Number(order.productId.discountPrice) * +order.quantity
      ),
      status: order.status
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

const increaseQuantity = products => {
  let bulkOptions = products.map(item => {
    return {
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: item.quantity } }
      }
    }
  })

  productModel.bulkWrite(bulkOptions)
}

module.exports = {
  renderIndexPage,
  renderSearchPage,
  renderEditPage,
  createOrder,
  createOrderWithoutPayment,
  updateOrderItem,
  removeOrder,
  getOrdersByUserId,
  getList,
  getDetailOrderItem,
  getOrdersItemByShopId,
  getMonthlyIncomeOrder,
  getDetailByOrderId
}
