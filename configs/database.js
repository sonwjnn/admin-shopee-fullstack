const mongoose = require('mongoose');
const url = 'mongodb+srv://shopping:12345@cluster0.kcctule.mongodb.net/shopping?retryWrites=true&w=majority';
mongoose.connect(url)
    .then(() => {
        console.log('Successfully!');
    })
    .catch(() => {
        console.log('Failed!')
    });