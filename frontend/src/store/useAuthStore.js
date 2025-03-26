import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoginIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,

  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      //set 用于更新状态（state），相当于 Redux 里的 dispatch，但更简单直接。
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false }); // 检查结束
    }
  },
  signup: async (data) => {
    try {
      set({ isSigningUp: true });
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("注册成功");

      get().connectSocket();
    } catch (error) {
      console.log("Error in signup:", error);
      toast.error(error.response.data.message);
      set({ authUser: null });
    } finally {
      set({ isSigningUp: false });
    }
  },
  login: async (data) => {
    try {
      set({ isLoginIn: true });
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("登陆成功");

      get().connectSocket();
    } catch (error) {
      console.log("Error in login:", error);
      toast.error(error.response.data.message);
      set({ authUser: null });
    } finally {
      set({ isLoginIn: false });
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("更新成功");
    } catch (error) {
      console.log("Error in updating profile:", error);
      toast.error(error.message);
    } finally {
      set({ isUpdatingProfile: false });
      // toast.success("更新完毕");
    }
  },
  connectSocket: () => {
    const { authUser } = get();

    if (!authUser || get().socket?.connected) {
      return;
    }

    // io 是 socket.io 库提供的函数，用于创建一个 socket 实例，以连接到指定的服务器。
    // 配置对象中，query 属性用于在连接时向服务器传递查询参数。
    const socket = io(BASE_URL, { 
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();
    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: async () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
