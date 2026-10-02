import express from 'express';
import dotenv from 'dotenv';
dotenv.config()
import path from 'path';
import { signUpRoute } from './routes/authroute.js';



const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json())
const __dirname = import.meta.dirname;

app.use(express.static('public'))

//routes
app.get('/', (req, res)=>{
   res.sendFile(path.join(__dirname, 'public', 'index.html'))
});

app.use('/auth', signUpRoute)

app.listen(PORT, ()=>{
    console.log(`Mail server is running on port:${PORT}`);       
});