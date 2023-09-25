const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'A rating is mandatory']
    },
    title: {
        type: String,
        trim: true,
        required: [true, 'A title is required'],
        maxLength: [100, 'title cannot exceed 100 characters']
    },
    comment: {
        type: String,
        required: [true, 'A comment is required'],
        maxLength: [300, 'comment cannot exceed 300 characters']
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Types.ObjectId,
        ref: 'Product',
        required: true
    }
},{timestamps:true})

//to set that 1 user can only leave 1 review per product
ReviewSchema.index({product:1,user:1},{unique:true})

// if we want to use the method in the same schema, then we need to use statics
// if we are going to use it in another instance, then we need to use methods
ReviewSchema.statics.calculateAverageRating = async function(productId){
    const result = await this.aggregate([
        {
            $match: {
              'product': productId
            }
        }, {
            $group: {
              _id: null, 
              averageRating: {$avg: '$rating'}, 
              numOfReviews: {$sum: 1}
            }
        }
    ])

    try {
        await this.model('Product').findOneAndUpdate({_id:productId}, 
            {
                averageRating:Math.ceil(result[0]?.averageRating || 0),
                numOfReviews:result[0]?.numOfReviews || 0
            }
        )
        console.log(result[0].numOfReviews)
    } catch (error){
        console.log(error)
    }
    
}
ReviewSchema.post('save', async function(){
    // this.product comes from above
    await this.constructor.calculateAverageRating(this.product)
})

ReviewSchema.post('remove', async function(){
    await this.constructor.calculateAverageRating(this.product)
})


module.exports = mongoose.model('Review', ReviewSchema)