const mongoose = require('mongoose')
const modelOptions = require('./model.option')
const { Schema } = require('mongoose')

const productSchema = mongoose.Schema(
  {
    typeId: { type: Schema.Types.ObjectId, ref: 'ProductType', require: true },
    cateId: { type: Schema.Types.ObjectId, ref: 'Category', require: true },
    name: { type: String, require: true, unique: true },
    origin: { type: String, default: '' },
    price: { type: String, require: true },
    discount: { type: String, default: '' },
    discountPrice: { type: String, default: '' },
    imageName: { type: String, default: '' },
    favorites: { type: String, default: '' },
    views: { type: String, default: '' },
    info: { type: String, default: '' },
    producedAt: { type: Date, default: Date() },
    status: { type: String, default: '', require: true }
  },
  modelOptions
)

productSchema.pre('save', function (next) {
  if (this.discount !== '') {
    const originalPrice = parseFloat(this.price)
    const discountPercentage = parseFloat(this.discount.replace('%', ''))
    const discountedPrice = originalPrice * (1 - discountPercentage / 100)
    this.discountPrice = discountedPrice.toFixed(2).toString()
  } else {
    this.discountPrice = this.price
  }
  next()
})

module.exports = mongoose.model('Product', productSchema)
