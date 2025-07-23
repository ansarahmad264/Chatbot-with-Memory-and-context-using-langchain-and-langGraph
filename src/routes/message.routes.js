import express from "express"
import {getMessages, sendMessage } from "../controllers/message.controller.js"
import { verifyJWT } from "../middlewares/Auth.middleware.js"

const router = express.Router()

router.route("/send-message/:recieverId").post(verifyJWT, sendMessage)
router.route("/get-messages/:userToChatId").get(verifyJWT, getMessages)

export default router