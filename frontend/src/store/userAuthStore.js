import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoginIn: false,
  isUpdatingProfile: false,

  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("auth/check");

      //set 用于更新状态（state），相当于 Redux 里的 dispatch，但更简单直接。
      set({ authUser: res.data });
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
      const res = await axiosInstance.post("auth/signup", data);
      set({ authUser: res.data });
      toast.success("注册成功");
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
      const res = await axiosInstance.post("auth/login", data);
      set({ authUser: res.data });
      toast.success("登陆成功");
    } catch (error) {
      console.log("Error in login:", error);
      toast.error(error.response.data.message);
      set({ authUser: null });
    } finally {
      set({ isLoginIn: false });
    }
  },
}));
