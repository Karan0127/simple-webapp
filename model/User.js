const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = mongoose.Schema({
     email: { type: String, unique: true, required: true },
     username: { type: String, unique: true,required: true },
     password: { type: String, required: true },
     firstName: { type: String, required: true }, 
     lastName: { type: String, required: true }
})

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema);
 
