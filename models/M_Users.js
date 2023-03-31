const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
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
    date_created: { type: Date, default: Date() }
})

// create model
module.exports = mongoose.model('user', userSchema);
