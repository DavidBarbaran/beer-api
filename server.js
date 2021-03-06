var express = require('express');
var mongoose = require('mongoose');
var bodyparser = require('body-parser');

// Import my models
require('./models/user')
require('./models/drink')
require('./models/category')
require('./models/purchase')

// Import my models
mongoose.connect('mongodb://localhost/beerApi', function (err) {
    if (err) {
        console.log('Connection failed');
    }
    else {
        console.log('Connection successful');
    }
});

var app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

var router = require('./routes');

app.use('/api', router);

//const port = process.env.PORT || 3000;
app.listen(3000);
