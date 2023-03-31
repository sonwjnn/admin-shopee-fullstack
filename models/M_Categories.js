const mongoose = require('mongoose');

const cateSchema = mongoose.Schema({
    name: { type: String, require: true, unique: true },
    type: { type: String, require: true, default: '' },
    date_created: { type: Date, default: Date() }
})

// create model
module.exports = mongoose.model('category', cateSchema);