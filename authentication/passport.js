const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/userModel.js'); 
const bcrypt = require('bcrypt');
const passport = require('passport');

//passport.use(User.createStrategy());
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
passport.deserializeUser((id, done) => {
        User.findById(id)
            .then(user => {
                done(null, user);
            })
            .catch(err => done(err));
});

