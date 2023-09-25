const CustomError = require('../errors')
const {isTokenValid} = require('../utils')

const authenticateUser = async(req,res,next) => {
    const token = req.signedCookies.token

    if(!token){
        throw new CustomError.UnauthenticatedError('Authentication invalid!')
    }
    
    try {
       // all these comes from the authController
       const {name,id,role} = isTokenValid({token}) 
       req.user = {name,id,role}
       next()
    } catch (error) {
        throw new CustomError.UnauthenticatedError('Authentication invalid!') 
    }
}

const authorizePermissions = (...roles) => {
    // express needs this to be a callback function
    return (req,res,next) => {
        if(!roles.includes(req.user.role)){
            throw new CustomError.UnauthorizedError('Unauthorized to access this route')
        }
        next()
    }
}

module.exports = {
    authorizePermissions,
    authenticateUser
}