const HttpStatusCode = {
  OK: 200,
  NOT_FOUND: 404,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  INTERNAL_SERVICE: 500
}

const WHITELIST_DOMAINS = [
  'http://127.0.0.1:3000',
  'http://localhost:8017',
  'http://localhost:3000',
  'https://client-shopee-clone-7cde5.web.app',
  'https://client-shopee-clone.web.app',
  'https://admin-shopee-clone.onrender.com'
]

const ORDER_ITEM_STATUS = {
  NOT_PROCESSED: 'Not processed',
  // CASH_ON_DELIVERY: 'Cash on Delivery',
  PROCESSING: 'Processing',
  DISPATCHED: 'Dispatched',
  CANCELLED: 'Cancelled',
  DELIVERED: 'Delivered'
}

const USER_ROLE = {
  ADMIN: 'admin',
  USER: 'user',
  SHOP: 'shop'
}

module.exports = {
  HttpStatusCode,
  WHITELIST_DOMAINS,
  ORDER_ITEM_STATUS,
  USER_ROLE
}
