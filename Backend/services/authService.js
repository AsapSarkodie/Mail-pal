
import pool from '../database/db.js';

async function saveUser(username, email, hashedPassword, profile) {
    try {

     //register user info into database.
      const register = await pool.query(`
        INSERT INTO users (username, email, password_hash, profile_picture) 
        VALUES ($1, $2, $3, $4) RETURNING id, username, email, profile_picture
        `, [username, email, hashedPassword, profile])

        
       return register.rows[0]
        
    } catch (error) {
        console.log(`error: ${error}`);
        throw error
    }
}

//findUser
async function findUser(email) {
    
    try {
        const lookupUser = await pool.query(`SELECT * FROM users WHERE email = $1`, [email])

        return lookupUser;
    } catch (error) {
        console.log(`error: ${error}`);
        throw error
    }

};

export {saveUser, findUser}