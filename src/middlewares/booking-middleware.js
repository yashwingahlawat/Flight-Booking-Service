const { StatusCodes } = require("http-status-codes");
const { ErrorResponse } = require("../utils/common");
const { AppError } = require("../utils/errors/app-error");

async function validateCreateRequest(req,res,next){
    console.log(req.body);
    if(!req.body || !req.body.flightId){
        ErrorResponse.message='Something went wrong while creating an booking'
        ErrorResponse.error=new AppError(["flightId can't be fount correctly"],StatusCodes.BAD_REQUEST)
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse)
    }
    if(!req.body || !req.body.userId){
        ErrorResponse.message='Something went wrong while creating an booking'
        ErrorResponse.error=new AppError(["userId can't be fount correctly"],StatusCodes.BAD_REQUEST)
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse)
    }
    if(!req.body || !req.body.noOfSeats){
        ErrorResponse.message='Something went wrong while creating an booking'
        ErrorResponse.error=new AppError(["noOfSeats can't be fount correctly"],StatusCodes.BAD_REQUEST)
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse)
    }
    next()
}

async function validatePaymentRequest(req,res,next){
    if(!req.body || !req.body.bookingId){
        ErrorResponse.message='Something went wrong while creating an booking'
        ErrorResponse.error=new AppError(["bookingId can't be fount correctly"],StatusCodes.BAD_REQUEST)
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse)
    }
    if(!req.body || !req.body.userId){
        ErrorResponse.message='Something went wrong while creating an booking'
        ErrorResponse.error=new AppError(["userId can't be fount correctly"],StatusCodes.BAD_REQUEST)
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse)
    }
    if(!req.body || !req.body.totalCost){
        ErrorResponse.message='Something went wrong while creating an booking'
        ErrorResponse.error=new AppError(["totalCost can't be fount correctly"],StatusCodes.BAD_REQUEST)
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse)
    }
    next()
}

module.exports={
    validateCreateRequest,
    validatePaymentRequest
}



