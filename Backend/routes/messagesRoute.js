import { Router } from "express";
import { verifyCookie } from "../middleware/jwt.js ";
import path from "path"


const messagesRoute = Router();
const __dirname = import.meta.dirname;

//get text the login for now
messagesRoute.get('/', verifyCookie, async (req, res)=>{
    console.log('verify??');
    
   return  res.sendFile(path.join(__dirname, "..", "private", "index.html"))
    
});


export {messagesRoute}