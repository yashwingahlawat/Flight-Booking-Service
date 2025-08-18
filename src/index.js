const express=require('express')


const { ServerConfig,Queue }=require('./config')
const {CRONS}=require('./crons')

const apiRoutes=require('./routes')

const app=express()

app.use(express.json())

app.use(express.urlencoded({extended:true}))

app.use('/api',apiRoutes)

app.listen(ServerConfig.PORT,async()=>{
    console.log(`Server running on ${ServerConfig.PORT}`)
    await Queue.connectQueue()
    CRONS()
})