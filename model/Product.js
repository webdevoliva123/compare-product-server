const mongoose = require('mongoose')

const productSechma = {
    title : {
        type : String,
        require : true
    },
    description : {
        type : String,
        require : true
    },
    stock : {
        type : Number,
        default : 1,
        require : true
    },
    price : {
        type : Number,
        require : true
    },
    discountPercentage : {
        type : Number,
        require : true
    },
    rating : {
        type : Number,
        require : true
    },
    brand: {
        type : String,
        require : true
    },
    category: {
        type : String,
        require : true
    },
    thumbnail: {
        type : String,
        require : true
    },
    images: [
        {
        type : String,
        require : true
        }
    ]
}

const Product = mongoose.model('product',productSechma)

module.exports = Product