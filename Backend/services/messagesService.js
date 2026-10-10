import pool from "../database/db.js";


const saveMessage = async (sentBy, sentTo, subject, body) => {
    
    try {
    //save message
    const save = await pool.query(`
    INSERT INTO messages (sent_by, sent_to, subject, body) 
    VALUES ($1, $2, $3, $4) RETURNING sent_by, sent_to, subject, body `, [sentBy, sentTo, subject, body]);

    return save.rows[0];
        
    } catch (error) {
        console.log(error);
        throw error
    }
};

export {saveMessage}