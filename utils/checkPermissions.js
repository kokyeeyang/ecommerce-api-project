const CustomError = require('../errors')

// basically when you are accessing get singleUser resource, the resourceUserId will be the owner's id
const checkPermissions = (requestUser, resourceUserId) => {
    console.log(requestUser)
    console.log(resourceUserId)
    console.log(typeof(requestUserId))
    //admin can access everyone's page
    if(requestUser.role === 'admin')return

    // to string because resourceUserId is an object
    if(requestUser.id !== resourceUserId.toString()){
        throw new CustomError.UnauthorizedError('You are not authorized to view this resource')
    }
}

module.exports = checkPermissions