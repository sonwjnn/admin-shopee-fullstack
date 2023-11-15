const Stripe = require('stripe')

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15',
  typescript: false,
  appInfo: {
    name: 'Admin Shopee Fullstack',
    version: '0.1.0'
  }
})

module.exports = { stripe }
