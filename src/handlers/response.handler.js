const responseWithData = (res, statusCode, data) => {
  if (res.headersSent) return
  res.status(statusCode).json(data)
}

const error = res =>
  responseWithData(res, 500, {
    status: 500,
    message: 'Oops! Something wrong!'
  })

const badrequest = (res, message) =>
  responseWithData(res, 400, {
    status: 400,
    message
  })

const ok = (res, data) => responseWithData(res, 200, data)

const created = (res, data) => responseWithData(res, 201, data)

const unauthorized = res =>
  responseWithData(res, 401, {
    status: 401,
    message: 'Unauthorized'
  })

const notfound = res =>
  responseWithData(res, 401, {
    status: 401,
    message: 'Resource not found!'
  })

module.exports = { error, badrequest, ok, created, unauthorized, notfound }
