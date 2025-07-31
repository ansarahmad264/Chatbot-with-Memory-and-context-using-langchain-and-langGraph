import express from "express"
import { getUserProfile, refreshAccessToken, userLogin, userLogout, userSignup} from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/Auth.middleware.js"

const router = express.Router()

router.route("/signup").post(userSignup)
router.route("/login").post(userLogin)

//Secured Routes
router.route("/logout").post(verifyJWT, userLogout)
router.route("/refresh-token").post(refreshAccessToken)
router.route('/user-profile').get(verifyJWT ,getUserProfile)

export default router