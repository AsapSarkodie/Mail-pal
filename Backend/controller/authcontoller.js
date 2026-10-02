
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

    const hashedPassword = bcrypt.hashSync(password, 9);
    
    
     //check if encrytion worked
     !hashedPassword ? console.log(`failed to encrypt password`) : console.log(`password encryption successful`);

    

      const inputUser =  saveUser(username, email, hashedPassword, profilePicture.path);

       if (inputUser) {
        return res.status(201).json({message: 'USER REGISTERED SUCCESSFULLY', saveUser})
       }  else {
        return res.json({
            message: `REGISTRATION_FAILED`
        })
       }
        
     

        
    } catch (error) {
        console.log(`error: ${error}`);
         
    }  
};

export {registerUser}