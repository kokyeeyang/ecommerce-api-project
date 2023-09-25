const Order = require('../models/Order')
const Product = require('../models/Product')
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors')
const path = require('path')
const { checkPermissions } = require('../utils')

const getAllOrders = async(req,res) => {
    let orders = await Order.find({})
    res.status(StatusCodes.OK).json({orders, count: orders.length})
}
const FakeStripeApi = async({amount, currency}) => {
    const clientSecret = 'someRandomValue'

    return {clientSecret, amount}
}
const createOrder = async(req,res) => {
    const {items:cartItems,tax,shippingFee} = req.body

    if(!cartItems || cartItems.length < 1){
        throw new CustomError.BadRequestError('no cart items provided')
    }

    if(!tax || !shippingFee){
        throw new CustomError.BadRequestError('no tax or shipping fee provided')
    }

    let orderItems = []
    let subTotal = 0

    for(const item of cartItems){
        const dbProduct = await Product.findOne({_id:item.product})
        if(!dbProduct){
            throw new CustomError.NotFoundError(`product with id ${item.product} is not found`)
        }

        const {name,price,image,_id} = dbProduct

        // console.log(name,price,image)
        const singleOrderItem = {
            amount: item.amount,
            name,price,image,product:_id
        }

        // add item to order array
        orderItems = [...orderItems,singleOrderItem]
        // calculate subtotal
        subTotal += item.amount * price
    }

    // calculate total
    const total = subTotal + tax + shippingFee

    // get client secret
    const paymentIntent = await FakeStripeApi(
        {
            amount: total,
            currency: 'usd'
        }
    )
    // console.log({
    //     orderItems,total,subtotal,tax,shippingFee,clientSecret:paymentIntent.client_secret,user:req.user.userId
    // })
    const order = await Order.create({
        orderItems,total,subTotal,tax,shippingFee,clientSecret:paymentIntent.clientSecret,user:req.user.id
    })
    // res.send('create order')
    // req.body.user = req.user.id
    // const order = await Order.create(req.body)

    res.status(StatusCodes.CREATED).json({order, clientSecret: order.clientSecret})
}

const getSingleOrder = async(req,res) => {
    const {id:orderId} = req.params
    const order = await Order.findOne({_id:orderId})
    
    if(!order){
        throw new CustomError.NotFoundError(`Order with id ${orderId} was not found`)
    }

    // to make sure that currently logged in user can only see his own orders weeee
    checkPermissions(req.user,order.user)

    res.status(StatusCodes.OK).json({order})
}

const getCurrentUserOrders = async(req,res) => {
    const orders = await Order.find({user: req.user.id})
    res.status(StatusCodes.OK).json({orders,count:orders.length})
}

const updateOrder = async(req,res) => {
    const {id : orderId} = req.params
    const {paymentIntentId} = req.body

    const order = await Order.findOne({_id:orderId})
    
    if(!order){
        throw new CustomError.NotFoundError(`Order with id ${orderId} was not found`)
    }

    // to make sure that currently logged in user can only update his own orders
    checkPermissions(req.user,order.user)

    order.paymentIntentId = paymentIntentId
    order.status = 'paid'
    await order.save()

    res.status(StatusCodes.OK).json({order})
}

module.exports = {
    getAllOrders,
    createOrder,
    getSingleOrder,
    updateOrder,
    getCurrentUserOrders
}