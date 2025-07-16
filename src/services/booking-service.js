const axios=require('axios')
const {BookingRepositor}=require('../repositories')
const db=require('../models')
const { ServerConfig } = require('../config')
const { AppError } = require('../utils/errors/app-error')
const { StatusCodes } = require('http-status-codes')
const createBooking=async(data)=>{
    return new Promise((resolve,reject)=>{
        const result=db.sequelize.transaction(async function bookingImp(t) {
            const flight=await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`)
            const flightData=flight.data.data
            if(data.noOfSeats>flightData.totalSeats){
                console.log('ok')
                reject(new AppError('Enough Seats are not available',StatusCodes.INTERNAL_SERVER_ERROR))
            }
            resolve(true)
        })
    })
}

module.exports={
    createBooking
}