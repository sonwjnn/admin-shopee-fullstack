const express = require('express')
const router = express.Router()

// Gọi controllers
const Categories = require('../controllers/C_Categories')
const productModel = require('../models/M_Products');

// Gọi models
const categoryModel = require('../models/M_Categories');

router.post('/list', (req, res) => {
    var token = req.body.token;
    categoryModel
    .find()
    .exec((err, data)=>{
        if(err){
            res.send({kq:0, msg: 'Connect failed to DB'})
        }
        else{
            res.send({kq:1, msg: data})
        }
    });
});


router.get('/list', (req, res) => {
    categoryModel
    .find()
    .exec((err, data)=>{
        if(err){
            res.send({kq:0, msg: 'Connect failed to DB'})
        }
        else{
            res.send({kq:1, msg: data})
        }
    });
});

router.get('/sidebar', (req, res) => {
    categoryModel
    .find()
    .exec((err, data)=>{
        if(err){
            res.send({kq:0, msg: 'Connect failed to DB'})
        }
        else{
            const use_Catygories = new Categories()

            var new_array = []

            data.forEach(e=>{
                new_array.push({
                    name: e.name,
                    type: e.type,
                })
            })
            res.send({kq:1, msg: new_array});
        }
    })
});


router.get('/info_category_by_slug/:slug', (req, res) => {
    categoryModel
    .find({type: req.params.slug})
    .exec((err, data)=>{
        if(err) res.send({kq:0, msg: 'Connect failed to DB'})

        res.send({kq:1, msg: data})
    })
});



function ChangeToSlug(title)
{
    var slug;

    //Đổi chữ hoa thành chữ thường
    slug = title.toLowerCase();

    //Đổi ký tự có dấu thành không dấu
    slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
    slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
    slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
    slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
    slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
    slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
    slug = slug.replace(/đ/gi, 'd');
    //Xóa các ký tự đặt biệt
    slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
    //Đổi khoảng trắng thành ký tự gạch ngang
    slug = slug.replace(/ /gi, "-");
    //Đổi nhiều ký tự gạch ngang liên tiếp thành 1 ký tự gạch ngang
    //Phòng trường hợp người nhập vào quá nhiều ký tự trắng
    slug = slug.replace(/\-\-\-\-\-/gi, '-');
    slug = slug.replace(/\-\-\-\-/gi, '-');
    slug = slug.replace(/\-\-\-/gi, '-');
    slug = slug.replace(/\-\-/gi, '-');
    //Xóa các ký tự gạch ngang ở đầu và cuối
    slug = '@' + slug + '@';
    slug = slug.replace(/\@\-|\-\@|\@/gi, '');
    //In slug ra textbox có id “slug”
    return slug;
}

module.exports = router