import User from "../models/user.model.js";

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

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId }, //当前用户发给别人
        { senderId: userToChatId, receiverId: myId }, //别人发给当前用户
      ],
    });
  } catch (error) {
    console.log("Error in getMessages controller:", error.message);
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

    //todo: socket.io 实时传输函数
    res.status(200).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessages controller:", error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
};
