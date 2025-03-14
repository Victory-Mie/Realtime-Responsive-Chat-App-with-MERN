import { useState } from "react";
import { Menu, X } from "lucide-react";
import ChatContent from "../components/ChatContent";
import NoChatSelected from "../components/NoChatSelected";
import SideBar from "../components/SideBar";
import { useChatStore } from "../store/useChatStore";

const HomePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedUser } = useChatStore();

  return (
    <div className="min-h-screen md:px-16 pt-16 pb-5 flex flex-col">
      <div className="flex flex-1  bg-base-200 shadow-lg md:mx-10">
        <div className="relative md:w-[30%]">
          {/* Sidebar */}
          <div
            className={`z-10 fixed top-16 left-0 md:static h-full bg-base-100/80 md:bg-base-200 py-4 transition-transform duration-200 
    ${
      isOpen
        ? "w-[60%] translate-x-0 shadow-lg md:w-full"
        : "-translate-x-full md:translate-x-0 md:w-full"
    }`}
          >
            <button
              className="md:hidden absolute top-4 right-4"
              onClick={() => setIsOpen(!isOpen)}
            >
              <X size={24} />
            </button>
            <SideBar />
          </div>

          {/* Toggle Button */}
          {!isOpen && (
            <button
              className="fixed top-20 left-4 z-50 text-white  p-2 rounded-full md:hidden bg-primary"
              onClick={() => setIsOpen(true)}
            >
              <Menu size={24} />
            </button>
          )}
        </div>
        <div className="flex flex-1">
          {selectedUser ? <ChatContent /> : <NoChatSelected />}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
