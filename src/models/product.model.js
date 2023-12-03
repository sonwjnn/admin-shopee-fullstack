const mongoose = require('mongoose')
const modelOptions = require('./model.option')
const { Schema } = require('mongoose')

const productSchema = mongoose.Schema(
  {
    typeId: { type: Schema.Types.ObjectId, ref: 'ProductType', require: true },
    cateId: { type: Schema.Types.ObjectId, ref: 'Category', require: true },
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', require: true },
    name: { type: String, require: true, trim: true },
    slug: { type: String, required: true, lowercase: true },
    origin: { type: String, default: '' },
    price: { type: Number, require: true },
    discount: { type: Number, default: 0 },
    discountPrice: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    quantity: { type: Number, required: true },
    sold: { type: Number, default: 0 },
    images: [{ public_id: String, url: String }],
    favorites: { type: Number, default: 0 },
    info: { type: String, default: '' },
    producedAt: { type: Date, default: Date() },
    status: { type: String, default: '', require: true }
  },
  modelOptions
)

productSchema.methods.setInfo = function (props) {
  Object.assign(this, {
    ...props
  })
}

module.exports = mongoose.model('Product', productSchema)
