const mongoose = require('mongoose')

const userSechma = {
    email : {
        type : String,
        required : true,
        trim : true
    },
    password : {
        type : String,
        required : true,
        trim : true
    },
}

const User = mongoose.model('User',userSechma)

module.exports = User