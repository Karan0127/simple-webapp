var express = require('express');
const router = express.Router();
const User = require('../model/User.js'); 
const bcrypt = require('bcrypt');

router.post('/user', (req, res) => {
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
});
module.exports = router;