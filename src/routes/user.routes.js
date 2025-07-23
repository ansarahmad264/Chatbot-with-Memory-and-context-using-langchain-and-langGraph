import express from "express"
import { getUserProfile, googleCallback, refreshAccessToken, userLogin, userLogout, userSignup} from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/Auth.middleware.js"
import passport from 'passport';

const router = express.Router()

router.route("/signup").post(userSignup)
router.route("/login").post(userLogin)

//google Routes
router.get( '/google', passport.authenticate('google', 
    {
      scope: ['profile', 'email'],
      session: false,
    })
);

router.get('/google/callback', passport.authenticate('google', 
    {
      failureRedirect: '/login',
      session: false,
    }),
    googleCallback
);

//Secured Routes
router.route("/logout").post(verifyJWT, userLogout)
router.route("/refresh-token").post(refreshAccessToken)
router.route('/user-profile').get(verifyJWT ,getUserProfile)

export default router