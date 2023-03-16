const router = require('express').Router();
const passport = require('passport');
const User = require('../models/userModel.js'); 
const bcrypt = require('bcrypt');
const path = require('path');

router.get('/', function(req,res){
    if(req.isAuthenticated()) {
        res.send('You have already logged in. No need to signup again');  
    }
    else{
        const pathToSignup = path.join(__dirname, '../views/welcome.html');
        res.sendFile(pathToSignup);
    }
});

router.get('/register', function(req,res){
    if(req.isAuthenticated()) {
        res.send('You have already logged in. No need to signup again');  
    }
    else{
        const pathToSignup = path.join(__dirname, '../views/signup.html');
        res.sendFile(pathToSignup);
    }
});

router.get('/login',function(req,res){
        const pathToSignup = path.join(__dirname, '../views/login.html');
        res.sendFile(pathToSignup);
});


router.post('/register', (req, res, next) => {
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
            // passport.authenticate('local')(req, res, function() {
            //    res.status(201).send('Successfully created a new User');
            // });
            res.redirect('/login');
            
        })
        .catch(error => {
            console.log(error);
            res.status(500).send('Internal Server Error');
        });
        
    });
});

router.get('/users', async (req, res) => {
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

router.post('/login', passport.authenticate('local', {failureRedirect: '/login-failure', successRedirect: '/login-success'}));

router.get('/login-success', (req, res, next) => {
    res.send('<p>You successfully logged in. --> <a href="/users">See all users</a></p>');
});

router.get('/logout', (req, res, next) => {
    req.logout(err => {
        console.log(err);
    });
    res.redirect('/users');
});

router.get('/login-failure', (req, res, next) => {
    res.send('You entered the wrong password.');
});

module.exports = router;