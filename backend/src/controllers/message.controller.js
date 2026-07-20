import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { encrypt, decrypt } from "../lib/encryption.js";


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
        }).populate("senderId", "fullName profilePic");

        // Decrypt the messages before returning them to the client
        const decryptedMessages = messages.map(msg => {
            const msgObj = msg.toObject();
            if (msgObj.text) {
                msgObj.text = decrypt(msgObj.text);
            }
            return msgObj;
        });

        res.status(200).json(decryptedMessages);
    }
    catch(error){
        console.log("Error in getMessages controller:",error.message);
        res.status(500).json({error:"Internal server error"});
    }
}

// Fetch Group Messages
export const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const messages = await Message.find({ groupId })
            .populate("senderId", "fullName profilePic");

        // Decrypt the messages before returning them to the client
        const decryptedMessages = messages.map(msg => {
            const msgObj = msg.toObject();
            if (msgObj.text) {
                msgObj.text = decrypt(msgObj.text);
            }
            return msgObj;
        });

        res.status(200).json(decryptedMessages);
    } catch (error) {
        console.log("Error in getGroupMessages controller:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};


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

        const encryptedText = text ? encrypt(text) : text;

        const newMessage = new Message({
            senderId,
            receiverId,
            text: encryptedText,
            image: imageUrl,
        });

        await newMessage.save();

        const populatedMessage = await Message.findById(newMessage._id)
            .populate("senderId", "fullName profilePic");

        // Create a plain object and restore the original plaintext text for socket/client response
        const responseMessage = {
            ...populatedMessage.toObject(),
            text: text
        };

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", responseMessage);
        }

        res.status(201).json(responseMessage);
    }
    catch(error){
        console.log("Error in sendMessage controller: ",error.message);
        res.status(500).json({error:"Internal server error "});
    }
}

// Send Group Message
export const sendGroupMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { groupId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const encryptedText = text ? encrypt(text) : text;

        const newMessage = new Message({
            senderId,
            groupId,
            text: encryptedText,
            image: imageUrl,
        });

        await newMessage.save();

        const populatedMessage = await Message.findById(newMessage._id)
            .populate("senderId", "fullName profilePic");

        const responseMessage = {
            ...populatedMessage.toObject(),
            text: text
        };

        // Broadcast message to the group socket room
        io.to(groupId.toString()).emit("newGroupMessage", responseMessage);

        res.status(201).json(responseMessage);
    } catch (error) {
        console.log("Error in sendGroupMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};