import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Plus, MessageSquare } from "lucide-react";

const Sidebar = () => {
  const {
    getUsers,
    getGroups,
    createGroup,
    users,
    groups,
    selectedUser,
    selectedGroup,
    setSelectedUser,
    setSelectedGroup,
    isUsersLoading,
    isGroupsLoading,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState("users"); // "users" or "groups"
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  
  // Create Group Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    getUsers();
    getGroups();
  }, [getUsers, getGroups]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  const toggleMember = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    try {
      const newGroup = await createGroup({
        name: groupName.trim(),
        description: groupDescription.trim(),
        members: selectedMembers,
      });
      setIsModalOpen(false);
      setGroupName("");
      setGroupDescription("");
      setSelectedMembers([]);
      setSelectedGroup(newGroup);
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  if (isUsersLoading || isGroupsLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200 bg-base-100">
      {/* Sidebar Header */}
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-6 text-primary" />
          <span className="font-semibold text-lg hidden lg:block">Chat Room</span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-base-300 w-full">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-all flex items-center justify-center gap-2 ${
            activeTab === "users"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-base-content/60 hover:text-base-content hover:bg-base-200/50"
          }`}
        >
          <Users className="size-4" />
          <span className="hidden lg:block">Direct</span>
        </button>
        <button
          onClick={() => setActiveTab("groups")}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-all flex items-center justify-center gap-2 ${
            activeTab === "groups"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-base-content/60 hover:text-base-content hover:bg-base-200/50"
          }`}
        >
          <Users className="size-4" />
          <span className="hidden lg:block">Groups</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto w-full">
        {activeTab === "users" ? (
          <>
            {/* Direct Messages Filters */}
            <div className="p-3 hidden lg:flex items-center gap-2 border-b border-base-300/50">
              <label className="cursor-pointer flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showOnlineOnly}
                  onChange={(e) => setShowOnlineOnly(e.target.checked)}
                  className="checkbox checkbox-sm checkbox-primary"
                />
                <span className="text-xs font-medium">Show online only</span>
              </label>
              <span className="text-[10px] text-zinc-500">({onlineUsers.length - 1} online)</span>
            </div>

            <div className="py-2">
              {filteredUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className={`
                    w-full p-3 flex items-center gap-3
                    hover:bg-base-300/50 transition-all duration-150
                    ${selectedUser?._id === user._id ? "bg-base-300/70 border-l-4 border-primary pl-2" : ""}
                  `}
                >
                  <div className="relative mx-auto lg:mx-0">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="size-12 object-cover rounded-full shadow-sm border border-base-300"
                    />
                    {onlineUsers.includes(user._id) && (
                      <span
                        className="absolute bottom-0 right-0 size-3 bg-green-500 
                        rounded-full ring-2 ring-zinc-950"
                      />
                    )}
                  </div>

                  <div className="hidden lg:block text-left min-w-0 flex-1">
                    <div className="font-medium truncate">{user.fullName}</div>
                    <div className="text-xs text-zinc-400">
                      {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                    </div>
                  </div>
                </button>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center text-zinc-500 py-6 text-sm">No users online</div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Create Group Button */}
            <div className="p-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full btn btn-primary btn-sm flex items-center justify-center gap-2 rounded-lg"
              >
                <Plus className="size-4" />
                <span className="hidden lg:block font-semibold">Create Group</span>
              </button>
            </div>

            <div className="py-1">
              {groups.map((group) => (
                <button
                  key={group._id}
                  onClick={() => setSelectedGroup(group)}
                  className={`
                    w-full p-3 flex items-center gap-3
                    hover:bg-base-300/50 transition-all duration-150
                    ${selectedGroup?._id === group._id ? "bg-base-300/70 border-l-4 border-primary pl-2" : ""}
                  `}
                >
                  <div className="relative mx-auto lg:mx-0">
                    <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20 shadow-inner">
                      {group.name.substring(0, 2).toUpperCase()}
                    </div>
                  </div>

                  <div className="hidden lg:block text-left min-w-0 flex-1">
                    <div className="font-medium truncate text-base-content">{group.name}</div>
                    <div className="text-xs text-zinc-400 truncate">
                      {group.members?.length || 0} members
                    </div>
                  </div>
                </button>
              ))}

              {groups.length === 0 && (
                <div className="text-center text-zinc-500 py-8 text-sm">No groups joined yet</div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Create Group Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-base-100 border border-base-300 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-base-300 flex items-center justify-between bg-base-200/50">
              <h3 className="text-lg font-bold text-base-content flex items-center gap-2">
                <Users className="size-5 text-primary" /> Create Group Chat
              </h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)} 
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>
            
            {/* Modal Form */}
            <form onSubmit={handleCreateGroup} className="p-5 flex-1 overflow-y-auto space-y-4">
              <div>
                <label className="label pb-1">
                  <span className="label-text font-semibold text-xs text-base-content/70">Group Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full rounded-lg"
                  placeholder="e.g. Code Collaborators"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              
              <div>
                <label className="label pb-1">
                  <span className="label-text font-semibold text-xs text-base-content/70">Description (Optional)</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full rounded-lg h-20"
                  placeholder="What is the purpose of this group?"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                />
              </div>
              
              <div>
                <label className="label pb-1">
                  <span className="label-text font-semibold text-xs text-base-content/70">Select Members</span>
                </label>
                <div className="border border-base-300 rounded-lg max-h-44 overflow-y-auto divide-y divide-base-300/50 bg-base-200/20">
                  {users.map((u) => (
                    <label 
                      key={u._id} 
                      className="flex items-center gap-3 p-2.5 cursor-pointer hover:bg-base-300/30 transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-sm rounded"
                        checked={selectedMembers.includes(u._id)}
                        onChange={() => toggleMember(u._id)}
                      />
                      <img 
                        src={u.profilePic || "/avatar.png"} 
                        alt={u.fullName} 
                        className="size-8 rounded-full object-cover border border-base-300 shadow-sm" 
                      />
                      <span className="text-sm font-medium text-base-content">{u.fullName}</span>
                    </label>
                  ))}
                  {users.length === 0 && (
                    <div className="p-4 text-center text-xs text-zinc-500">No contacts available to add</div>
                  )}
                </div>
              </div>
              
              {/* Actions Footer */}
              <div className="flex gap-3 justify-end pt-4 border-t border-base-300">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="btn btn-sm btn-ghost rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-sm btn-primary rounded-lg font-semibold" 
                  disabled={!groupName.trim()}
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;