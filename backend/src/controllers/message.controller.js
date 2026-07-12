import Message from "../models/message.model.js";
import User from "../models/user.model.js";

import cloudinary from "../lib/cloudinary.js";


export const getUsersForSidebar = async (req,res)=>{
    try{
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id:{$ne:loggedInUserId}}).select("-password")
        res.status(200).json(filteredUsers)
    }
    catch(error){
        console.error("Error in getUsersForSidebar: ",error.message);
        res.status(500).json({error:"Internal server error"});
    }
};


export const getMessages = async (req,res) => {
    
    try{
        const {id:userToChatId}=req.params
        const myId = req.user._id;

        const messages = await Message.find({

            //$or is a MongoDB query operator.

            // It is used when you want to find documents that satisfy at least one of multiple conditions.

            // Think of it like the logical OR (||) operator in programming
            $or:[
                {senderId:myId,receiverId:userToChatId},
                {senderId:userToChatId,receiverId:myId}
            ]        
        })
        res.status(200).json(messages)
    }
    catch(error){
        console.log("Error in getMessages controller:",error.message);
        res.status(500).json({error:"Internal server error"});
    }
}


export const sendMessage = async (req,res) => {
    try{
        const {text,image} = req.body;
        const {id:receiverId} = req.params;
        // Take the id property from req.params and store it in a new variable called receiverId.

        const senderId = req.user._id;

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();
        // todo: realtime functionality goes here => which will be happening using socker.io

        res.status(201).json(newMessage);
    }
    catch(error){
        console.log("Error in sendMessage controller: ",error.message);
        console.log("Error in sendMessage controller: ",error.message);
        res.status(500).json({error:"Internal server error "});
    }
}