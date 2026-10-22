import { Router } from "express";
import { verifyCookie, accessIdFromCookie } from "../middleware/jwt.js ";
import { sendMessage, readInboxMessage, readSentMessages } from "../controller/messagesController.js";
import path from "path"


const messagesRoute = Router();
const __dirname = import.meta.dirname;

//get text the login for now
messagesRoute.get('/mainpage', verifyCookie, async (req, res)=>{
   return  res.sendFile(path.join(__dirname, "..", "private", "index.html"))

});

//post or send a message
messagesRoute.post('/sendMessage',accessIdFromCookie, sendMessage);


//read inbox message based on id.
messagesRoute.get("/readMessages", accessIdFromCookie, readInboxMessage );

//read sent messages 
messagesRoute.get("/readSent", accessIdFromCookie, readSentMessages);

export {messagesRoute}