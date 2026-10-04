import upload from "../middleware/profile.js";
import { registerUser } from "../controller/authcontoller.js";
import { Router } from "express";


const authentication = Router();

authentication.post('/signup',upload.single("profile_picture"), registerUser);
//authentication.post('/sign-in', middleware

export {authentication};