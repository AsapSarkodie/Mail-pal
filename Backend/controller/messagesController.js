import { saveMessage, readInbox, readSent } from "../services/messagesService.js";

const sendMessage = async (req, res) => {
    
    //destructure request body
    const {sentBy, sentTo, subject, body} = req.body;
    
    try {

     //check if the neccessary data are sent
    if (!sentBy || !sentTo || !subject || !body) {
        console.log(`missing fields`);
        
        return res.status(404).json({message: `MISSING_FEILD`});}

    //check if user is sending message to himself bg
    if (sentBy == sentTo) {
        console.log(`cant send message to yourself`);
        return res.json({message: `CAN_NOT_SEND_MESSAGE_TO_YOURSELF`})
    }

    

    //save to database
    const save = await saveMessage(sentBy, sentTo, subject, body);

    console.log(save);
    console.log(`message sent..`);
    
    return res.status(201).json({
        message: `MESSAGE SENT SUCESSFULLY`
    })
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
        let inbox = await readInbox(user.id);
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
        }
       
        //read sent 
        const sent = await readSent(user.id);
        
        //return messages
      return  res.json({message: sent});

        
    } catch (error) {
         console.log(error);
        throw error
    }
};

export {sendMessage, readInboxMessage, readSentMessages};