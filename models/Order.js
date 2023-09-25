const mongoose = require('mongoose')

const SingleOrderItemSchema = new mongoose.Schema({
    name: {type:String,required:true},
    image: {type:String,required:true},
    price: {type:Number,required:true},
    amount: {type:Number,required:true},
    product: { 
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
    }
})

const OrderSchema = new mongoose.Schema(
    {
        tax:{
            type: Number,
            required: [true,'Please enter a tax amount']
        },
        shippingFee: {
            type: Number,
            required: [true, 'Please enter shipping fee']
        },
        subTotal: {
            type: Number,
            required: [true, 'Please enter sub total']
        },
        total: {
            type: Number,
            required: [true, 'Please enter total']
        },
        orderItems : [SingleOrderItemSchema],
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "failed", "delivered", "cancelled", "paid"],
            default: "pending"
        },
        clientSecret: {
            type: String,
            required: true
        },
        paymentIntentId: {
            type: String,
        }
    },
    {timestamps:true}
)

module.exports = mongoose.model('Order', OrderSchema)