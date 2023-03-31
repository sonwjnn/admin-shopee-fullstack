const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: { type: String, require: true, unique: true },
    origin: { type: String, default: '' },
    price: { type: String, require: true },
    imageName: { type: String, default: '' },
    cateName: { type: String, require: true },
    info: { type: String, default: '' },
    dateOfM: { type: String, default: '' },
    date_created: { type: Date, default: Date() }
})

// create model
module.exports = mongoose.model('product', userSchema);