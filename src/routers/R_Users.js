const express = require('express');
const router = express.Router();
const userModel = require('../models/M_Users')

const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

router.get('/index(/:pageNumber?)', async (req, res) => {

    const limit = 5;
    var sumPage = 0;
    var sumData = await userModel.find();
    if (sumData.length != 0) {
        var sumPage = Math.ceil(sumData.length / limit);
    }

    var pageNumber = req.params.pageNumber;

    if (pageNumber == 1 || pageNumber == undefined || pageNumber < 1) {
        pageNumber = 1;
    }

    if (pageNumber > sumPage && sumPage != 0) {
        pageNumber = sumPage;
    }

    // set up var skip
    var skip = (pageNumber - 1) * limit;

    userModel
        .find()
        .limit(limit)
        .skip(skip)
        .sort({ name: 1 })
        .exec((err, data) => {
            if (err) {
                throw err;
            }
            else {
                var index = 'users';
                var main = "users/main";
                var flag = 0;
                var name = '';
                res.render('index', { main, index, data, sumPage, pageNumber, name, flag });
            }
        })
})

router.get('/edit/:username', function (req, res) {
    var username = req.params.username;

    if (username != '') {
        // check username
        const check_obj = { $or: [{ username }] }
        userModel
            .find(check_obj)
            .exec((err, data) => {
                if (err) {
                    throw err;
                }
                else {
                    if (data == '') {

                    }
                    else {
                        var index = 'users';
                        var main = "users/usersEdit";

                        res.render('index', { main, index, data });
                    }
                }
            });
    }
    else {
    }
});


router.get('/password/:username', function (req, res) {
    var username = req.params.username;

    if (username != '') {
        // check username
        const check_obj = { $or: [{ username }] }
        userModel
            .find(check_obj)
            .exec((err, data) => {
                if (err) {
                    throw err;
                }
                else {
                    if (data == '') {
                        res.send({ kq: 0, msg: 'Username is not exists' })
                    }
                    else {
                        var index = 'users';
                        var main = "users/usersPassChange";

                        res.render('index', { main, index, data });
                    }
                }
            })
    }
    else {
    }
});


router.get('/add', (req, res) => {
    var index = 'users';
    var main = "users/usersAdd";
    res.render('index', { main, index });
});

router.post('/add', function (req, res) {
    var name, username, password, phone, email, address, city, district, sex, birthday, story, role, error = '', flag = 1;

    name = req.body.name;
    username = req.body.username;
    password = req.body.password;
    email = req.body.email;
    phone = req.body.phone;
    address = req.body.address;
    city = req.body.city;
    district = req.body.district;
    sex = req.body.sex;
    birthday = req.body.birthday;
    role = req.body.role;
    story = req.body.story;


    if (flag == 1) {
        const obj = {
            name, username,
            password: bcrypt.hashSync(password, salt),
            email, phone, address, city, district, sex, birthday, role, story
        }

        // check username or email or phone
        const check_obj = { $or: [{ username }, { email }, { phone }] }

        userModel
            .find(check_obj)
            .exec((err, data) => {
                if (err) {
                    res.send({ kq: 0, msg: 'Connection to database failed' })
                }
                else {
                    if (data == '') {
                        userModel
                            .create(obj, (err, data) => {
                                if (err) {
                                    res.send({ kq: 0, msg: 'Connection to database failed' })
                                }
                                else {
                                    res.send({ kq: 1, msg: 'Data added successfully' })
                                }
                            })
                    }
                    else {
                        res.send({ kq: 0, msg: 'Data already exists! <br> Please check again your username, phone and email.' })
                    }
                }
            })

    }
    else {
        res.send({ kq: 0, msg: error })
    }
})


router.post('/update', function (req, res) {
    var id,name, username, phone, email, address, city, district, sex, birthday, role, story, error = '', flag = 1;

    id = req.body.id;
    username = req.body.username;
    name = req.body.name;
    email = req.body.email;
    phone = req.body.phone;
    address = req.body.address;
    city = req.body.city;
    district = req.body.district;
    sex = req.body.sex;
    birthday = req.body.birthday;
    role = req.body.role;
    story = req.body.story;


    if (flag == 1) {
        const obj = {
            name, email, phone, address, city, district, sex, birthday, role, story
        }

        // check username or email or phone
        const check_obj = { $or: [{ email }, { phone }] }

        userModel
            .find(check_obj)
            .exec((err, data) => {
                if (err) {
                    res.send({ kq: 0, msg: 'Connection to database failed' })
                }
                else {
                    if (data.length == 0) {

                        userModel.updateMany({ username: username }, obj, (err, data) => {
                            if (err) {
                                res.send({ kq: 0, msg: 'Connection to database failed' })
                            }
                            else {
                                res.send({ kq: 1, msg: 'Update data successfully' })
                            }
                        })
                    }
                    else if (data.length == 1) {
                        if (data[0]._id == id) {
                            userModel.updateMany({ username: username }, obj, (err, data) => {
                                if (err) {
                                    res.send({ kq: 0, msg: 'Connection to database failed' })
                                }
                                else {
                                    res.send({ kq: 1, msg: 'Update data successfully' })
                                }
                            })
                        }else {
                            res.send({ kq: 0, msg: 'Data already exists! <br> Please check again your phone and email.' })
                        }
                    }
                    else {
                        res.send({ kq: 0, msg: 'Data already exists! <br> Please check again your phone and email.' })
                    }
                }
            })
    }
    else {
        res.send({ kq: 0, msg: error })
    }
})


router.post('/showDetail', function (req, res) {
    var username = req.body.username;

    // check username
    const check_obj = { $or: [{ username }] }
    userModel
        .find(check_obj)
        .exec((err, data) => {
            if (err) {
                res.send({ kq: 0, msg: 'Connection to database failed' });
            }
            else {
                if (data == '') {
                    res.send({ kq: 0, data, msg: 'Data id not exists' });
                }
                else {
                    res.send({ kq: 1, data, msg: 'Get data sucesssfully' });
                }
            }
        })
})

router.post('/delete', function (req, res) {
    var username = req.body.username;
    const check_obj = { $or: [{ username }] }
    userModel
        .find(check_obj)
        .exec((err, data) => {
            if (err) {
                res.send({ kq: 0, msg: 'Connection to database failed' });
            }

            if (data == '') {
                res.send({ kq: 0, msg: 'Data id not exists' });
            }
            else {

                userModel.findByIdAndDelete({ _id: data[0]._id }, (err, data) => {
                    if (err) {
                        res.send({ kq: 0, msg: 'Connection to database failed' });
                    }
                    else res.send({ kq: 1, msg: 'Delete data successfully!' });
                })
            }
        })
})


router.post('/deleteGr', function (req, res) {
    var arr = JSON.parse(JSON.stringify(req.body));

    const check_obj = { username: { $in: arr.arr } };
    userModel.deleteMany(check_obj, (err, data) => {
        if (err) {
            res.json({ kq: 0, msg: 'Connection to database failed' });
        }
        else {
            res.json({ kq: 1, msg: 'Delete data successfully!' });

        }
    });

})


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
                                res.send({ kq: 1, msg: 'Update password successfully' })
                            }
                        })
                    }

                    else {
                        res.send({ kq: 0, msg: 'The password you entered is not correct!' });
                    }
                }
            });
    }
})


router.get('/getAllUser', function (req, res) {
    userModel
        .find()
        .exec((err, data) => {
            if (err) {
                throw err;
            }
            else {
                res.send({ kq: 1, data, msg: 'Get all successfully.' });
            }
        })
});


router.get('/search/(:name?)(/:pageNumber?)', async (req, res) => {
    var name = '';
    name = req.params.name;

    var obj_find = {};
    if (name != '' && name != undefined) {
        const regex = new RegExp('('+ name +')', 'i');
        obj_find = { "name": { $regex: regex } };
    }

    const limit = 5;

    var sumPage = 0;
    var sumData = await userModel.find(obj_find);
    if (sumData.length != 0) {
        var sumPage = Math.ceil(sumData.length / limit);
    }

    var pageNumber = req.params.pageNumber;

    if (pageNumber == 1 || pageNumber == undefined || pageNumber < 1) {
        pageNumber = 1;
    }

    if (pageNumber > sumPage && sumPage != 0) {
        pageNumber = sumPage;
    }

    // set up var skip
    var skip = (pageNumber - 1) * limit;

    userModel
        .find(obj_find)
        .limit(limit)
        .skip(skip)
        .sort({ _id: 1 })
        .exec((err, data) => {
            if (err) {
                throw err;
            }
            else {
                var index = 'users';
                var main = "users/main";
                var flag = 1;
                res.render('index', { main, index, data, sumPage, pageNumber, name, flag });
            }
        })
});




module.exports = router;
