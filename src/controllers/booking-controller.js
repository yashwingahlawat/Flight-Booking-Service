const { StatusCodes } = require('http-status-codes')
const {BookingService}=require('../services')
const {SuccessResponse,ErrorResponse}=require('../utils/common')

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
        console.log("ok")
        console.log(error)
        ErrorResponse.error=error
        resStatuseCode=error.statusCode?error.statusCode:StatusCodes.INTERNAL_SERVER_ERROR
        res.status(resStatuseCode).json(ErrorResponse)
    }
}

module.exports={
    createBooking
}