const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    idUser: { type: String, require: true },
    idProduct: { type: String, require: true },
    nameProduct: { type: String, default: '' },
    imageProduct: { type: String, default: '' },
    priceProduct: { type: String, default: '' },
    cateName: { type: String, default: '' },
    status: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    quantity: { type: String, default: '' },
    date_created: { type: Date, default: Date() }
})

// create model
module.exports = mongoose.model('cart', cartSchema);
/* db.users.createIndex( { "email": 1, "friends_email": 1 }, { unique: true } ) */