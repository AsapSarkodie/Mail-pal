import pool from "../database/db.js";


const saveMessage = async (sentBy, sentTo, subject, body, filePath) => {
    
    try {
    //save message
    const save = await pool.query(`
    INSERT INTO messages (sent_by, sent_to, subject, body, file_path) 
    VALUES ($1, $2, $3, $4, $5) RETURNING sent_by, sent_to, subject, body, file_path `, [sentBy, sentTo, subject, body, filePath]);

    return save.rows[0]
        
    } catch (error) {
        console.log(error);
        throw error
    }
}; 

const readInbox = async (sentTo) =>{
    try {
        const inbox = await pool.query(`
            SELECT  id, subject, body, starred, is_read, created_at, sent_by, sent_to, file_path FROM messages 
            WHERE sent_to = $1 ORDER BY created_at DESC`, [sentTo]);

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
            SELECT id, subject, body, starred, is_read, sent_by, file_path, created_at FROM messages 
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
};

const saveReply = async (message_id, sent_by, sent_to, body, file_path) => {
    try {
        const reply = await pool.query(`
            INSERT INTO replies (message_id, sent_by, sent_to, body, file_path) VALUES ($1, $2, $3, $4, $5)  RETURNING message_id, sent_by, sent_to, body, file_path`, 
            [message_id, sent_by, sent_to, body, file_path]);
 
     return reply.rows[0]

    } catch (error) {
        console.log(error);
        throw error
    }
};

const getRepliesByMessageId = async (messageId) => {
  const { rows } = await pool.query(
    `SELECT id, sent_by, sent_to, body, file_path, created_at
     FROM replies
     WHERE message_id = $1
     ORDER BY created_at ASC`,
    [messageId]
  );
  return rows;
};

const deleteMessageById = async (messageId) => {
    const {rows} = await pool.query(`
     DELETE FROM messages WHERE id = $1
    `, [messageId]);
    
    return rows;
};

export {saveMessage, readInbox,readSent,saveReply,getRepliesByMessageId,deleteMessageById};