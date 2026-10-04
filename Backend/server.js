import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import cookieParser from 'cookie-parser';
dotenv.config()
import path from 'path';
import { authentication } from './routes/authroute.js';



const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors())
app.use(cookieParser())
app.use(express.json())

const __dirname = import.meta.dirname;

//serve folders to be accessed later
app.use(express.static('public'))
app.use(express.static('profiles'));

//routes
app.get('/', (req, res)=>{
   res.sendFile(path.join(__dirname, 'public', 'index.html'))
});

app.use('/auth', authentication)

app.listen(PORT, ()=>{
    console.log(`Mail server is running on port:${PORT}`);   
        
});