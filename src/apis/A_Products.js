const express = require('express');
const router = express.Router();
const productModel = require('../models/M_Products');
const categoryModel = require('../models/M_Categories');

router.get('/list', async (req, res) => {
    productModel
        .find()
        .exec(async (err, data) => {
            if (err) {
                res.send({ kq: 0, msg: 'Connect failed to DB' });
            }
            else {

                typeCate = ['Electronic', 'Clothes', 'Office Suply', 'Books', 'Bedding', 'Other'];

                var dataCate = await categoryModel.find();

                var arr = [];
                for (var i = 0; i < typeCate.length; i++) {
                    var count = 0;
                    for (var j = 0; j < dataCate.length; j++) {
                        if (typeCate[i] == dataCate[j].type) {
                            count = 1;
                        }
                    }

                    if (count == 0) {
                        arr.push({
                            name: typeCate[i],
                            check: 0
                        });
                    } else {
                        arr.push({
                            name: typeCate[i],
                            check: 1
                        });
                    }
                }

                res.send({ kq: 1, msg: data, msgDouble: arr });
            }
        })
});


router.get('/getProduct_by_slug/:slug', (req, res) => {
    productModel
        .find({ cateName: req.params.slug })
        .exec((err, data) => {
            if (err) res.send({ kq: 0, msg: 'Connect failed to DB' })

            res.send({ kq: 1, msg: data })
        })
});


router.get('/info_product_by_slug/:slug', (req, res) => {
    productModel
        .find({ name: req.params.slug })
        .exec((err, data) => {
            if (err) res.send({ kq: 0, msg: 'Connect failed to DB' })

            res.send({ kq: 1, msg: data })
        })
});

router.get('/getProductRelation/:cate/:name', function (req, res) {
    var cate = req.params.cate;
    var name = req.params.name;


    const check_obj = { cateName: cate, $nor: [{ name: name }] }
    productModel
        .find(check_obj)
        .exec((err, data) => {
            if (err) {
                res.send({ kq: 0, msg: 'Connect failed to DB' });
            }
            else {            
                res.send({ kq: 1, msg: data });
            }
        })

});


module.exports = router