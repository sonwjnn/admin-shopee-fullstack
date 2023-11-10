const responseHandler = require('../handlers/response.handler.js')

const checkAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    return responseHandler.unauthorized(res)
  }
}
module.exports = { checkAdmin }
