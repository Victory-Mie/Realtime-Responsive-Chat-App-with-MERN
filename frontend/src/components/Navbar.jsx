import { Link } from "react-router-dom";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  return (
    <div className="navbar fixed top-0 z-40 bg-base-100/80 backdrop-blur-md">
      <div className="flex-1 ">
        <div className="btn btn-ghost text-xl">
          <Link
            to="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition-all"
          >
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <h1 className="hidden sm:inline">拉条Chat</h1>
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link
          to={"/settings"}
          className="btn btn-ghost btn-m gap-2 transition-colors"
        >
          <Settings className="w-5 h-5 " />
          <span className="hidden sm:inline">设置</span>
        </Link>

        {authUser && (
          <>
            <Link
              to={"/profile"}
              className="btn btn-ghost btn-m gap-2 transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">个人中心</span>
            </Link>

            <button
              className="btn btn-ghost btn-m gap-2 transition-colors"
              onClick={logout}
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">退出登录</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
