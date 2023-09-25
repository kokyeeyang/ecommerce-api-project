const express = require('express')
const router = express.Router()
const {authenticateUser, authorizePermissions} = require('../middleware/authentication')

const {getAllProducts, createProduct, getSingleProduct, updateProduct,deleteProduct, uploadImage} = require('../controllers/productController')
const {getSingleProductReviews} = require('../controllers/reviewController')

router.route('/')
.get(getAllProducts)
.post(authenticateUser,authorizePermissions('admin'), createProduct)

router.route('/uploadImage').post(authenticateUser, authorizePermissions('admin'),uploadImage)

router.route('/:id')
.get(getSingleProduct)
.patch(authenticateUser, authorizePermissions('admin'), updateProduct)
.delete(authenticateUser, authorizePermissions('admin'), deleteProduct)

// alternative way of presenting the reviews associated with a product. unlike the mongoose virtuals, we can add in the reviews.length here
// essentially means more flexible
router.route('/:id/reviews').get(getSingleProductReviews)
module.exports = router

