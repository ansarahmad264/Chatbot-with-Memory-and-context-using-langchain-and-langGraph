import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import passport from "passport"
import http from "http"
import { Server } from "socket.io"

// Passport strategy config
import "./config/passport.js"

// Express app
const app = express()

// Create HTTP server and bind to app
const server = http.createServer(app)

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: ["http://13.201.93.112:3000"],
        methods: ["GET", "POST"],
        credentials: true
    }
})

// Middleware
app.use(cors({
    origin: "http://13.201.93.112:3000",
    credentials: true
    
}))
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())
app.use(passport.initialize())

// Socket.IO user tracking
const userSocketMap = {} // { userId: socketId }

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id)

    socket.on("addUser", (userId) => {
        userSocketMap[userId] = socket.id
        console.log("User registered:", userId, socket.id)
    })

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id)
        for (const [userId, socketId] of Object.entries(userSocketMap)) {
            if (socketId === socket.id) {
                delete userSocketMap[userId]
                break
            }
        }
    })
})

// Helper to get a socket ID for a given receiver/user
export const getRecieverSocketId = (recieverId) => {
    return userSocketMap[recieverId]
}

// Import routes
import userRouter from "./routes/user.routes.js"
import messageRouter from "./routes/message.routes.js"

// Declare routes
app.use("/api/v1/user", userRouter)
app.use("/api/v2/message", messageRouter)

// Export for external use (e.g., in server.js)
export { app, server, io }
