/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */

const express = require('express');
const path = require('path');
const logger = require('morgan');
const compression = require('compression');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('express-flash');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const dotenv = require('dotenv');
const exphbs = require('express-handlebars');
const auth = require('./common/authentication');
const api = require('./controllers/api');

// Load environment variables from .env file
dotenv.load();

// Controllers
const HomeController = require('./controllers/home');
const signupController = require('./controllers/signup');
const loginController = require('./controllers/login');
const logoutController = require('./controllers/logout');
const profileController = require('./controllers/profile');
const forgotPassController = require('./controllers/forgotPass');

const app = express();
const hbs = exphbs.create({
    defaultLayout: 'main',
    helpers: {
        ifeq: (a, b, options) => (a === b ? options.fn(this) : options.inverse(this))
    },
    toJSON: object => JSON.stringify(object)
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(methodOverride('_method'));
app.use(session({ secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true }));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

app.delete('/api/course', api.deleteCourse);
app.post('/api/course', api.addCourse);
app.get('/', HomeController.index);
app.get('/signup', signupController.signupGet);
app.post('/signup', signupController.signupPost);
app.get('/login', loginController.loginGet);
app.post('/login', loginController.loginPost);
app.get('/logout', logoutController.logoutGet);
app.get('/profile', auth.requiredAuthentication, profileController.profileGet);
app.post('/profile', profileController.updateProfile);
app.get('/forgotPass', forgotPassController.forgotPassGet);
app.post('/forgotPass', forgotPassController.forgotPassPost);

// Production error handler
if (app.get('env') === 'production') {
    app.use((err, req, res) => {
        console.error(err.stack);
        res.sendStatus(err.status || 500);
    });
}

app.listen(app.get('port'), () => {
    console.log(`Express server listening on port ${app.get('port')}`);
});

module.exports = app;
