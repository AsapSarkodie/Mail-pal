import { Router } from "express";
import { verifyCookie } from "../middleware/jwt.js ";
import { sendMessage } from "../controller/messagesController.js";
import path from "path"


const messagesRoute = Router();
const __dirname = import.meta.dirname;

//get text the login for now
messagesRoute.get('/mainpage', verifyCookie, async (req, res)=>{
   return  res.sendFile(path.join(__dirname, "..", "private", "index.html"))

});

messagesRoute.post('/sendMessage', sendMessage);


export {messagesRoute}