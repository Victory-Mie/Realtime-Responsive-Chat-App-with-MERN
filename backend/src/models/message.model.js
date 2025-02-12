import mongoose from "mongoose";
const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId, // ObjectId 是一种特殊类型，通常用于唯一标识符。
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    // 考虑添加功能：只发文字时，text 必填，image 可选。只发图片时，image 必填，text 可选。
  },
  {
    timestamps: true,
  }
);
const Message = new mongoose.model("Message", messageSchema);
export default Message;
