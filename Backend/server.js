import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import cookieParser from 'cookie-parser';
dotenv.config()
import { authentication } from './routes/authroute.js';
import { messagesRoute } from './routes/messagesRoute.js';
import { getLoginPage } from './controller/authcontoller.js';



const PORT = process.env.PORT || 3000;

const app = express();

//global middleware
app.use(express.json());

const allowedOrigins = [
  "http://localhost:5500",
  "http://localhost:5501",
  "http://localhost:3000",
  "http://localhost:8080" // for local development
];
app.use(cors({
    origin: (origin, callback) => {

      // allow requests with no origin (Postman, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // only if you use cookies/sessions
  }))
app.use(cookieParser())


//serve folders to be accessed later
app.use(express.static('profiles'));
app.use(express.static('public'));
//routes
app.use('/auth', authentication);
app.use('/mail', messagesRoute);
app.get("/", getLoginPage);


app.listen(PORT, ()=>{
    console.log(`Mail server is running on port:${PORT}`);        
});