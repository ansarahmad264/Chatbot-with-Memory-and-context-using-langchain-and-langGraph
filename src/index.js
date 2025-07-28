import dotenv from "dotenv"
dotenv.config({
    path: './.env'
})

import connectDB from "./db/connection.js"
import { app, server } from "./app.js" // Import server instead of app

app.get("/", (req, res) => {
    res.json({ success: true, data: {}, message: "Hosted and Server is running Successfully... .." })
})

connectDB()
    .then(() => {
        server.listen(process.env.PORT, '0.0.0.0', () => { // Use server.listen instead of app.listen
            console.log(`Server with Socket.IO started at Port: ${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log("MongoDB Connection Failed", err)
    })