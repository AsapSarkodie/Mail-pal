
import { saveUser, findUser } from "../services/authService.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

//logic for registering a user
const registerUser = async (req, res) => {
    //destructure incoming data
    const {username, email, password} = req.body;
    const profilePicture = req.file;
    
    //check if all neccesary inputs are available
    try {
        if (!username || !email || !password) {
           console.log(`missing fields`);
           return res.json({message: 'MISSING_FEILDS'});        
    };

    //encrypt the password.
    const hashedPassword = await bcrypt.hash(password, 9);

    //save user into database
    const inputUser = await saveUser(username, email, hashedPassword, profilePicture?.path ?? null);
    
    //check if storage was successful
    if (inputUser) {
        console.log(`user registered`);
        return res.status(201).json({message: 'USER_CREATED_SUCCESSFULLY'})
    }
        
    } catch (error) {
        console.log(`error: ${error}`);
        return res.status(500).json({ message: 'SERVER_ERROR' });
    }  
};

//Sign-in 
const signInUser = async (req, res) => {
    console.log(`form is working and is accessing the signin route`);
    
    //destructure request body
    const {email, password} = req.body;
    try {
        if (!email || !password) {
            console.log(`missing fields`);
          return res.json({message: `MISSING_FEILDS`})   
        }

    //look up user from the database
    const lookUpUser = await findUser(email)

    //check if user exists
    if (lookUpUser.rows.length === 0) {
        console.log(`user not found`);
      return res.status(404).json({message: `USER_NOT_FOUND`})
    }

    //get user
    const user = lookUpUser.rows[0];

    //check for password mismatch
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    //check for a mismatch
    if (!isMatch) {
        console.log(`invalid password`);
      return res.status(400).json({message: 'INVALID_CREDENTIALS'})
    }
    
    //sign a token
    const token = jwt.sign({id: user.id, username: user.username}, process.env.JWT_SECRET, {expiresIn: "1d"});

     res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
    });
   
    return res.status(302).redirect('/')
  
        
    } catch (error) {
        console.log(`error: ${error}`);
        return res.status(500).json({ message: 'SERVER_ERROR' });
    }
}

export {registerUser, signInUser}