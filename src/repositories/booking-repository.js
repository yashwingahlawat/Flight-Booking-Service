const {CrudRepository}=require('./crud-repository')
const {Booking}=require('../models')
const { Op } = require('sequelize')
const { ServerConfig } = require('../config')
const {BOOKING_STATUS}=require('../utils/common/enums')
const db = require('../models')
const { default: axios } = require('axios')

const {BOOKED,CANCELLED}=BOOKING_STATUS

class BookingRepositor extends CrudRepository{
    constructor(){
        super(Booking)
    }
    async createBooking(data,transaction){
        const response=await Booking.create(data,{transaction:transaction})
        return response
    }

    async get(data,transaction){
        const response=await Booking.findByPk(data,{transaction:transaction})
        if(!response)
            throw new AppError('Not able to find the resource',StatusCodes.NOT_FOUND)
        return response
    }

    async update(id,data,transaction){// data ->{col:val, ...}
        const response=await Booking.update(data,{
            where:{
                id:id
            }
        },{transaction:transaction})
        if(!response){
            throw new AppError('Not able to find the resource',StatusCodes.NOT_FOUND)
        }
        return response
    }

    async cancelBookings(timestamp){
        const transaction=await db.sequelize.transaction()
        try{
            const bookingsToCancel = await Booking.findAll({
                attributes: ['flightId', 'noOfSeats'],
                where: {
                    [Op.and]: [
                        { createdAt: { [Op.lt]: timestamp } },
                        { status: { [Op.ne]: BOOKED } },
                        { status: { [Op.ne]: CANCELLED } }
                    ]
                },
                transaction
            });
            await Booking.update({status:CANCELLED},{
                where:{
                    [Op.and]:[
                        {createdAt:{[Op.lt]:timestamp}},
                        {status:{[Op.ne]:BOOKED}},
                        { status: { [Op.ne]: CANCELLED } }
                    ]
                    
                }
                ,transaction
            })
            const seatCountPerFlight = {};
            bookingsToCancel.forEach(booking => {
                const flightId = booking.flightId;
                const seats = booking.noOfSeats;

                if (!seatCountPerFlight[flightId]) {
                    seatCountPerFlight[flightId] = 0;
                }
                seatCountPerFlight[flightId] += seats;
            });
            for (const [flightId, seats] of Object.entries(seatCountPerFlight)) {
                await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${flightId}/seats`, {
                    seats: seats,
                    dec: false
                });
            }
            await transaction.commit()
        }
        catch(error){
            await transaction.rollback()
            throw error
        }
        return 1
    }
}

module.exports=BookingRepositor