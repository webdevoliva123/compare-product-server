const Users = require("../model/User")
const { decryptToken } = require("../utils/token")


const secureRouterForUser = async (req,res,next) => {
    try {
       let token = req.headers.authorization

       if(!token){
        return res.status(500).json({
            success : false,
            error : 'Internal Server Error : You not allowed to access this page.'
        })
       }

       token = token.split(' ')[1]

       let dToken = await decryptToken(token)


       if(!dToken.userId){
        return res.status(500).json({
            success : false,
            error : 'Internal Server Error : You not allowed to access this page.'
        })
       }

       if(dToken.userId){
            const user = await Users.findById(dToken.userId)

            if(!user){
                return res.status(500).json({
                    success : false,
                    error : 'Internal Server Error : You not allowed to access this page.'
                })
            }

            req.userData = user

            return next()
       }

       req.userData = null

       next()

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            error : 'Internal Server Error : You not allowed to access this page.'
        })
    }
}


module.exports = {secureRouterForUser}