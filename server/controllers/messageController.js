import User from "../models/User.js"
import Message from "../models/Messages.js"
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

//get all user except logged in user

export const getUserForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne: userId}}).select("-password");

        // count number of messages not seen
        const unseenMessages = {}
        const promises = filteredUsers.map(async (user) => {
            const messages = await Message.find({senderId: user._id, receiverId: userId, seen: false})
            if (messages.length > 0) {
                unseenMessages[user._id] = messages.length;
            }
        })
        await Promise.all(promises);
        res.json({success: true, users: filteredUsers, unseenMessages})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message:error.message})
    }
}

//Get allmessages for selected users

export const getMessages = async (req, res) => {
    try {
        const {id: selectedUserId} = req.params;
        const myId = req.user._id;

        const messages =  await Message.find({
            $or: [
                {senderId: myId, receiverId: selectedUserId},
                {senderId: selectedUserId, receiverId: myId},
            ],
            deletedFor: {$ne: myId}
        })
        await Message.updateMany({senderId: selectedUserId, receiverId: myId}, {seen: true});

        res.json({success: true, messages})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message:error.message})
    }
}

//api to mark message as seen using message id
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, {seen: true})
        res.json({success: true})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message:error.message})
    }
}

//send message to selected user
export const sendMessage = async (req, res) => {
    try {
        const {text, image} = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        //Emit the new message to the reciever's socket
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }

        res.json({success: true, newMessage})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message:error.message})
    }
}

//delete message for me and everyone

export const deleteMessage = async (req, res) => {
  try {
    const { messageId, forEveryone } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    if (forEveryone) {
      // Only sender can delete for everyone
      if (message.senderId.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: "Unauthorized" });
      }

      message.isDeleted = true;
      message.text = "";
      message.image = "";
    } else {
      // Mark as deleted for current user
      if (!message.deletedFor.includes(userId)) {
        message.deletedFor.push(userId);
      }
    }

    await message.save();
    res.json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
