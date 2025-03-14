// import React from "react";
import { MessageSquare } from "lucide-react";
function NoChatSelected() {
  return (
    <div className="w-full flex flex-1 items-center justify-center h-full  p-16">
      <div className="max-w-md text-center space-y-6">
        {/* Icon Display */}
        <div className="flex justify-center gap-4 mb-4 ">
          <div
            className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center
             justify-center animate-bounce z-0"
          >
            <MessageSquare className="w-8 h-8 text-primary " />
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-2xl font-bold">欢迎来到拉条chat!</h2>
        <p className="text-base-content/60">从左侧选择一个联系人开始聊天吧！</p>
      </div>
    </div>
  );
}

export default NoChatSelected;
