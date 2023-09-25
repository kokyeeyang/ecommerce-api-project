const User = require('../models/User')
const {StatusCodes} = require('http-status-codes')
// const {BadRequestErrors, UnauthenticatedError} = require('../errors')
// can use CustomError.BadRequestErrors later on, more convenient
const CustomError = require('../errors')
const {attachCookiesToResponse, removeCookiesFromResponse, createTokenUser} = require('../utils')
// const jwt = require('jsonwebtoken')

const login = async(req,res) => {
    const {email, password} = req.body
    if(!email || !password){
        throw new CustomError.BadRequestError('Please provide email and password')
    }
    const user = await User.findOne({email})
    if(!user){
        throw new CustomError.UnauthenticatedError('Invalid credentials')
    }
    const isPasswordCorrect = await user.comparePassword(password)
    if(!isPasswordCorrect){
        throw new CustomError.UnauthenticatedError('Invalid credentials')
    }
    const tokenUser = createTokenUser(user)
    attachCookiesToResponse({res,user:tokenUser})
    res.status(StatusCodes.OK).json({user:tokenUser})
}

const logout = async(req,res) => {
    removeCookiesFromResponse({res})
    res.status(StatusCodes.OK).json('User has been logged out!')    
}

const register = async(req,res) => {
    const {name,email,password} = req.body
    // const emailAlreadyExist = User.findOne({email})
    const emailAlreadyExists = await User.findOne({ email });
    const isFirstAccount = await User.countDocuments({}) === 0

    const role = isFirstAccount ? "admin" : "user"
    if(emailAlreadyExists){
        throw new CustomError.BadRequestError('this email already exists')
    }
    // do this to prevent users from passing in 'admin' role from frontend
    const user =  await User.create({name,email,password, role})
    const tokenUser = createTokenUser(user)
    attachCookiesToResponse({res,user:tokenUser})
    console.log(req.signedCookies)
    // const token = jwt.sign(tokenUser,process.env.JWT_SECRET, {expiresIn: process.env.JWT_LIFETIME})
    // const token = createJWT({payload:tokenUser})

    
    res.status(StatusCodes.CREATED).json({user:tokenUser})

}

module.exports = {login, logout, register}