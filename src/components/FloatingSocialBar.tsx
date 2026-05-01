import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { useChat } from "../context/ChatContext";
import { ChatPopup } from "./ChatPopup";

export function FloatingSocialBar() {
  const { unreadCount } = useChat();
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {/* Main Container: Fixed to the right, items-end keeps all circles aligned vertically */}
      <div className="fixed right-4 bottom-0 -translate-y-1/2 flex flex-col items-end gap-4 z-[999] pointer-events-auto">
        {/* Chat Section */}
          <button
            type="button"
            onClick={() => setIsChatOpen(true)}
            className="relative w-10 h-10 md:w-12 md:h-12 rounded-full border border-gray-200 flex items-center justify-center bg-[#1f3769] text-white shadow-md hover:shadow-lg hover:scale-110 transition-all duration-300 ease-in-out"
            aria-label="Open chat"
          >
            <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-red-600 text-white text-[10px] leading-[1.1rem] font-bold text-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
      </div>

      {/* Chat Popup Modal */}
      <ChatPopup isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}
