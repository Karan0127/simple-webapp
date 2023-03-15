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

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

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

//passport.use(User.createStrategy());
  
// Serializing and deserializing
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

const customFields = {
    usernameField: 'userName',
    passwordField: 'password'
};
//done represents function that you will the results of authentication to
const verifyCallback = (username, password, done) => {
    User.findOne({username: username})
        .then((user) => {
            if(!user) {return done(null, false)};

            let passwordCheck = bcrypt.compareSync(password, user.password);

            if(username === user.username && passwordCheck) {
                return done(null, user)
            }
            else{
                return done(null, false);
            }
        })
        .catch(err => {done(err)});
}
const strategy = new LocalStrategy(customFields, verifyCallback);
passport.use(strategy);

//for user to go into the session
passport.serializeUser((user, done) => {done(null, user.id);});

//for user to come out of the session 
passport.deserializeUser(async (id, done) => {
        User.findById(id)
            .then(user => {
                done(null, user);
            })
            .catch(err => done(err));
});

app.use(passport.initialize());
app.use(passport.session());

app.get('/',async function(req,res){
    if(req.isAuthenticated()) {
        res.send('You have already logged in. No need to signup again');  
    }
    else{
        const pathToSignup = path.join(__dirname, '/views/welcome.html');
        res.sendFile(pathToSignup);
    }
});

app.get('/register',async function(req,res){
    if(req.isAuthenticated()) {
        res.send('You have already logged in. No need to signup again');  
    }
    else{
        const pathToSignup = path.join(__dirname, '/views/signup.html');
        res.sendFile(pathToSignup);
    }
});

app.get('/login',function(req,res){
    // if(req.isAuthenticated()) {
    //     res.send('You have already logged in. No need to login again');
    // }
    // else{
        const pathToSignup = path.join(__dirname, '/views/login.html');
        res.sendFile(pathToSignup);
    //}
});


app.post('/register', (req, res, next) => {
    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.userName,
        password: req.body.password,
        email: req.body.email
    });
    
    bcrypt.hash(user.password, 10, function(err, hash){
        if(err){
            console.log(err);
            return res.status(500).send('Internal Server Error');
        }
        user.password = hash;
        user.save()
        .then(data => {
            console.log('Successfully created a new User');
            passport.authenticate('local')(req, res, function() {
               //res.status(201).send('Successfully created a new User');
               res.redirect('/login');
            });
            
        })
        .catch(error => {
            console.log(error);
            res.status(500).send('Internal Server Error');
        });
        
    });
});

const ejs = require('ejs');
app.set('view engine', 'ejs');
app.get('/users', async (req, res) => {
    if (req.isAuthenticated()) {
        let result = await User.find();
        if (result) { 
            res.render('availableUsers', {'users' : result});
        } else {
            res.status(404);
        }
    } else {
        res.send('<h1>You are not authenticated</h1><p><a href="/login">Login</a></p>');
    }  
})

app.post('/login', passport.authenticate('local', {failureRedirect: '/login-failure', successRedirect: '/login-success'}));
    //(req, res, next) => {

    //passport.authenticate('local', (err, user, info) => {
    //     if (err) {
    //         // handle error
    //         console.error(err);
    //         return next(err);
    //     }
    //     if (!user) {
    //         // handle authentication failure
    //         //console.log('The user is - ');
    //         //console.log(user);
    //         return res.status(401).send('Invalid username or password');
    //     }
    //     req.login(user, (err) => {
    //         if (err) {
    //             // handle error
    //             console.error(err);
    //             return next(err);
    //         }
    //         // authentication succeeded
    //         console.log('Authentication succeeded');
    //         return res.send('Login successful');
    //     });
    // })(req, res, next);  
    // }
//);

app.get('/login-success', (req, res, next) => {
    res.send('<p>You successfully logged in. --> <a href="/users">See all users</a></p>');
});


app.get('/logout', (req, res, next) => {
    req.logout(err => {console.log(err)});
    res.redirect('/login');
});

app.get('/login-failure', (req, res, next) => {
    res.send('You entered the wrong password.');
});

app.listen(3000, () => {
    console.log('Server listening on 3000');
 })
