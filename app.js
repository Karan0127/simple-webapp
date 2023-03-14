const express = require('express');
const app = express();
const mongoose = require('mongoose');

const db_link = 'mongodb+srv://admin:adminpass@cluster0.crpdwib.mongodb.net/?retryWrites=true&w=majority';
//mongoose.set('strictQuery', true);
mongoose.connect(db_link)
.then(function(db){             //since connect is a promise based function
    console.log('Connected to MongoDB successfully');
})
.catch(function(err){
    console.log(err);
})

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//const usersRoute = require('./routes/userRoutes.js');
//app.use('/users' , usersRoute);

//const router = express.Router();
const User = require('./model/User.js'); 
const bcrypt = require('bcrypt');

const path = require('path');
app.get('/',function(req,res){
    const pathToSignup = path.join(__dirname, '/views/signup.html');
    //console.log(pathToSignup);
    res.sendFile(pathToSignup);
});

app.get('/login',function(req,res){
    const pathToSignup = path.join(__dirname, '/views/login.html');
    res.sendFile(pathToSignup);
});


app.post('/users', (req, res) => {
    const user = new User({
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        userName : req.body.userName,
        password : req.body.password,
        email : req.body.email
    });
    bcrypt.hash(user.password, 10, function(err, hash){
        if(err){
            return next(err);
        }
        user.password = hash;
        user.save()
        .then(data => {console.log('Successfully created a new User');})
        .catch(error => {console.log('Error');})
    })
    //res.json({message: "successfully signed up"});
    res.redirect('/users');
});


const ejs = require('ejs');
app.set('view engine', 'ejs');
app.get('/users', async (req, res) => {
    let result = await User.find();
    if (result) { 
        res.render('availableUsers', {'users' : result});
    } else {
        res.status(404);
    }
   
})

const passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(
    { usernameField: 'userName' },
    (userName, password, done) => {
       User.findOne({userName: userName}, (err, userData) => {
       let passwordCheck = bcrypt.compareSync(password,   userData.password);
 if(userName === userData.userName && passwordCheck) {
     return done(null, userData)
    }
   })
 }
 ));
 app.post('/login', (req, res, next) => {
 passport.authenticate('local', (err, user, info) => {
      req.login(user, (err) => {
      // Write code to redirect to any html page.
      res.redirect('/index');
      })
    })
 });

// const session = require('express-session');
// const FileStore = require('session-file-store')(session);
// const { v4: uuid } = require('uuid');
// app.use(session({
//    genid: (req) => {
//    return uuid() // use UUIDs for session IDs
//    },
//    store: new FileStore(),
//    secret: 'any key is fine',
//    resave: false,
//    saveUninitialized: true
// }))
// passport.serializeUser((user, done) => {
//     done(null, user.id);
// });
// passport.deserializeUser(function(id, done) {
// User.findById(id, function(err, user) { 
//     loggedInUser = user;
//     done(err, user);
// });
// });


app.listen(3000, () => {
    console.log('Server listening on 3000');
 })
