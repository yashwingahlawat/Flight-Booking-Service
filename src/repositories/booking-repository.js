const {CrudRepository}=require('./crud-repository')
const {Booking}=require('../models')
class BookingRepositor extends CrudRepository{
    constructor(){
        super(Booking)
    }
}

module.exports=BookingRepositor