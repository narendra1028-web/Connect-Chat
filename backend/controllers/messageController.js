const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User");
const sendMessage = async (req, res)=>{
    try{
        const {receiver, content} = req.body;
        if(!receiver || !content || !content.trim()){
            return res.status(400).json({
                message:"Receiver and message content are required"
            });
        }
        //validate receiver ID
        if(!mongoose.Types.ObjectId.isValid(receiver)){
            return res.status(400).json({
                message:"Invalid receiver ID"
            });
        }
        //check whether receiver exists
        const receiverUser = await User.findById(receiver);
        if(!receiverUser){
            return res.status(404).json({
                message:"Receiver not found"
            });
        }
        //prevent sending a message to yourself
        if(receiver.toString()===req.userId.toString()){
            return res.status(400).json({
                message:"You cannot send a message to yourself"
            });
        }
        //create message
        const message = await Message.create({
            sender:req.userId,
            receiver,
            content:content.trim()
        });
        //get socket.io instance
        const io = req.app.get("io");
        //send message to receiver's personal room
        io.to(receiver.toString()).emit("new_message", message);
        res.status(201).json({
            message:"Message send successfully",
            data:message
        });
    }catch(error){
        console.error("Send message error:", error.message);
        res.status(500).json({
            message:"Server error"
        });
    }
};
const getConversation = async (req, res)=>{
    try{
        const {userId} = req.params;
        //validate userId
        if(!mongoose.Types.ObjectId.isValid(userId)){
            return res.status(400).json({
                message:"Invalid user ID"
            });
        }
        //chech whether the other user exixts
        const otherUser = await User.findById(userId);
        if(!otherUser){
            return res.status(404).json({
                message:"User not found"
            });
        }
        //find messages between the logged in user and other user
        const messages = await Message.find({
            $or:[
                {
                    sender:req.userId,
                    receiver:userId
                },
                {
                    sender:userId,
                    receiver:req.userId
                }
            ]
        }).sort({ createdAt:1 });
        res.status(200).json({
            message:"Conversation fetched successfully",
            count:messages.length,
            messages
        });
    }catch(error){
        console.error("Get conversation error:", error.message);
        res.status(500).json({
            message:"Server error"
        });
    }
};
const markMessageDelivered = async (messageId, receiverId) => {
    try {
        const message = await Message.findOneAndUpdate(
            {
                _id: messageId,
                receiver: receiverId,
                status: "sent"
            },
            {
                $set: {
                    status: "delivered",
                    deliveredAt: new Date()
                }
            },
            { new: true }
        );

        if (!message) return;

        // Notify the sender about delivery
        const io = require("../app").get("io");

        io.to(message.sender.toString()).emit("message_status_updated", {
            messageId: message._id.toString(),
            status: message.status,
            deliveredAt: message.deliveredAt
        });

    } catch (error) {
        console.error("Delivery status error:", error.message);
    }
};
const markMessagesRead = async (senderId, receiverId) => {
    try {
        const messages = await Message.find({
            sender: senderId,
            receiver: receiverId,
            status: { $ne: "read" }
        });

        if (messages.length === 0) return;

        await Message.updateMany(
            {
                sender: senderId,
                receiver: receiverId,
                status: { $ne: "read" }
            },
            {
                $set: {
                    status: "read",
                    readAt: new Date()
                }
            }
        );

        const io = require("../app").get("io");

        messages.forEach((message) => {
            io.to(senderId.toString()).emit("message_status_updated", {
                messageId: message._id.toString(),
                status: "read"
            });
        });

    } catch (error) {
        console.error("Read status error:", error.message);
    }
};
module.exports = { sendMessage, getConversation, markMessageDelivered, markMessagesRead };