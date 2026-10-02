import upload from "../middleware/profile.js";
import { registerUser } from "../controller/authcontoller.js";
import { Router } from "express";




const signUpRoute = Router();

signUpRoute.post('/signup',upload.single("profile_picture"), registerUser);

export {signUpRoute};