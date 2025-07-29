import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express();

app.use(cors({
    origin:(process.env.CORS_ORIGIN),
    credentials: true
}))

app.use(express.json({limit:"16kb"})) //how much json data is accepted from user
app.use(express.urlencoded({extended: true, limit: "16kb"})) //how much json data is accepted from user through url and encode url like space between words
app.use(express.static("public")) // public folder is used to store temporary if any things want to be stored
app.use(cookieParser()) // for cookies


//router initialization
import userRouter from "./routes/user.route.js"

//router declaration
app.use("/users", userRouter)




export default app;