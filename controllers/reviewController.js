const Review = require('../models/Review')
const User = require('../models/User')
const CustomError = require('../errors')
const { StatusCodes } = require('http-status-codes')
const {checkPermissions} = require('../utils')
const Product = require('../models/Product')

const createReview = async(req,res) => {
    // const productId = req.body.product
    const { product:productId } = req.body
    const isValidProduct = await Product.findOne({_id:productId})
    if(!isValidProduct){
        throw new CustomError.NotFoundError('invalid product!')
    }
    
    // verify that only one review allowed per user for one product
    const alreadySubmitted = await Review.find({
        product:productId,
        user:req.user.id
    })
    
    if(alreadySubmitted != false){
        throw new CustomError.BadRequestError('already submitted review for this product')
    }
    req.body.user = req.user.id
    const review = await Review.create(req.body)
    res.status(StatusCodes.CREATED).json({review})
}

const getAllReviews = async(req,res) => {
    // chain to product model, get name, price and company from product model
    const reviews = await Review.find({}).populate({path:'product', select:'name price company'})
    console.log(reviews)
    res.status(StatusCodes.OK).json({reviews,count:reviews.length})
}

const getSingleReview = async(req,res) => {
    const {id:reviewId} = req.params

    const review = await Review.findOne({_id:reviewId})

    if(!review){
        throw new CustomError.NotFoundError(`no review found with id ${reviewId}`)
    }
    res.status(StatusCodes.OK).json({review})
}

const updateReview = async(req,res) => {
    const {id:reviewId} = req.params
    console.log(reviewId)
    // const review = await Review.findOneAndUpdate({_id:reviewId},req.body,{new:true,runValidators:true})
    const {rating,title,comment} = req.body
    const review = await Review.findOne({_id:reviewId})
    if(!review){
        throw new CustomError.NotFoundError(`No review found with ${reviewId}`)
    }
    checkPermissions(req.user,review.user)
    review.rating = rating
    review.title = title
    review.comment = comment

    await review.save()

    res.status(StatusCodes.OK).json({review})
}

const deleteReview = async(req,res) => {

    const {id:reviewId} = req.params
    const review = await Review.findOne({_id:reviewId})

    if(!review){
        res.status(StatusCodes.NOT_FOUND).json({msg:"review not found"})
    }

    checkPermissions(req.user,review.user)
    await review.remove()
    res.status(StatusCodes.OK).json({msg:"review has been deleted!"})
}

// alternative way of presenting the reviews associated with a product. unlike the mongoose virtuals, we can add in the reviews.length here
const getSingleProductReviews = async(req,res) => {
    const { id: productId } = req.params
    const reviews = await Review.find({product:productId})
    res.status(StatusCodes.OK).json({reviews,count: reviews.length})
}

module.exports = {
    createReview,getAllReviews,getSingleReview,updateReview,deleteReview,getSingleProductReviews
}