import connectDB from "./db/index.js";
import express from "express";
import { app } from "./app.js";
import dotenv from "dotenv"
dotenv.config({
    path:'./env'
})

connectDB().then(()=>{
    app.on("error",(error)=>{
        console.log("error",error);
        throw error;
    })
    app.listen(process.env.PORT || 8000 , ()=>console.log(`Server running on ${process.env.PORT}`))
}).catch((error)=>console.log("MongoDB connection failed",error))

