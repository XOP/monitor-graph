var express = require('express');
var router = express.Router();
var appdata = require('../data.json');

//
// Root
//

router.get('/', function(req, res) {
    res.render('index', {
        name : "app"
    });
});


module.exports = router;