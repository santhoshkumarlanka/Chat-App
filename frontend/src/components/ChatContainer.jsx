import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    selectedGroup,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  const activeChatId = selectedUser?._id || selectedGroup?._id;
  const isGroup = !!selectedGroup;

  useEffect(() => {
    if (activeChatId) {
      getMessages(activeChatId, isGroup);
      subscribeToMessages();
    }

    return () => unsubscribeFromMessages();
  }, [activeChatId, isGroup, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const senderIdVal = message.senderId?._id || message.senderId;
          const isMyMessage = senderIdVal === authUser._id;

          return (
            <div
              key={message._id}
              className={`chat ${isMyMessage ? "chat-end" : "chat-start"}`}
              ref={messageEndRef}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border border-base-300 overflow-hidden shadow-sm">
                  <img
                    src={
                      isMyMessage
                        ? authUser.profilePic || "/avatar.png"
                        : (message.senderId?.profilePic || selectedUser?.profilePic || "/avatar.png")
                    }
                    alt="profile pic"
                    className="size-full object-cover"
                  />
                </div>
              </div>
              
              <div className="chat-header mb-0.5 flex flex-col">
                {isGroup && !isMyMessage && (
                  <span className="text-[10px] font-semibold text-primary/80 mb-0.5 ml-1">
                    {message.senderId?.fullName || "Group Member"}
                  </span>
                )}
                <time className="text-[10px] opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>

              <div className="chat-bubble flex flex-col shadow-sm">
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2 object-cover"
                  />
                )}
                {message.text && <p className="text-sm leading-relaxed">{message.text}</p>}
              </div>
            </div>
          );
        })}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;