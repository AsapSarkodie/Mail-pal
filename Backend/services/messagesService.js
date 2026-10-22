import pool from "../database/db.js";


const saveMessage = async (sentBy, sentTo, subject, body) => {
    
    try {
    //save message
    const save = await pool.query(`
    INSERT INTO messages (sent_by, sent_to, subject, body) 
    VALUES ($1, $2, $3, $4) RETURNING sent_by, sent_to, subject, body `, [sentBy, sentTo, subject, body]);

    return save.rows[0]
        
    } catch (error) {
        console.log(error);
        throw error
    }
};

const readInbox = async (sentTo) =>{
    try {
        const inbox = await pool.query(`
            SELECT subject, body, starred, is_read FROM messages 
            WHERE sent_to = $1`, [sentTo]);

    //check if message is empty
    if (inbox.rows.length === 0) {
        console.log('no message found');
        
        return 'no message found'
    } else {
        return inbox.rows
    }

    } catch (error) {
        console.log(error);
        throw error;
    };
};

const readSent = async (sentBy) => {
    try {
        const sent = await pool.query(`
            SELECT subject, body, starred, is_read FROM messages 
            WHERE sent_by = $1`, [sentBy]);

        if (sent.rows.length === 0) {
            return 'No messages found'
        } else {
            return sent.rows
        }
    } catch (error) {
         console.log(error);
        throw error
    }
}

export {saveMessage, readInbox, readSent};