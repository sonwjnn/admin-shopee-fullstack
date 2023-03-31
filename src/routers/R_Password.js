const express = require('express');
const router = express.Router();
const userModel = require('../models/M_Users');
const fs = require('fs');
const filepath = 'angularShopping/assets/json/archiveToken.json';

var jwt = require('jsonwebtoken');
var secret = 'none';

const bcrypt = require('bcryptjs');
const e = require('express');
const salt = bcrypt.genSaltSync(10);


router.get('/index', (req, res) => {

    jwt.verify(req.cookies.token, secret, function (err, decoded) {
        var id = decoded.data;
        userModel
            .find({ _id: id })
            .exec((err, data) => {
                if (err) {
                    throw err;
                }
                else {
                    if (data == '') {

                    }
                    else {
                        var index = 'password';
                        var main = "password/main";
                        res.render('index', { main, index, data });
                    }
                }
            });
    });
});




router.post('/updatePassword', function (req, res) {
    var username, oldPass, newPass, flag = 1;
    var password = '';

    username = req.body.username;
    oldPass = req.body.oldPass;
    newPass = req.body.newPass;

    newPass = bcrypt.hashSync(newPass, salt);
    const obj = {
        password: newPass
    }

    if (flag == 1) {

        const check_obj = { $or: [{ username }] }
        userModel
            .find(check_obj)
            .exec((err, data) => {
                if (err) {
                    res.send({ kq: 0, msg: 'Connection to database failed' });
                }
                else {
                    password = data[0].password;
                    if (bcrypt.compareSync(oldPass, password)) {
                        userModel.updateMany({ username: username }, obj, (err, data) => {
                            if (err) {
                                res.send({ kq: 0, msg: 'Connection to database failed' })
                            }
                            else {
                                res.send({ kq: 1, msg: 'Password updated. Do you want to log out?' })
                            }
                        })
                    }

                    else {
                        res.send({ kq: 0, msg: 'The password you entered is not correct!' });
                    }
                }
            });
    }
});


module.exports = router;
