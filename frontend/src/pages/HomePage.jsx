//HomePage.jsx

import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser, selectedGroup } = useChatStore();

  return (
    <div className="h-screen pt-16 bg-base-200">
      <div className="flex h-full w-full bg-base-100 shadow-sm overflow-hidden">
        <Sidebar />

        {!selectedUser && !selectedGroup ? <NoChatSelected /> : <ChatContainer />}
      </div>
    </div>
  );
};
export default HomePage;