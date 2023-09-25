require('dotenv').config()
require('express-async-errors')

const express = require('express')
const app = express()
//database
const connectDB = require('./db/connect')
//routers
const authRouter = require('./routes/authRoutes')
const userRouter = require('./routes/userRoutes')
const productsRouter = require('./routes/productRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const orderRouter = require('./routes/orderRoutes')
//middleware
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const rateLimiter = require('express-rate-limit')
const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')
const mongoSanitize = require('express-mongo-sanitize')

const port = process.env.PORT || 5000
//enables us to read and decipher json data
app.use(cors())
app.use(express.json())
//to access cookies
app.use(cookieParser(process.env.JWT_SECRET))
app.use(express.static('./public'))
app.use(fileUpload())

app.use('/api/v1/auth',authRouter)
app.use('/api/v1/users',userRouter)
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/orders', orderRouter)

app.get('/',(req,res)=>{
    res.send('ecommerce api')
})

app.get('/api/v1',(req,res)=>{
    console.log(req.signedCookies)
    // throw new Error('qweqwqwe')
    res.send('ecommerce api')
})

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

app.set('trust proxy', 1)
app.use(rateLimiter({
    windowsMs: 15 * 60 * 1000,
    max: 60
}))
app.use(helmet())
app.use(cors())
app.use(xss())
app.use(mongoSanitize())

const start = async() => {
    try {
        await connectDB(process.env.MONGO_URL)
        app.listen(port, ()=>{
            console.log(`app is listening to port ${port}....`)
        })
    } catch (error){
        console.log(error)
    }

}

start()
