import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"
const app = express();
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true ,limit:"16kb"})) // url handle spaces as %20 or sometime + , to understand this we use this line
app.use(express.static("public")) // to store temporary data duch as file , img into public folder
app.use(cookieParser()); // perform CRUD operation in cookie 



import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js"

app.use('/api/v1/users', userRouter)
app.use('/api/v1/videos',videoRouter)

export {app}
