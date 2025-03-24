import { useEffect, useState, useCallback } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Users } from "lucide-react";
function SideBar() {
  const { users, getUsers, selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const [filteredUsers, setFilteredUsers] = useState([]);
  const [onlineOnly, setOnlineOnly] = useState(false);

  // 使用 useCallback 确保 getUsers 的稳定性
  const fetchUsers = useCallback(async () => {
    try {
      await getUsers(); // 确保获取用户
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  }, [getUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // 依赖 fetchUsers

  useEffect(() => {
    setFilteredUsers(
      onlineOnly
        ? users.filter((user) => onlineUsers.includes(user._id))
        : users
    ); // 当 users 更新时重新设置
    console.log("Users updated:", users.length);
  }, [users, onlineUsers, onlineOnly]);

  return (
    <div className="flex flex-col ">
      <div className="px-5 py-4 space-x-4 space-y-2">
        <div className="flex">
          <Users className="size-6 text-primary" />
          <div className="text-xl font-bold px-4 text-primary">联系人</div>
        </div>
        <div className="flex items-center text-sm space-x-2 pl-1">
          <label className="cursor-pointer">
            <input
              type="checkbox"
              className="checkbox checkbox-success checkbox-xs"
              checked={onlineOnly}
              onChange={(e) => setOnlineOnly(e.target.checked)}
            />
          </label>
          <div className="text-primary">仅显示在线</div>
          <div className="text-xs text-base-content/80">
            {onlineUsers.length - 1 + " 人在线"}
          </div>
        </div>
      </div>
      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => {
          return (
            <div
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`flex justify-between items-center px-5 py-4 space-x-4 hover:bg-base-200/60 md:hover:bg-base-100/80 cursor-pointer ${
                selectedUser?._id == user._id ? "bg-base-100/80" : ""
              }`}
            >
              <div className="relative">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.username}
                  className=" w-16  rounded-full"
                />

                {onlineUsers.includes(user._id) && (
                  <span
                    className="absolute bottom-0 right-0 size-3 bg-green-500 
                rounded-full"
                  />
                )}
              </div>
              <div className="w-full overflow-hidden  whitespace-nowrap">
                <div className=" text-md overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-primary">
                  {user.fullName}
                </div>
                <div
                  className="
              text-sm text-base-content/80 overflow-hidden text-ellipsis whitespace-nowrap "
                >
                  {onlineUsers.includes(user._id) ? "在线" : "离线"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SideBar;
