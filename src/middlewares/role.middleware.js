const responseHandler = require('../handlers/response.handler.js')
const { USER_ROLE } = require('../utils/constants.js')

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === USER_ROLE.ADMIN) {
    next()
  } else {
    return responseHandler.unauthorized(res)
  }
}

module.exports = { isAdmin }
