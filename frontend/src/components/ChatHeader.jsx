import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  return (
    <div className="absolute top-0 left-0 w-full bg-base-200 z-1">
      <div className="flex h-25 py-4 px-5 items-center">
        <div className="chat-image avatar">
          <div className="w-15 rounded-full">
            <img src={`${selectedUser?.profilePic || "/avatar.png"}`}></img>
          </div>
        </div>
        <div className="h-full flex flex-col pl-4 py-2 justify-between">
          <div className="text-xl font-bold text-primary ">
            {selectedUser.fullName}
          </div>
          <div className="text-sm text-base-content/80">
            {onlineUsers.includes(selectedUser?._id) ? "在线" : "离线"}
          </div>
        </div>
        {/* Close button */}
        <button
          className="absolute right-5"
          onClick={() => setSelectedUser(null)}
        >
          <X className="text-primary" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
