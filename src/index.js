import app from "./app.js"
import connectDB from "./db/server.js"
import dotenv from "dotenv"
dotenv.config({
    path: './env'
})


connectDB()
.then(() => {
    app.on("error", (error) => {
        console.log("Error : ",error);
        throw error
    })
    app.listen(process.env.PORT, () => {
        console.log(`Server is running at port : ${process.env.PORT}`);
        
    })
})
.catch((err) => {
    console.log("MongoDB connection failed in index.js",err);
})