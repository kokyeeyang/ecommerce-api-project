const express = require('express')
const router = express.Router()
const {authenticateUser, authorizePermissions} = require('../middleware/authentication')

const {getAllOrders,
    createOrder,
    getSingleOrder,
    updateOrder,
    getCurrentUserOrders} = require('../controllers/orderController')

router.route('/')
.get(authenticateUser,authorizePermissions('admin'),getAllOrders)
.post(authenticateUser, createOrder)

router.route('/showAllMyOrders')
.get(authenticateUser, getCurrentUserOrders)

router.route('/:id')
.get(authenticateUser, getSingleOrder)
.patch(authenticateUser, updateOrder)

module.exports = router