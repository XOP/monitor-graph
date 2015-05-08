/**
 * Express Dummy
 *
 * Basic settings
 */

//
// common modules
var http = require('http');
var fs = require('fs');
var path = require('path');

var colors = require('colors');
var info = console.info;

var config = require('./config.json');

//
// express config
var express = require('express');
var compress = require('compression');

var app = express();

app.set('view engine', 'ejs');
//using non-default folder
//app.set('views', __dirname + '/customFolder');

// add the compression
app.use(compress({level: 6}));

//
// locals
app.locals = require('./data.json');

/*
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
*/

//
// serve static (cacheable)
var oneDay = 86400000;
app.use(express.static(path.join(__dirname, 'public')
//    , { maxAge: oneDay*30 }
));

//
// router
app.use('/', require('./routes/index'));

// catch 404 and forward to error handler
app.use(function(req, res) {
    var err = new Error('Not Found');
    err.status = 404;
    res.send('404: NOT FOUND');
});

//
// SERVER
//

var server = app.listen(config.port, function(){
    info('App is running on port'.green + ' ' + colors.yellow(config.port));
});