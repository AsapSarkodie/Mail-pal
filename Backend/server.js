import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import cookieParser from 'cookie-parser';
dotenv.config()
import { authentication } from './routes/authroute.js';
import { messagesRoute } from './routes/messagesRoute.js';



const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json())
app.use(cors())
app.use(cookieParser())




//serve folders to be accessed later

app.use(express.static('profiles'));

//routes

app.use('/auth', authentication)
app.use('/', messagesRoute)

app.listen(PORT, ()=>{
    console.log(`Mail server is running on port:${PORT}`);
    console.log();          
});