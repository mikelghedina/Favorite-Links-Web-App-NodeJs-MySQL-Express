const express = require('express');
const morgan = require('morgan');
const exphandle = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const MySQLStore = require('express-mysql-session');
const passport = require('passport');


const {database} = require('./keys');

//init
const app = express();
require('./lib/passport');


//sett
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphandle({
    defaultLayout: 'main',
    layoutDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    //linksDir: path.join(app.get('views'), 'links'),
    extname: '.hbs', 
    helpers: require('./lib/handlebars.js')
}));
app.set('view engine', '.hbs');

//middleware
app.use(session({
    secret: 'mynewsession',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore (database)
}));
app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());


//global variable
app.use((req, res, next)=>{
    app.locals.success = req.flash('success');
    app.locals.message = req.flash('message');
    app.locals.user = req.user;
    next();
});

//routes
app.use(require('./routes/index.js'));
app.use(require('./routes/authentication.js'));
app.use('/links', require('./routes/links.js'));

//public
app.use(express.static(path.join(__dirname, 'public')));


//start the server
app.listen(app.get('port'), () => 
{
    console.log("server on port", app.get("port"));
} );
