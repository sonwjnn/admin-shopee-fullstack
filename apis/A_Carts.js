const express = require('express')
const router = express.Router();
const fs = require('fs');
const filepath = 'angularShopping/src/assets/json/archieveToken4200.json';

const cartModel = require('../models/M_Carts');
const userModel = require('../models/M_Users');

var jwt = require('jsonwebtoken');
/* const { throws } = require('assert'); */
var secret = 'localhost4200';

/* router.get('/*',
    (req, res, next) => {
        jwt.verify(req.cookies.token4200, secret, function (err, decoded) {
            if (err) {
                // token expired!
                res.send({kq:0, msg: "token expired"});
            }
            else {
                if (decoded.data != '') {
                    var fileString = fs.readFileSync(filepath).toString();

                    var fileObj = [{}];
                    if(fileString == ''){
                        res.send({kq:0, msg: "Token was not exists"});
                    }
                    else{
                       
                        fileObj = JSON.parse(fileString);
                        flag = 1;
                        for(var i = 0; i < fileObj.length ; i++){
            
                            if(decoded.data == fileObj[i].id){
                                next();
                                flag = 0;
                            }
                        }
                        if(flag == 1){
                            res.send({kq:0, msg: "Token was not exists"});
                        }                 
                    }  
                }
                else{
                    res.send({kq:0, msg: "Failed!"});
                }   
            }
        });
    }
); */

router.get('/list', (req, res) => {
    cartModel
        .find({ status: 'ready' })
        .exec((err, data) => {
            if (err) {
                res.send({ kq: 0, msg: 'Connect failed to DB' })
            }
            else {
                res.send({ kq: 1, msg: data })
            }
        });
});

router.post('/add', function (req, res) {
    var status = idUser = idProduct = nameProduct = imageProduct = priceProduct = quantity = cateName = token = address = '';
    var flag = 1;

    idUser = req.body.idUser;
    idProduct = req.body.idProduct;
    nameProduct = req.body.nameProduct;
    imageProduct = req.body.imageProduct;
    priceProduct = req.body.priceProduct;
    quantity = req.body.quantity;
    status = "ready";
    cateName = req.body.cateName;
    address = req.body.address;
    token = req.body.token;

    if (token == "" || token == undefined) {
        res.send({ kq: 0, msg: 'None user' });
    }
    else {

        jwt.verify(token, secret, function (err, decoded) {
            if (err) {
                // token expired!
                res.send({ kq: 0, msg: "token expired" });
            }
            else {
                if (decoded.data != '') {
                    idUser = decoded.data;


                    const obj = { idUser, idProduct, nameProduct, imageProduct, priceProduct, status, quantity, cateName };

                    cartModel
                        .find({ idUser, idProduct, status: 'ready' })
                        .exec((err, data) => {
                            if (err) res.send({ kq: 0, msg: 'Connect failed to DB' });

                            if (data.length != 0) {
                                var qty = Number(data[0].quantity) + Number(quantity);
                                const obj2 = { idUser, idProduct, nameProduct, imageProduct, priceProduct, status, quantity: String(qty), cateName };
                                cartModel.updateMany({ idProduct: idProduct }, obj2, (err, data) => {
                                    if (err) {
                                        res.send({ kq: 0, msg: 'Connection to database failed' })
                                    }
                                    else {
                                        res.send({ kq: 1, msg: 'Update data successfully' })
                                    }
                                })
                            }

                            else {
                                cartModel
                                    .insertMany(obj, (err, data) => {
                                        if (err) res.send({ kq: 0, msg: 'Connect failed to DB' });

                                        res.send({ kq: 1, msg: data });
                                    })
                            }
                        });

                }
                else {
                    res.send({ kq: 0, msg: "No data!" });
                }
            }
        });

    }
});


router.post('/updateStatus', function (req, res) {
    var status = idUser = token = address = phone = '';
    var flagError = 0;
   /*  var arr = JSON.parse(req.body.arr); */

    var arr = JSON.parse(req.body.arr);
    token = req.body.token;
    phone = req.body.phone;
    address = req.body.address;
    status = "done";

    if (token == "" || token == undefined) {
        res.send({ kq: 0, msg: 'None user' });
    }
    else {

        jwt.verify(token, secret, function (err, decoded) {
            if (err) {
                // token expired!
                res.send({ kq: 0, msg: "token expired" });
            }
            else {
                if (decoded.data != '') {
                    idUser = decoded.data;

                    for (var i = 0; i < arr.arr.length; i++) {

                        const obj = { phone, address, status };
    
                        cartModel.updateMany({ idUser: idUser, idProduct: arr.arr[i], status: 'ready' }, obj, (err, data) => {
                            if (err) {
                               flagError =1;
                                throw err;
                            }
                        })
                    }

                    if(flagError == 0){
                        res.send({ kq: 1, msg: 'Update data successfully' });
                    }
                    else{
                        res.send({ kq: 0, msg: 'Error DB' });
                    }

                }
                else {
                    res.send({ kq: 0, msg: "No data!" });
                }
            }
        });

    }
});


router.post('/delete', function (req, res) {
    var idUser = req.body.idUser;
    var idProduct = req.body.idProduct;

    const check_obj = { idUser, idProduct };
    cartModel
        .find(check_obj)
        .exec((err, data) => {
            if (err) {
                res.send({ kq: 0, msg: 'Connection to database failed' });
            }

            if (data == '') {
                res.send({ kq: 0, msg: 'Data id not exists' });
            }
            else {

                cartModel.findByIdAndDelete({ _id: data[0]._id }, (err, data) => {
                    if (err) {
                        res.send({ kq: 0, msg: 'Connection to database failed' });
                    }
                    else res.send({ kq: 1, msg: 'Delete data successfully!' });
                })
            }
        })
})

router.post('/getCartByToken', function (req, res) {
    var token = req.body.token;

    jwt.verify(token, secret, function (err, decoded) {
        if (err) {
            // token expired!
            res.send({ kq: 0, msg: "token expired" });
        }
        else {
            if (decoded.data != '') {
                cartModel
                    .find({ idUser: decoded.data, status: "ready" })
                    .exec((err, dataCart) => {
                        if (err) throw err;
                        else {
                            res.send({ kq: 1, msg: dataCart });
                        }
                    });
            }
            else {
                res.send({ kq: 0, msg: "No data!" });
            }
        }
    });
})

router.post('/getCartByTokenHistory', function (req, res) {
    var token = req.body.token;

    jwt.verify(token, secret, function (err, decoded) {
        if (err) {
            // token expired!
            res.send({ kq: 0, msg: "token expired" });
        }
        else {
            if (decoded.data != '') {
                cartModel
                    .find({ idUser: decoded.data, status: "done" })
                    .exec((err, dataCart) => {
                        if (err) throw err;
                        else {
                            res.send({ kq: 1, msg: dataCart });
                        }
                    });
            }
            else {
                res.send({ kq: 0, msg: "No data!" });
            }
        }
    });
})

module.exports = router