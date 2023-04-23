const jwtoken = require('jsonwebtoken')

const createTokenForUser = (userId) => {
    return jwtoken.sign({userId,guest : false},process.env.SECRET_TOKEN,{
        expiresIn : '24h'
    })
}


const decryptToken = (token) => { 
    return jwtoken.verify(token,process.env.SECRET_TOKEN)
}



module.exports = {createTokenForUser,decryptToken}