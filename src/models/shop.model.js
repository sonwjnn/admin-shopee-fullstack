const mongoose = require('mongoose')
const { Schema } = require('mongoose')
const modelOptions = require('./model.option')

const shopSchema = mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    district: { type: String, default: '' },
    imagePath: { type: String, default: '' },
    productCount: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    status: { type: String, default: '' }
  },
  modelOptions
)

shopSchema.methods.setData = function (props) {
  const { title, address, city, district } = props

  this.title = title
  this.address = address
  this.city = city
  this.district = district
}

// create model
module.exports = mongoose.model('shop', shopSchema)
