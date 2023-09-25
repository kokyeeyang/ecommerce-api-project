const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
    name:{
        type: String,
        //trim any whitespaces
        trim: true,
        required: [true, 'Please provide a name for the product'],
        maxlength: [100, 'Please limit to not more than 100 characters']
    },
    price:{
        type: Number,
        required: [true, 'Please provide a price'],
        default: 0
    },
    description: {
        type: String,
        required: true,
        maxlength: [1000, 'Please limit to not more than 1000 characters']
    },
    image: {
        type: String,
        default: '/uploads/example.jpeg'
    },
    category: {
        type: String,
        required: [true, 'please provide product category'],
        enum: ['office', 'kitchen', 'bedroom']
    },
    company: {
        type: String,
        required: [true, 'Please provide a company!'],
        // another way of using enum
        enum: {
            values: ['ikea', 'liddy', 'marcos'],
            message: '{VALUE} is not supported'
        }
    },
    colors: {
        // [] because there might be a combination of colors
        type: [String],
        default: ['#222'],
        required: [true, 'Please provide a color']
    },
    featured: {
        type: Boolean,
        default: false
    },
    freeShipping: {
        type: Boolean,
        default: false
    },
    inventory: {
        type: Number,
        required: true,
        default: 10
    },
    averageRating: {
        type: Number,
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref:"User",
        required: true
    }
// have to use mongoose virtuals because we didnt link product to reviews, only the other way round
}, {timestamps:true,toJSON:{virtuals:true},toObject:{virtuals:true}})

ProductSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'product',
    //because we want all the reviews linked to this product, not just one
    justOne: false,
    // this one can return reviews that have rating with 3 stars
    // match: {rating:3}
})

ProductSchema.pre('remove', async function (next){
    // delete all the reviews where 'product' matches product id
    await this.model('Review').deleteMany({product:this._id})
})
module.exports = mongoose.model('Product', ProductSchema)