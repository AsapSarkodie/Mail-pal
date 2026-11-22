import { Router } from "express";
import { verifyCookie, accessIdFromCookie } from "../middleware/jwt.js ";
import { sendMessage, readInboxMessage, readSentMessages, saveAReply, loadReplies, deleteMessage } from "../controller/messagesController.js";
import  upload from '../middleware/files.js'
import path from "path"


const messagesRoute = Router();
const __dirname = import.meta.dirname;

//get text the login for now
messagesRoute.get('/mainpage', verifyCookie, async (req, res)=>{
   return  res.sendFile(path.join(__dirname, "..", "private", "index.html"))

});

//post or send a message
messagesRoute.post('/sendMessage',accessIdFromCookie, upload.single('attachments'), sendMessage);

//read inbox message based on id.
messagesRoute.get("/readMessages", accessIdFromCookie, readInboxMessage );

//read sent messages 
messagesRoute.get("/readSent", accessIdFromCookie, readSentMessages);

//Send a reply
messagesRoute.post('/sendReply', accessIdFromCookie, upload.single('attachments'), saveAReply);

//read a reply
messagesRoute.get("/readReplies/:id",  loadReplies); 

//delete a message
messagesRoute.delete("/deleteMessage/:id", deleteMessage);

export {messagesRoute}