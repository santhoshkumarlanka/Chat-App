import { create } from 'zustand';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from './useAuthStore';

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  groups: [],
  selectedUser: null,
  selectedGroup: null,
  isUsersLoading: false,
  isGroupsLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/user");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load groups");
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  createGroup: async (groupData) => {
    try {
      const res = await axiosInstance.post("/groups", groupData);
      set({ groups: [res.data, ...get().groups] });
      toast.success("Group created successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
      throw error;
    }
  },

  getMessages: async (chatId, isGroup = false) => {
    set({ isMessagesLoading: true });
    try {
      const endpoint = isGroup ? `/messages/group/${chatId}` : `/messages/${chatId}`;
      const res = await axiosInstance.get(endpoint);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, selectedGroup, messages } = get();
    try {
      let res;
      if (selectedGroup) {
        res = await axiosInstance.post(`/messages/send/group/${selectedGroup._id}`, messageData);
      } else {
        res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      }
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, selectedGroup } = get();
    if (!selectedUser && !selectedGroup) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Listen for direct messages
    socket.on("newMessage", (newMessage) => {
      if (selectedUser) {
        const senderId = newMessage.senderId?._id || newMessage.senderId;
        const isMessageSentBySelectedUser = senderId === selectedUser._id;
        if (!isMessageSentBySelectedUser) return;

        set({
          messages: [...get().messages, newMessage],
        });
      }
    });

    // Listen for group messages
    socket.on("newGroupMessage", (newGroupMessage) => {
      if (selectedGroup) {
        const isMessageForSelectedGroup = newGroupMessage.groupId === selectedGroup._id;
        if (!isMessageForSelectedGroup) return;

        set({
          messages: [...get().messages, newGroupMessage],
        });
      }
    });

    // Listen for dynamically created groups the user is a member of
    socket.on("groupCreated", (newGroup) => {
      const currentGroups = get().groups;
      if (!currentGroups.some(g => g._id === newGroup._id)) {
        set({ groups: [newGroup, ...currentGroups] });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
    socket.off("newGroupMessage");
    socket.off("groupCreated");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser, selectedGroup: null }),
  setSelectedGroup: (selectedGroup) => set({ selectedGroup, selectedUser: null }),
}));