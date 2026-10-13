import { saveMessage } from "../services/messagesService.js";

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




export {sendMessage};