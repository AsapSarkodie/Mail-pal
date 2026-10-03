
import { saveUser } from "../services/authService.js";
import bcrypt from 'bcrypt'



//logic for registering a user
const registerUser = async (req, res) => {
    //destructure incoming data
    const {username, email, password} = req.body;
    const profilePicture = req.file;
    
    //check if they all exist
    try {
        if (!username || !email || !password) {
           console.log(`missing fields`);
           return res.json({message: 'MISSING_FEILDS'});        
    };

    const hashedPassword = await bcrypt.hash(password, 9);

    const inputUser = await saveUser(username, email, hashedPassword, profilePicture?.path ?? null);

     res.status(201).json({message: 'USER CREATED PINTAW', output: inputUser})
     console.log(`user registered`);
        

        
    } catch (error) {
        console.log(`error: ${error}`);
        return res.status(500).json({ message: 'SERVER_ERROR' });
    }  
};

export {registerUser}