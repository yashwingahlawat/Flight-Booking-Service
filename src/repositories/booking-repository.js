const {CrudRepository}=require('./crud-repository')
const {Booking}=require('../models')
class BookingRepositor extends CrudRepository{
    constructor(){
        super(Booking)
    }
    async createBooking(data,transaction){
        const response=await Booking.create(data,transaction)
        return response
    }
}

module.exports=BookingRepositor