import express from "express"
import { getUserProfile, googleCallback, refreshAccessToken, userLogin, userLogout, userSignup} from "../Controllers/userController.js"
import { verifyJWT } from "../Middlewares/Auth.js"
import { upload } from "../Middlewares/multer.js"
import passport from 'passport';

const router = express.Router()

router.route("/signup").post(upload.single("profilePic"), userSignup)
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