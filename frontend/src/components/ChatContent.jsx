import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader.jsx";
import MessageInput from "./MessageInput.jsx";
import { useChatStore } from "../store/useChatStore.js";
import { useAuthStore } from "../store/useAuthStore.js";
import { formatMessageTime } from "../lib/utils";
import { ArrowDown } from "lucide-react";

function ChatContent() {
  const { authUser } = useAuthStore();
  const {
    selectedUser,
    messages,
    getMessages,
    unsubscribeMessages,
    subscribeMessages,
    loadHistoryMessages,
    hasMoreMessages,
  } = useChatStore();

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const chatContainerRef = useRef(null);
  const messageEndRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);

  // 初始加载消息和订阅新消息
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      setInitialLoadComplete(false); // 重置初始加载标志
    }
    subscribeMessages();
    return () => unsubscribeMessages();
  }, [selectedUser?._id, getMessages, subscribeMessages, unsubscribeMessages]);

  // 处理滚动到底部
  useEffect(() => {
    if (!messages) return;

    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    // 初始加载完成后滚动到底部
    if (!initialLoadComplete && messages.length > 0) {
      messageEndRef.current?.scrollIntoView();
      setInitialLoadComplete(true);
      return;
    }

    // 如果是新消息（消息数量增加），滚动到底部
    if (
      messages.length > prevMessagesLengthRef.current &&
      messages.length - prevMessagesLengthRef.current <= 2
    ) {
      // 新增1-2条消息时滚动到底部
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    prevMessagesLengthRef.current = messages.length;
  }, [messages, initialLoadComplete]);

  // 处理滚动加载更多消息
  const handleScroll = async (e) => {
    const { scrollTop } = e.target;
    // 当滚动到顶部附近时加载更多消息
    if (scrollTop < 50 && hasMoreMessages && !isLoadingMore) {
      setIsLoadingMore(true);

      // 记录当前滚动位置
      const scrollHeight = e.target.scrollHeight;
      await loadHistoryMessages();

      // 加载完成后恢复滚动位置
      setIsLoadingMore(false);

      // 保持滚动位置，避免跳转到顶部
      if (chatContainerRef.current) {
        const newScrollHeight = chatContainerRef.current.scrollHeight;
        const heightDifference = newScrollHeight - scrollHeight;
        chatContainerRef.current.scrollTop = heightDifference;
      }
    }
  };

  // 滚动到底部的按钮处理函数
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative w-full h-[86vh] flex flex-col p-5 flex-1 overflow-auto">
      <ChatHeader />
      <div
        className="flex-1 overflow-y-auto px-4 pt-25 pb-5 space-y-4"
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
        {/* 加载更多指示器 */}
        {isLoadingMore && (
          <div className="flex justify-center py-2">
            <span className="loading loading-spinner loading-sm"></span>
          </div>
        )}

        {/* 消息列表 */}
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId == authUser._id ? "chat-end" : "chat-start"
            }`}
          >
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="Avatar"
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

        {/* 用于滚动到底部的引用元素 */}
        <div ref={messageEndRef} />
      </div>

      {/* 滚动到底部按钮 */}
      <button
        onClick={scrollToBottom}
        className="btn btn-circle btn-sm absolute bottom-24 right-8 bg-base-300 shadow-md"
        title="滚动到底部"
      >
        <ArrowDown size={18} />
      </button>

      <MessageInput />
    </div>
  );
}

export default ChatContent;
