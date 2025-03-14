import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import messageDB from "../lib/indexedDB";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  currentPage: 1,
  hasMoreMessages: true,
  messagesPerPage: 20,
  isLoadingHistory: false,

  isUserLoading: false,
  isMessageLoading: false,
  oldestTimestamp: 0,
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

  // 获取消息，优先从本地缓存获取，如果本地没有或需要更新则从服务器获取
  getMessages: async (userId) => {
    set({ isMessageLoading: true });
    const { currentPage, messagesPerPage } = get();
    const authUser = useAuthStore.getState().authUser;

    try {
      // 1. 先尝试从本地数据库获取消息
      const localMessages = await messageDB.getConversationMessages(
        authUser._id,
        userId,
        currentPage,
        messagesPerPage
      );

      // 2. 如果本地有缓存消息，先显示本地消息
      if (localMessages.length > 0) {
        console.log("从本地缓存获取消息", localMessages);
        set({ messages: localMessages });
        set({ isMessageLoading: false });

        // 3. 获取最新消息时间戳，用于增量更新
        const latestTimestamp = await messageDB.getLatestMessageTimestamp(
          authUser._id,
          userId
        );
        console.log("最新消息时间戳", latestTimestamp);
        // 更新oldestTimestamp时间戳
        // 获取当前最早消息的时间戳
        const oldestTime = await messageDB.getOldestMessageTimestamp(
          authUser._id,
          userId
        );
        set({ oldestTimestamp: oldestTime });
        // 4. 后台异步从服务器获取最新消息
        get().fetchAndUpdateMessages(userId, latestTimestamp);
      } else {
        console.log("没缓存");
        // 如果本地没有缓存，直接从服务器获取
        const loadMessages = await get().loadHistoryMessages(userId);
        set({ messages: loadMessages ? loadMessages : [] });
      }
    } catch (error) {
      console.error("获取消息失败:", error);
      toast.error("获取消息失败");
      set({ isMessageLoading: false });
    }
  },

  // // 加载更多历史消息（本地分页加载）
  // loadMoreMessages: async () => {
  //   const {
  //     selectedUser,
  //     currentPage,
  //     messagesPerPage,
  //     messages,
  //     hasMoreMessages,
  //     isLoadingHistory,
  //   } = get();
  //   if (!hasMoreMessages || !selectedUser || isLoadingHistory) return;

  //   const authUser = useAuthStore.getState().authUser;
  //   const nextPage = currentPage + 1;

  //   try {
  //     // 从本地数据库加载更多消息
  //     const olderMessages = await messageDB.getConversationMessages(
  //       authUser._id,
  //       selectedUser._id,
  //       nextPage,
  //       messagesPerPage
  //     );

  //     // 如果本地没有更多消息，尝试从服务器加载历史消息
  //     if (olderMessages.length === 0) {
  //       await get().loadHistoryMessages();
  //       return;
  //     }

  //     // 合并消息并更新状态
  //     set({
  //       messages: [...olderMessages, ...messages],
  //       currentPage: nextPage,
  //     });
  //   } catch (error) {
  //     console.error("加载更多消息失败:", error);
  //   }
  // },

  // 从服务器加载历史消息
  loadHistoryMessages: async () => {
    const { selectedUser, messages, isLoadingHistory } = get();
    if (!selectedUser || isLoadingHistory || messages.length === 0) return;

    set({ isLoadingHistory: true });
    const authUser = useAuthStore.getState().authUser;

    try {
      // 获取当前最早消息的时间戳
      const oldestTimestamp = await messageDB.getOldestMessageTimestamp(
        authUser._id,
        selectedUser._id
      );

      if (oldestTimestamp === 0) {
        set({ hasMoreMessages: false, isLoadingHistory: false });
        return;
      }

      // 从服务器获取更早的消息
      const res = await axiosInstance.get(
        `/message/history/${selectedUser._id}`,
        {
          params: {
            before: oldestTimestamp,
            limit: 20, // 每次获取20条历史消息
          },
        }
      );

      const historyMessages = res.data;
      console.log("从服务器获取历史消息", historyMessages);

      // 如果没有更多历史消息
      if (historyMessages.length === 0) {
        set({ hasMoreMessages: false, isLoadingHistory: false });
        return;
      }

      // 保存到本地数据库
      await messageDB.saveMessages(historyMessages);
      console.log("更新消息列表", [...historyMessages, ...messages]);
      // 更新状态，将历史消息添加到当前消息列表前面
      set({
        messages: [...historyMessages, ...messages],
        hasMoreMessages: historyMessages.length >= 20,
        isLoadingHistory: false,
        oldestTimestamp: historyMessages[historyMessages.length - 1].createdAt,
      });
    } catch (error) {
      console.error("加载历史消息失败:", error);
      set({ isLoadingHistory: false });
    }
  },

  // 从服务器获取消息并更新本地缓存
  fetchAndUpdateMessages: async (userId, sinceTimestamp = 0) => {
    const { messages } = get();
    try {
      // 从服务器获取消息
      const res = await axiosInstance.get(`/message/${userId}`, {
        params: {
          after: sinceTimestamp,
          // limit: 20, // 每次获取20条最新消息
        },
      });
      const serverMessages = res.data;
      console.log("从服务器获取消息", serverMessages);

      // 保存到本地数据库
      await messageDB.saveMessages(serverMessages);

      // 更新状态
      set({
        messages: [...messages, ...serverMessages],
        isMessageLoading: false,
        currentPage: 1,
        // hasMoreMessages: serverMessages.length >= get().messagesPerPage,
      });
    } catch (error) {
      console.error("从服务器获取消息失败:", error);
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

      // 保存新消息到本地数据库
      await messageDB.saveMessages(res.data);

      // 更新状态
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.message);
    }
  },

  subscribeMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageFromSelectedUser) return;

      // 保存新消息到本地数据库
      messageDB.saveMessages(newMessage);

      // 更新状态
      set({
        messages: [...get().messages, newMessage],
      });
      console.log("subscribe", newMessage);
    });
  },

  unsubscribeMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => {
    // 重置分页状态
    set({
      selectedUser,
      currentPage: 1,
      hasMoreMessages: true,
    });
  },

  // 重置消息状态
  resetMessages: () => {
    set({
      messages: [],
      currentPage: 1,
      hasMoreMessages: true,
    });
  },
}));
