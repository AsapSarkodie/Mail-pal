import upload from "../middleware/profile.js";
import { registerUser, signInUser, getLoginPage, getSignUpPage, loadUserInfo } from "../controller/authcontoller.js";
import {accessIdFromCookie} from '../middleware/jwt.js'
import { Router } from "express";


const authentication = Router();

authentication.post('/signup',upload.single("profile_picture"), registerUser);
authentication.post('/signin', signInUser )
authentication.get('/signinpage', getLoginPage);
authentication.get('/signuppage', getSignUpPage);
authentication.get("/user-info", accessIdFromCookie ,loadUserInfo)

//authentication.post('/sign-in', middleware

export {authentication};