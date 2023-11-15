const express = require('express')
const router = express.Router()
const { stripe } = require('../lib/stripe')
const responseHandler = require('../handlers/response.handler')
const { Order } = require('../models/order.model')

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature']
    const body = req.body
    const secret = process.env.STRIPE_WEBHOOK_SECRET || ''

    let event

    try {
      event = stripe.webhooks.constructEvent(body, sig, secret)
    } catch (err) {
      return responseHandler.error(res, `Webhook Error: ${err.message}`)
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const address = session.customer_details.address
      const addressString = [
        address.line1,
        address.line2,
        address.city,
        address.state,
        address.postal_code,
        address.country
      ]
        .filter(Boolean)
        .join(', ')

      await Order.findOneAndUpdate(
        { _id: session.metadata.orderId },
        {
          isPaid: true,
          address: addressString,
          phone: session.customer_details.phone || ''
        },
        { new: true }
      ).populate('orderItems.productId')
    }

    responseHandler.ok(res)
  }
)

module.exports = router
