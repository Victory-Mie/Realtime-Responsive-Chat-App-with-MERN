import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,

  isUserLoading: false,
  isMessageLoading: false,

  // router.get("/user", protectRoute, getUserForSideBar);
  // router.get("/:id", protectRoute, getMessages);
  // router.post("/send/:id", protectRoute, sendMessages);

  getUsers: async () => {
    set({ isUserLoading: true });
    try {
      const res = await axiosInstance.get("/message/user");
      console.log("getUsers", res.data);
      set({ users: res.data });
    } catch (error) {
      toast.error(error.message);
    } finally {
      set({ isUserLoading: false });
    }
  },
  getMessages: async (userId) => {
    set({ isMessageLoading: true });
    try {
      console.log(userId);
      const res = await axiosInstance.get(`/message/${userId}`);
      console.log("getMessages", res.data);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.message);
    } finally {
      set({ isMessageLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/message/send/${selectedUser._id}`,
        messageData
      );
      console.log("sendMessage", res.data);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.message);
    }
  },
  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
