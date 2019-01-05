var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var session = require('express-session')

var app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);

//makes io available in the routes
app.locals.io = io;
var uniqid = require('uniqid');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.set('socketio', io); // <-- bind socket to app

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



var sess = {
    secret: 'adsqe923n1238123131312344123123',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 3600000, //1hour longer to delete cookies
        path: '/'
    }
}

if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
}

app.use(session(sess))


app.use(function(req, res, next) {

    'use strict';

    //generate unique id for a random namespace
    const nameSpace = uniqid()

    //make the namespace available in routes
    res.locals.nameSpace = nameSpace

    io.of(`/${nameSpace}`).on('connection', (socket) => {
        let sessionid = socket.id;

        console.log(`client ${sessionid} connected`);
        socket.emit('message', `for ${sessionid} eyes only`);

        //on disconnect
        socket.on('disconnected', function() {
            console.log(`client ${sessionid} disconnected`)

        });
    });
    next()


});

app.use('/', indexRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = { app: app, server: server };