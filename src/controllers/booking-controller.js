const { StatusCodes } = require('http-status-codes')
const {BookingService}=require('../services')
const {SuccessResponse,ErrorResponse}=require('../utils/common')
const inMemDb={}

const createBooking=async (req,res) => {
    try {
        const response=await BookingService.createBooking({
            flightId:req.body.flightId,
            userId:req.body.userId,
            noOfSeats:req.body.noOfSeats
        })
        SuccessResponse.data=response
        res.status(StatusCodes.OK).json(SuccessResponse)
    } catch (error) {
        ErrorResponse.error=error
        resStatuseCode=error.statusCode?error.statusCode:StatusCodes.INTERNAL_SERVER_ERROR
        res.status(resStatuseCode).json(ErrorResponse)
    }
}

const makePayment= async (req,res) => {
    try {
        const idempotencyKey=req.headers['x-idempotency-key']
        console.log(idempotencyKey);
        if(!idempotencyKey || inMemDb[idempotencyKey]){
            console.log(inMemDb);
            console.log(inMemDb[idempotencyKey]);
             res.status(StatusCodes.BAD_REQUEST).json({message:`Can't retry on a successful payment.`})
        }
        const response=await BookingService.makePayment({
            bookingId:req.body.bookingId,
            userId:req.body.userId,
            totalCost:req.body.totalCost
        })
        inMemDb[idempotencyKey]=idempotencyKey
        SuccessResponse.data=response
        res.status(StatusCodes.OK).json(SuccessResponse)
    } catch (error) {
        ErrorResponse.error=error
        resStatuseCode=error.statusCode?error.statusCode:StatusCodes.INTERNAL_SERVER_ERROR
        res.status(resStatuseCode).json(ErrorResponse)
    }
}

module.exports={
    createBooking,
    makePayment
}