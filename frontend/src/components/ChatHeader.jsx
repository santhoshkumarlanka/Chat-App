import { useState } from "react";
import { X, Users } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, selectedGroup, setSelectedUser, setSelectedGroup } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showMembersModal, setShowMembersModal] = useState(false);

  const handleClose = () => {
    if (selectedUser) setSelectedUser(null);
    if (selectedGroup) setSelectedGroup(null);
  };

  const name = selectedUser ? selectedUser.fullName : selectedGroup ? selectedGroup.name : "";
  const subtitle = selectedUser 
    ? (onlineUsers.includes(selectedUser._id) ? "Online" : "Offline")
    : selectedGroup 
      ? `Group Chat • ${selectedGroup.members?.length || 0} members`
      : "";

  const creatorId = selectedGroup?.creator?._id || selectedGroup?.creator;

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {selectedUser ? (
            <div className="avatar">
              <div className="size-10 rounded-full relative">
                <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
                {onlineUsers.includes(selectedUser._id) && (
                  <span className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full ring-1 ring-base-100" />
                )}
              </div>
            </div>
          ) : (
            <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">
              {name.substring(0, 2).toUpperCase()}
            </div>
          )}

          {/* Info */}
          <div>
            <h3 className="font-medium">{name}</h3>
            <p className="text-xs text-base-content/70">{subtitle}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center">
          {/* View Group Members Button */}
          {selectedGroup && (
            <button
              onClick={() => setShowMembersModal(true)}
              className="btn btn-sm btn-ghost btn-circle text-primary hover:bg-primary/10 mr-1"
              title="View Group Members"
            >
              <Users className="size-5" />
            </button>
          )}

          {/* Close button */}
          <button onClick={handleClose} className="btn btn-sm btn-circle btn-ghost">
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* Group Members Modal Overlay */}
      {showMembersModal && selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-base-100 border border-base-300 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[70vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-base-300 flex items-center justify-between bg-base-200/50">
              <h3 className="text-base font-bold text-base-content flex items-center gap-2">
                <Users className="size-5 text-primary" /> Group Members ({selectedGroup.members?.length || 0})
              </h3>
              <button 
                onClick={() => setShowMembersModal(false)} 
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>

            {/* Members List */}
            <div className="p-4 overflow-y-auto divide-y divide-base-300/50">
              {selectedGroup.members?.map((member) => (
                <div key={member._id} className="flex items-center gap-3 py-2.5">
                  <img 
                    src={member.profilePic || "/avatar.png"} 
                    alt={member.fullName} 
                    className="size-9 rounded-full object-cover border border-base-300 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate text-base-content flex items-center gap-1.5">
                      {member.fullName}
                      {creatorId === member._id ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold tracking-wide uppercase">
                          Admin
                        </span>
                      ) : null}
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate">{member.email || "Group Member"}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;