const HttpStatusCode = {
  OK: 200,
  NOT_FOUND: 404,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  INTERNAL_SERVICE: 500
}

const WHITELIST_DOMAINS = ['http://localhost:3000', 'http://localhost:8017']

module.exports = { HttpStatusCode, WHITELIST_DOMAINS }
