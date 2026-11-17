import { saveMessage, readInbox, readSent, saveReply, getRepliesByMessageId } from "../services/messagesService.js";

const sendMessage = async (req, res) => {
    
    //destructure request body
    const {sendTo, subject, body} = req.body;
    const sentBy = req.user.email;
    const file = req.file;
    const filePath = file?.path ?? null;

    try {
     
    //check if user has a token
    if (!sentBy) {
     console.log('no token from request');
     return res.json({message: "NOT_AUTHORIZED"})
    }

    if (!sendTo) {
        console.log('no receiver');
        return res.status(404).json({message: `RECEIVER_NOT_FOUND`});
    }
     
    if ( !subject) {
        console.log(`missing subject`);
        
        return res.status(404).json({message: `MISSING_SUBJECT`});
    }
    if (!body) {
        console.log('no body sent');
        return res.status(404).json({message: `MISSING_BODY`});
    }

    //check if user is sending message to himself bg
    if (sentBy === sendTo) {
        console.log(`cant send message to yourself`);
        return res.json({message: `CAN_NOT_SEND_MESSAGE_TO_YOURSELF`})
    };
    

    

    //save to database
    const save = await saveMessage(sentBy, sendTo, subject, body, filePath);

    console.log(save);
    if (save) {
        return res.status(201).json({
        message: `MESSAGE_SENT_SUCESSFULLY`
    })
    };
    console.log(`message sent..`);
    
    
    } catch (error) {
        console.log(error);
    };
};


//read message (inbox)
const readInboxMessage = async (req, res) => {
    try {
        //get user
        const user = req.user;
        
        //read inbox
        let inbox = await readInbox(user.email);
        //return messages
       return res.json({message: inbox})
        
    } catch (error) {
        console.log(error);
        throw error
    }
};

//read sent messages
const readSentMessages = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            console.log('not looged in');
        return res.status(401).json({message: `NOT_AUTHORIZED`})
        };
       
        //read sent 
        const sent = await readSent(user.email);
        
        //return messages
      return  res.json({message: sent});

        
    } catch (error) {
         console.log(error);
        throw error
    }
};

//save a reply
const saveAReply = async (req, res) => {

    //check if user is allowed to send a message
    const user = req.user;
     if (!user) {
        console.log('not looged in');
        return res.status(401).json({message: `NOT_AUTHORIZED`})
        };

    const {message_id, sent_to, body} = req.body;
    const file = req.file;
    const filePath = file?.path ?? null;

    if (user.email === sent_to) {
        return res.json("CAN'T_SEND_MESSAGE_TO_SELF")
    };
  try {
    
    const save = await saveReply(message_id, user.email, sent_to, body, filePath);

    if (save) {
        console.log('reply recieved');
        
    return res.json({message: `REPLY_SENT_SUCCESSFULLY`})
    };
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "SERVER_ERROR" })
    
  }
};

const loadReplies = async (req, res) => {
    const message_id = req.params.id;
    try {

        const readReplies = await getRepliesByMessageId(message_id);

       
            return res.json({message: readReplies})
 
    } catch (error) {
        console.log(error);
        res.status(500).json({message: `SERVER_PROBLEM`});
    };

    
};



export {sendMessage, readInboxMessage, readSentMessages, saveAReply, loadReplies};