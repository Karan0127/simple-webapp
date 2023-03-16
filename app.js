const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
var passport = require('passport');
const ejs = require('ejs');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const session = require('express-session');
const FileStore = require('session-file-store')(session);
const { v4: uuid } = require('uuid');

app.use(session({
    genid: (req) => {
    return uuid() // use UUIDs for session IDs
    },
    store: new FileStore(),
    secret: 'any key is fine',
    resave: false,
    saveUninitialized: true
}));

// Need to require the entire Passport config module so app.js knows about it
require('./authentication/passport');

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

var routes = require('./routers/userRouter.js');
app.use(routes);

app.listen(3000, () => {
    console.log('Server listening on port 3000');
 })
