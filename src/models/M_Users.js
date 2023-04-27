const mongoose = require('mongoose')
const crypto = require('crypto')
const modelOptions = require('./model.option')

const userSchema = mongoose.Schema(
  {
    name: { type: String, default: '' },
    username: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    email: { type: String, require: true, unique: true },
    phone: { type: String, require: true, unique: true },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    district: { type: String, default: '' },
    sex: { type: String, default: '' },
    birthday: { type: String, default: '' },
    story: { type: String, default: '' },
    role: { type: String, default: '' },
    date_created: { type: Date, default: Date() },
    salt: {
      type: String,
      require: true,
      select: false
    }
  },
  modelOptions
)

userSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex')

  this.password = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
    .toString('hex')
}

userSchema.methods.validPassword = function (password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
    .toString('hex')

  return hash === this.password
}

// create model
module.exports = mongoose.model('user', userSchema)
