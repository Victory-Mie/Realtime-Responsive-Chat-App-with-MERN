import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketID, io } from "../lib/socket.js";

export const getUserForSideBar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // MongoDB 查询语句:筛选出 所有 ID 不等于 loggedInUserId 的用户。返回·除了password·的字段
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUserForSideBar controller:", error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params; // 从 URL 参数获取聊天对象的用户ID
    const myId = req.user._id; // 获取当前登录用户的 ID

    const { after } = req.query; // 获取时间戳参数和限制数量
    // 构建查询条件：获取指定时间戳之后的消息
    const query = {
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    };
    // 如果提供了时间戳，则只获取该时间戳之后的消息
    if (after) {
      query.createdAt = { $gt: new Date(parseInt(after)) };
    }
    const messages = await Message.find(query);

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller:", error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
};

// 新增：获取历史消息的API端点
export const getHistoryMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params; // 从 URL 参数获取聊天对象的用户ID
    const myId = req.user._id; // 获取当前登录用户的 ID
    const { before, limit = 20 } = req.query; // 获取时间戳参数和限制数量

    // 构建查询条件：获取指定时间戳之前的消息
    const query = {
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    };

    // 如果提供了时间戳，则只获取该时间戳之前的消息
    if (before) {
      query.createdAt = { $lt: new Date(parseInt(before)) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 }) // 按时间倒序排序
      .limit(parseInt(limit)) // 限制返回数量
      .sort({ createdAt: 1 }); // 再按时间正序排序，保证消息顺序正确

    console.log("getHistoryMessages", messages);
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getHistoryMessages controller:", error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
};

export const sendMessages = async (req, res) => {
  try {
    const { text, image } = req.body; // 从请求体中提取消息内容
    const { id: receiverId } = req.params; // 从 URL 获取接收者 ID
    const senderId = req.user._id; // 获取当前登录用户 ID

    let imgUrl = null;
    if (image) {
      // 上传 base64 图片至 cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imgUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imgUrl,
    });

    await newMessage.save(); // 存入数据库

    // socket.io 实时传输函数
    const receiverSocketId = getReceiverSocketID(receiverId);
    console.log("sendMessages_socket_test", receiverSocketId, newMessage);
    if (receiverSocketId) {
      console.log("sendMessages_socket_test", receiverSocketId, newMessage);
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(200).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessages controller:", error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
};
