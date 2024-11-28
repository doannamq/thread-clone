import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import { getRecipentSocketId, io } from "../socket/socket.js";
import { v2 as cloudinary } from "cloudinary";

async function sendMessage(req, res) {
  try {
    const { recipientId, message, imgs } = req.body;
    // let { img } = req.body;
    const senderId = req.user._id;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, recipientId],
        lastMessage: {
          text: message,
          sender: senderId,
        },
      });

      await conversation.save();
    }

    // if (img) {
    //   const uploadedResponse = await cloudinary.uploader.upload(img);

    //   img = uploadedResponse.secure_url;
    // }
    //imgs is an array
    let uploadedImgUrls = [];
    if (imgs && imgs.length > 0) {
      const uploadPromises = imgs.map((img) => cloudinary.uploader.upload(img));
      const uploadResponses = await Promise.all(uploadPromises);
      uploadedImgUrls = uploadResponses.map((response) => response.secure_url);
    }

    const newMessage = new Message({
      conversationId: conversation._id,
      sender: senderId,
      text: message,
      // img: img || "",
      imgs: uploadedImgUrls,
    });

    await Promise.all([
      newMessage.save(),
      conversation.updateOne({
        lastMessage: {
          text: message,
          sender: senderId,
        },
      }),
    ]);

    const recipentSocketId = getRecipentSocketId(recipientId);
    if (recipentSocketId) {
      io.to(recipentSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getMessages(req, res) {
  const { otherUserId } = req.params;
  const userId = req.user._id;
  try {
    const conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
// async function getMessages(req, res) {
//   const { otherUserId } = req.params;
//   const userId = req.user._id;
//   const page = parseInt(req.query.page) || 1;
//   const limit = parseInt(req.query.limit) || 10;

//   try {
//     const conversation = await Conversation.findOne({
//       participants: { $all: [userId, otherUserId] },
//     });

//     if (!conversation) {
//       return res.status(404).json({ error: "Conversation not found" });
//     }

//     const totalMessages = await Message.countDocuments({
//       conversationId: conversation._id,
//     });

//     const messages = await Message.find({
//       conversationId: conversation._id,
//     })
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(limit);

//     res.status(200).json({
//       messages: messages.reverse(),
//       currentPage: page,
//       totalPages: Math.ceil(totalMessages / limit),
//       hasMore: page * limit < totalMessages,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// }

async function getConversations(req, res) {
  const userId = req.user._id;
  try {
    const conversations = await Conversation.find({
      participants: userId,
    }).populate({
      path: "participants",
      select: "username profilePic",
    });

    //remove the current user from participants array
    conversations.forEach((conversation) => {
      conversation.participants = conversation.participants.filter(
        (participant) => participant._id.toString() !== userId.toString()
      );
    });
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export { sendMessage, getMessages, getConversations };
