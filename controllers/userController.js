const User = require('../models/User')
const StatusCodes = require('http-status-codes')
const CustomError = require('../errors')
const {createTokenUser,attachCookiesToResponse,checkPermissions} = require('../utils')

const getAllUsers = async(req,res) => {
    const users = await User.find({
        role: "user"
    }).select('-password')

    if(!users){
        throw new CustomError.NotFoundError('no users found!')
    }
    res.status(StatusCodes.OK).json({users})
}

const getSingleUser = async(req,res) => {
    // in order to not return the password
    const user = await User.findOne({
        _id: req.params.id
    }).select('-password')

    checkPermissions(req.user,user.id)
    if(!user){
        throw new CustomError.NotFoundError(`no user with this id ${req.params.id} is found!`)
    }

    res.status(StatusCodes.OK).json({user})
}

const showCurrentUser = async(req,res) => {
    res.status(StatusCodes.OK).json({user:req.user})
}

// update user with findOne
const updateUser = async(req,res) => {
    const {name, email} = req.body
    if(!name || !email){
        throw new CustomError.BadRequestError('Either name or email is missing, please check again')
    }
    // need to have {new:true} to return the credentials after being updated, otherwise the token user will be inaccurate
    // const user = await User.findOneAndUpdate({_id: req.user.id}, {name,email}, {new:true, runValidators:true})

    const user = await User.findOne({_id:req.user.id})

    user.name = name
    user.email = email
    user.save()
    const tokenUser = createTokenUser(user)
    console.log(tokenUser)
    attachCookiesToResponse({res,user:tokenUser})
    if(!user){
        throw new CustomError.NotFoundError(`no user can be found with this id ${req.params.id}`)
    }
    res.status(StatusCodes.OK).json({user:tokenUser})
}

const updateUserPassword = async(req,res) => {
    const {oldPassword, newPassword} = req.body
    if(!oldPassword || !newPassword){
        throw new CustomError.BadRequestError('Please provide both passwords')
    }
    const user = await User.findOne({ _id: req.user.id });
    const isPasswordCorrect = await user.comparePassword(oldPassword)
    
    if(!isPasswordCorrect){
        throw new CustomError.UnauthenticatedError('Invalid credentials')
    }

    user.password = newPassword
    await user.save()
    res.status(StatusCodes.OK).json({msg:'Password change all done'})
}

module.exports = {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword
}

// this works too, but we then cannot do anything in pre save
// const updateUser = async(req,res) => {
//     const {name, email} = req.body
//     if(!name || !email){
//         throw new CustomError.BadRequestError('Either name or email is missing, please check again')
//     }
//     // need to have {new:true} to return the credentials after being updated, otherwise the token user will be inaccurate
//     const user = await User.findOneAndUpdate({_id: req.user.id}, {name,email}, {new:true, runValidators:true})
//     const tokenUser = createTokenUser(user)
//     console.log(tokenUser)
//     attachCookiesToResponse({res,user:tokenUser})
//     if(!user){
//         throw new CustomError.NotFoundError(`no user can be found with this id ${req.params.id}`)
//     }
//     res.status(StatusCodes.OK).json({user:tokenUser})
// }