const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

const db_link = 'mongodb+srv://admin:adminpass@cluster0.crpdwib.mongodb.net/?retryWrites=true&w=majority';
//mongoose.set('strictQuery', true);
mongoose.connect(db_link)
.then(function(db){             
    console.log('Connected to MongoDB successfully');
})
.catch(function(err){
    console.log(err);
})

const userSchema = mongoose.Schema({
     email: { type: String, unique: true, required: true },
     username: { type: String, unique: true,required: true },
     password: { type: String, required: true },
     firstName: { type: String, required: true }, 
     lastName: { type: String, required: true }
})

//userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema);