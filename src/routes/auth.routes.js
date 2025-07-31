import express from "express";
import passport from "passport";
import { googleCallback } from "../controllers/user.controller.js";

const router = express.Router();

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

export default router;