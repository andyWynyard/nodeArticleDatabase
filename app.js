// console.log("Helloooo Bitches");

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

mongoose.connect(config.database);
let db = mongoose.connection;

// Check connection
db.once('open', function() {
    console.log('Connected to MongoDB via nodekb app!');
});

// Check for db errors
db.on('error', function(err) {
    console.log(err);
});

// Init Application
const app = express();

// Bring in models
let Article = require('./models/article');

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));

// parse application/json
app.use(bodyParser.json());

// Set Public folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(session({
    secret: 'luke father star wars',
    resave: true,
    saveUninitialized: true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function(req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

// Passport config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next) {
    res.locals.user = req.user || null;
    next();
})

// Home route
app.get('/', function(req, res) {
    // To simply send text to screen
    // res.send('Hello Bitches');
    Article.find({}, function(err, articles) {
        if (err) {
            console.log(err);
        } else {
            res.render('index', {
                title: 'Hi there!',
                articles: articles
            });
        }
    });
});

// Route Files
let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);

//Start Server
app.listen(3000, function() {
    console.log("Server started on port 3000....");
});
