const orderModel = require('../models/order.model')
const responseHandler = require('../handlers/response.handler')

//CREATE

const createOrder = async (req, res) => {
  const newOrder = new orderModel(req.body)

  try {
    const savedOrder = await newOrder.save()
    responseHandler.ok(res, savedOrder)
  } catch (error) {
    responseHandler.error(res)
  }
}

//UPDATE
const updateOrder = async (req, res) => {
  try {
    const updatedOrder = await orderModel.findByIdAndUpdate(
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
const removeOrder = async (req, res) => {
  try {
    await orderModel.findByIdAndDelete(req.params.id)
    responseHandler.ok(res, 'Order has been deleted...')
  } catch (error) {
    responseHandler.error(res)
  }
}

//GET USER ORDERS
const getOrdersByUserId = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.params.userId })
    responseHandler.ok(res, orders)
  } catch (error) {
    responseHandler.error(res)
  }
}

// //GET ALL

const getList = async (req, res) => {
  try {
    const orders = await orderModel.find()
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
    const income = await orderModel.aggregate([
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
