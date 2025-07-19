const axios=require('axios')
const {BookingRepositor}=require('../repositories')
const db=require('../models')
const { ServerConfig } = require('../config')
const { AppError } = require('../utils/errors/app-error')
const { StatusCodes } = require('http-status-codes')
const {BOOKING_STATUS}=require('../utils/common/enums')

const {BOOKED,CANCELLED}=BOOKING_STATUS
const bookingRepository=new BookingRepositor()

const createBooking=async(data)=>{
    const transaction=await db.sequelize.transaction()
    try {
        const flight=await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`)
        const flightData=flight.data.data
        if(data.noOfSeats>flightData.totalSeats){
            throw new AppError('Enough Seats are not available',StatusCodes.INTERNAL_SERVER_ERROR)
        }
        const totalBilling=data.noOfSeats*flightData.price
        console.log(totalBilling)
        const bookingPayload={...data,totalCost:totalBilling}
        const booking=await bookingRepository.createBooking(bookingPayload,transaction)
        await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`,{
            seats:data.noOfSeats
        })
        await transaction.commit()
        return booking
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

const makePayment= async(data)=> {
    const transaction=await db.sequelize.transaction()
    try {
        const bookingDetails=await bookingRepository.get(data.bookingId,transaction)
        const bookingTime=new Date(bookingDetails.createdAt)
        const currTime=new Date()
        if(bookingDetails==CANCELLED){
            throw new AppError(`The booking time has already expired`,StatusCodes.BAD_REQUEST)
        }
        if(currTime-bookingTime>300000){
            await cancelBooking(data.bookingId)
            throw new AppError(`The booking time has already expired`,StatusCodes.BAD_REQUEST)
        }
        if(bookingDetails.status==BOOKED){
            throw new AppError(`The seat has already been booked`,StatusCodes.BAD_REQUEST)
        }
        if(bookingDetails.totalCost!=data.totalCost){
            throw new AppError(`The amount of the payment doesn't match`,StatusCodes.BAD_REQUEST)
        }
        if(bookingDetails.userId!=data.userId){
            throw new AppError(`The user doesn't match.`,StatusCodes.BAD_REQUEST)
        }
        await bookingRepository.update(data.bookingId,{status:BOOKED},transaction)
        await transaction.commit()
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

const cancelBooking=async(bookingId)=>{
    const transaction=await db.sequelize.transaction()
    try {
        const bookingDetails=await bookingRepository.get(bookingId,transaction)
        if(bookingDetails.status==CANCELLED){
            return true
        }
        console.log(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${bookingDetails.flightId}/seats`,{
            seats:bookingDetails.noOfSeats,
            dec:false
    })
        await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${bookingDetails.flightId}/seats`,{
            seats:bookingDetails.noOfSeats,
            dec:false
        })
        await bookingRepository.update(bookingId,{status:CANCELLED},transaction)
        console.log("ok1")

        transaction.commit()
    } catch (error) {
        transaction.rollback()
        return error
    }
}

const cancelOldBookings=async () => {
    try {
        const time=new Date(Date.now()-1000*300)
        const response=await bookingRepository.cancelBookings(time)
        return response
    } catch (error) {
        throw error
    }
}
module.exports={
    createBooking,
    makePayment,
    cancelOldBookings
}