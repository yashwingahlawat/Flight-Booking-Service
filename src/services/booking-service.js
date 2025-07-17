const axios=require('axios')
const {BookingRepositor}=require('../repositories')
const db=require('../models')
const { ServerConfig } = require('../config')
const { AppError } = require('../utils/errors/app-error')
const { StatusCodes } = require('http-status-codes')

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

module.exports={
    createBooking
}