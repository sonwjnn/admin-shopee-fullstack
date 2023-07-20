const mongoose = require('mongoose')
const crypto = require('crypto')
const modelOptions = require('./model.option')

const userSchema = mongoose.Schema(
  {
    name: { type: String, default: '' },
    username: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    email: { type: String, default: '', sparse: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    district: { type: String, default: '' },
    sex: { type: String, default: '' },
    birthday: { type: String, default: '' },
    story: { type: String, default: '' },
    role: { type: String, default: '' },
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

userSchema.methods.setProfile = function ({
  displayName,
  email,
  phone,
  address,
  city,
  district,
  sex,
  birthday
}) {
  this.displayName = displayName

  this.email = email

  this.phone = phone

  this.address = address

  this.city = city

  this.district = district

  this.sex = sex

  this.birthday = birthday
}

userSchema.methods.setImage = function (imageLink) {
  this.salt = crypto.randomBytes(16).toString('hex')

  this.password = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
    .toString('hex')
}

// create model
module.exports = mongoose.model('User', userSchema)
