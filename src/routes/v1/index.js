const express=require('express')
const bookingRoutes=require('./booking-routes')
const infoRoutes=require('./info-routes')

const router=express.Router()

router.use('/booking',bookingRoutes)
router.use('/info',infoRoutes)



module.exports=router