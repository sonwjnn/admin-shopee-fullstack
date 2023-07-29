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

productSchema.methods.setImage = function (originalImageName) {
  const [name, type] = originalImageName.split('.')
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
  const imageName = `${name}-${uniqueSuffix}.${type}`.replace(/ /g, '-')
  this.imageName = imageName
}

productSchema.methods.setInfo = function (props) {
  Object.assign(this, {
    ...props
  })
}

module.exports = mongoose.model('Product', productSchema)
