import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
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
}));
