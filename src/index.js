import dotenv from "dotenv"
dotenv.config({
    path: './.env'
})

import connectDB from "./db/connection.js"
import { server } from "./app.js" // Import server instead of app

connectDB()
    .then(() => {
        server.listen(process.env.PORT, () => { // Use server.listen instead of app.listen
            console.log(`Server with Socket.IO started at Port: ${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log("MongoDB Connection Failed", err)
    })