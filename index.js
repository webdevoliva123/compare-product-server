const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()
const ValidatePassword = require('validate-password');
const Users = require('./model/User')
const {decryptToken, createTokenForUser } = require('./utils/token')
const { secureRouterForUser } = require('./middleware/protectedRouter')
const User = require('./model/User')
const Products = require('./model/Product')
const validator = require("email-validator");


const passOptions = {
    enforce: {
        lowercase: true,
        uppercase: true,
        specialCharacters: false,
        numbers: true
    }
};

var passValidator = new ValidatePassword(passOptions);

var corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
  }

// APP USE
app.use(express.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(cors(corsOptions))

// USERS  FUNCTIONS 
// ----------------------------------------------------------------
// Other functions
const returnError = (res,status,errorMessage) => {
    return res.status(status || 500).json({
        success : false,
        error : errorMessage
    })
}


// ----------------------------------------------------------------
// Users Functions
const createUser = async (req, res) => {
    try {
        const {email, password} = req.body
        
        // Email  Validation
        const eValid = validator.validate(email)

        if(!eValid) {
            return returnError(res,500,'Please enter a valid email')
        }

        // Password Validation
        if(password.length < 8){
            return returnError(res,500,'Password should be at least 8 characters')
        }

        const checkedPassword = passValidator.checkPassword(password)
        if(!checkedPassword.isValid){
            return  returnError(res,500,checkedPassword.validationMessage)
        }

        // Check User Already Exists In Database
        const alreadyExistsUser = await Users.find({email})

        if(alreadyExistsUser.length !== 0){
            return returnError(res,500,'Email is already taken, try another one.')
        }

        // Add user in database
        const newUser = await Users.create({email,password})
        if(newUser){
            return res.status(201).json({
                success : true,
                data : newUser,
                message : 'User logged in successfully',
                token : createTokenForUser(newUser._id)
            })
        }
    } catch (error) {
        console.log(error);
       return  returnError(res,500,`something went wrong :  ${error.message}`)
    }
}

const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body
        
        // Username Validation
        if(!email){
            return returnError(res,500,'Please, enter your email.')
        }

        // Password Validation
        if(!password){
            return returnError(res,500,'Please, enter your password.')
        }

        // Check User Exists In Database
        const findUser = await Users.findOne({email})

        if(!findUser){
            return returnError(res,500,'Invalid username or password')
        }

        // Validate Loging User Password
        if(password !== findUser.password){
            return returnError(res,500,'Invalid username or password')
        }

        // Return User Info
        return res.status(200).json({
            success : true,
            data : findUser,
            message : 'User logged in successfully',
            token : createTokenForUser(findUser._id)
        })
        
    } catch (error) {
        console.log(error);
        return  returnError(res,500,`something went wrong :  ${error.message}`)
    }
}

const loadDataByToken = async (req,res) => {
    try {
        const token = req.params.token

        const verifyToken = await decryptToken(token)

        if(verifyToken.admin){
            return res.status(200).json({
                success : true,
                role : 'admin',
                data : null,
                authorized : true
            })
        }else{
            if(verifyToken.guest){
                return res.status(200).json({
                    success : true,
                    role : 'guest',
                    data : null,
                    authorized : true
                })
            }else{
                const user = await User.findById(verifyToken.userId);

                return res.status(200).json({
                    success : true,
                    role : 'user',
                    data : user,
                    authorized : true
                })
            }
        }
        

    } catch (error) {
       console.log(error);
       return  returnError(res,500,`something went wrong :  ${error.message}`)
    }
}

// ----------------------------------------------------------------
// Products Functions
const listAllProducts = async (req,res) => {
    try {
        const page = req.params.page
        const products = await Products.find().sort( { _id: -1 } ) .skip(page ? page * 6 : 0).limit(6)

        return res.status(200).json({
            success : true,
            data : products,
        })

    } catch (error) {
        console.log(error);
        return  returnError(res,500,`something went wrong :  ${error.message}`)
    }
}

const productInfo = async (req,res) => {
    try {
        const productId = req.params.productId
        const product = await Products.findById(productId)

        if(!product){
            return  returnError(res,500,`Product Not Found`)
        }

        return res.status(200).json({
            success : true,
            data : product,
        })

    } catch (error) {
        console.log(error);
        return  returnError(res,500,`something went wrong :  ${error.message}`)
    }
}

const compareProduct = async (req,res) => {
    try {
       
        const product1 = await Products.findById(req.params.prd1_id)
        const product2 = await Products.findById(req.params.prd2_id)

        if(!product1 || !product2){
            return  returnError(res,500,`Product Not Found`)
        }

        return res.status(200).json({
            success : true,
            data : {
                product1,
                product2
            },
        })

    } catch (error) {
        console.log(error);
        return  returnError(res,500,`something went wrong :  ${error.message}`)
    }
}

// ALL ROUTER LISTED
// ----------------------------------------------------------------
// ALL
app.get('/api/v1/load/data/:token',loadDataByToken)
// Users Routers
app.post('/api/v1/new/user',createUser)
app.post('/api/v1/login/user',loginUser)
// Products Routers
app.get('/api/v1/products/:page',secureRouterForUser,listAllProducts)
app.get('/api/v1/products',secureRouterForUser,listAllProducts)
app.get('/api/v1/product/:productId',secureRouterForUser,productInfo)
app.get('/api/v1/compare/product/:prd1_id/:prd2_id',secureRouterForUser,compareProduct)

// SERVER CONFIGRATION
const PORT = 5500 || process.env.PORT 
app.listen(PORT,() => {
    console.log(`Server is listening on ${PORT}`)
    // MONGODB CONFIGRATION
    const mongoURL = `mongodb+srv://oliva:--olivavendingmachine--@cluster0.6piidho.mongodb.net/?retryWrites=true&w=majority`
    mongoose.connect(mongoURL).then(() => {
        console.log(`MongoDB is connected to server`)
    }).catch((err) => {
        console.log(`Something Went Wrong : ${err}`);
    })
})