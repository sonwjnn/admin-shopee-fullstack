const { WHITELIST_DOMAINS } = require('../utils/constants.js')

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || WHITELIST_DOMAINS.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`${origin} not allowed by CORS.`))
    }
  }
}

module.exports = { corsOptions }
