const Product = require('../models/Product')
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors')
const path = require('path')

const getAllProducts = async(req,res) => {
    let products = await Product.find({})
    res.status(StatusCodes.OK).json({products, count: products.length})
}

const createProduct = async(req,res) => {
    // to keep track who is creating the product
    // .user is set in product model
    req.body.user = req.user.id
    const product = await Product.create(req.body)

    res.status(StatusCodes.CREATED).json({product})
}

const getSingleProduct = async(req,res) => {
    const { id:productId } = req.params
    //this has to use mongoose virtuals inside Product model
    const product = await Product.findOne({ _id:productId }).populate('reviews')
    console.log(productId)

    if(!product){
        throw new CustomError.NotFoundError(`No product found with id ${productId}`)
    }
    res.status(StatusCodes.OK).json({product})
}

const updateProduct = async(req,res) => {
    const {id:productId} = req.params
    const product = await Product.findByIdAndUpdate({_id:productId}, req.body, {new:true,runValidators:true})

    if(!product){
        throw new CustomError.NotFoundError(`No product found with id ${productId}`)
    }
    res.status(StatusCodes.OK).json({product})
}

const deleteProduct = async(req,res) => {
    const {id:productId} = req.params
    const product = await Product.findOne({_id:productId})

    if(!product){
        throw new CustomError.NotFoundError(`No product found with id ${productId}`)
    }

    // can set a hook to delete all reviews, orders linked to this product
    // removing anything that has to do with this product. eg. foreign keys and what not
    await product.remove()
    res.status(StatusCodes.OK).json({msg:"product deleted!"})
}

const uploadImage = async(req,res) => {
    console.log(req.files)
    if(!req.files){
        throw new CustomError.BadRequestError('please attach an image')
    }

    const productImage = req.files.image

    if(!productImage.mimetype.startsWith('image')){
        throw new CustomError.BadRequestError('Please upload image')
    }
    const maxSize = 1024*1024

    if(productImage.size > maxSize){
        throw new CustomError.BadRequestError('Please upload image smaller than 1mb')
    }

    const imagePath = path.join(__dirname,'../public/uploads/' + productImage.name)

    await productImage.mv(imagePath)

    res.status(StatusCodes.OK).json({image:`/uploads/${productImage.name}`})
}


module.exports = {getAllProducts, createProduct, getSingleProduct, updateProduct,deleteProduct, uploadImage}