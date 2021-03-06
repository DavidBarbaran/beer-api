var express = require('express');
var mongoose = require('mongoose');

var router = express.Router();

var user = mongoose.model('user');
var drink = mongoose.model('drink');
var category = mongoose.model('category');
var detailPurchase = mongoose.model('detailPurchase');
var purchase = mongoose.model('purchase');

router.route('/user').get(function (req, res) {
    user.find(function (err, resultado) {
        if (err) {
            res.status(500).json({ mensaje: 'Error al obtener usuarios' });
        }
        else {
            res.status(200).json(resultado);
        }
    });
}).post(function (req, res) {
    var myUser = new user();
    myUser.name = req.body.name;
    myUser.lastname = req.body.lastname;
    myUser.urlImage = req.body.urlImage;
    myUser.email = req.body.email;
    myUser.birthdate = req.body.birthdate;
    myUser.question = req.body.question;
    myUser.password = req.body.password;

    myUser.save(function (err, resultado) {
        if (err) {
            res.status(500)
                .json({ mensaje: 'El usuario no se registro' })
        }
        else {
            res.status(200)
                .json({ mensaje: 'Usuario registrdo correctamente' });
        }
    });

});

router.route('/login').post(function (req, res) {
    let email = req.query.email;
    let password = req.query.password
    user.findOne({ email: email, password: password }, function (err, resultado) {
        if (err) {
            res.status(500).json({ mensaje: 'Error del servidor' });
        }
        else {
            if (resultado != null) {
                res.status(200).json(resultado);
            } else {
                res.status(401).json({ mensaje: 'Login incorrecto' });
            }
        }
    });
});

router.route('/drink')
    .get(function (req, res) {
        let category = req.query.category;
        console.log('CATEGORY successful ->' + category);
        if (category != null) {
            drink.find({ category: category }, function (err, resultado) {
                if (err) {
                    res.status(500).json({ mensaje: 'Error al obtener bebidas' });
                }
                else {
                    res.status(200).json(resultado);
                }
            });
        } else {
            drink.find(function (err, resultado) {
                if (err) {
                    res.status(500).json({ mensaje: 'Error al obtener bebidas' });
                }
                else {
                    res.status(200).json(resultado);
                }
            });
        }
    }).post(function (req, res) {
        var myDrink = new drink();
        myDrink.category = req.body.category;
        myDrink.description = req.body.description;
        myDrink.image = req.body.image;
        myDrink.isOffer = req.body.isOffer;
        myDrink.name = req.body.name;
        myDrink.offer = req.body.offer;
        myDrink.price = req.body.price;

        myDrink.save(function (err, resultado) {
            if (err) {
                res.status(500)
                    .json({ mensaje: 'Error al registrar la bebida' })
            }
            else {
                res.status(200)
                    .json({ mensaje: 'Bebida registrada correctamente' });
            }
        });

    });

router.route('/drink/:id').put(function (req, res) {
    drink.findById(req.params.id, function (err, model) {

        if (err) {
            res.send(err);
        }

        console.log('UPDATE->' + req.body.offer);

        model.category = Util.validate(req.body.category, model.category);  // update the bears info
        model.description = Util.validate(req.body.description, model.description);
        model.image = Util.validate(req.body.image, model.image);
        model.isOffer = Util.validate(req.body.isOffer, model.isOffer);
        model.name = Util.validate(req.body.name, model.name);
        model.offer = Util.validate(req.body.offer, model.offer);
        model.price = Util.validate(req.body.price, model.price);

        // save the bear
        model.save(function (err) {
            if (err)
                res.send(err);

            res.json({ message: 'Beer updated!' });
        });

    });
}).delete(function (req, res) {
    drink.remove({
        _id: req.params.id
    }, function (err, bear) {

        if (err)
            res.send(err);

        res.json({ message: 'Bebida borrada correctamente' });
    });
});;

router.route('/category')
    .get(function (req, res) {
        category.find(function (err, resultado) {
            if (err) {
                res.status(500).json({ mensaje: 'Error al obtener las categorias' });
            }
            else {
                res.status(200).json(resultado);
            }
        });

    }).post(function (req, res) {
        var myCategory = new category();
        myCategory.name = req.body.name;
        myCategory.value = req.body.value;

        myCategory.save(function (err, resultado) {
            if (err) {
                res.status(500)
                    .json({ mensaje: 'Error al registrar la categoria' })
            }
            else {
                res.status(200)
                    .json({ mensaje: 'Categoria registrada correctamente' });
            }
        });

    });

async function getDetail(idPurchase, idUser) {
    const result = await detailPurchase.find({ idPurchase: idPurchase }).populate('item').exec();
    return {
        '_id': idPurchase,
        'userId': idUser,
        'detailPurchase': result
    }
}

async function getDataPurchase(res) {
    var resultado = res
    var o = []
    for (var key in resultado) {
        console.log("FOR_IN: " + resultado[key]._id);
        var idPurchase = resultado[key]._id;
        var idUser = resultado[key].userId;
        var key = ""
        var purchase = await getDetail(idPurchase, idUser);
        o.push(purchase);
    }
    console.log("FINAL: " + o[0].userId);
    return o;
}

router.route('/purchase/:id').get(function (req, response) {
    let userId = req.params.id;
    purchase.find({userId:userId},async function (err, resultado) {
        if (err) {
            response.status(500).json({ mensaje: 'Error al obtener las compras' });
        }
        else {
            var o = await getDataPurchase(resultado);
            response.status(200).json(o);
        }
    });
});

router.route('/purchase').post(function (req, res) {
    var myPurchase = new purchase();
    myPurchase.userId = req.body.userId;
    myPurchase.save(function (err, resultado) {
        if (err) {
            res.status(500)
                .json({ mensaje: 'Register purchase failed' })
        }
        else {
            console.log("DATA_DETAIL", req.body.detailPurchase);
            for (var key in req.body.detailPurchase) {
                console.log("RUN: ", key);
                var myDetailPurchase = new detailPurchase();
                myDetailPurchase.idPurchase = resultado._id;
                myDetailPurchase.cantidad = req.body.detailPurchase[key].cantidad;
                myDetailPurchase.item = req.body.detailPurchase[key].item;

                myDetailPurchase.save(function (err, resultado) {
                    if (err) {
                        console.log("ERR " + err);
                    } else {
                        console.log("REGISTER " + resultado);
                    }
                });


            }
            res.status(200)
                .json({ mensaje: 'Compra efectuada correctamente: ' + resultado });
        }
    });

});;


module.exports = router;