import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader.jsx";
import MessageInput from "./MessageInput.jsx";
import { useChatStore } from "../store/useChatStore.js";
import { useAuthStore } from "../store/useAuthStore.js";
import { formatMessageTime } from "../lib/utils";
function ChatContent() {
  const { authUser } = useAuthStore();
  const {
    selectedUser,
    messages,
    getMessages,
    unsubscribeMessages,
    subscribeMessages,
  } = useChatStore();

  useEffect(() => {
    if (selectedUser._id) {
      getMessages(selectedUser._id);
    }
    subscribeMessages();
    return () => unsubscribeMessages();
  }, [selectedUser._id, getMessages, subscribeMessages, unsubscribeMessages]);

  const messageEndRef = useRef(null);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="relative w-full h-[86vh] flex flex-col p-5 flex-1 overflow-auto">
      <ChatHeader />
      <div className=" flex-1 overflow-y-auto px-4 pt-25 pb-5 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={` chat ${
              message.senderId == authUser._id ? "chat-end" : "chat-start "
            }`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                />
              </div>
            </div>
            <div className="chat-header">
              <time className="text-xs opacity-50">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div
              className={`chat-bubble ${
                message.senderId == authUser._id ? "" : "chat-bubble-info"
              }`}
            >
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
            <div className="chat-footer opacity-50">Delivered</div>
          </div>
        ))}
      </div>
      <MessageInput></MessageInput>
    </div>
  );
}

export default ChatContent;
