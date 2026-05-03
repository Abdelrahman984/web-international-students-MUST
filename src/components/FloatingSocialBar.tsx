import { MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useChat } from "../context/ChatContext";
import { ChatPopup } from "./ChatPopup";

export function FloatingSocialBar() {
  const { unreadCount } = useChat();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Show tooltip 1 second after page load
    const showTimer = setTimeout(() => setShowTooltip(true), 1000);
    // Hide tooltip after 6 seconds (visible for 5 seconds)
    const hideTimer = setTimeout(() => setShowTooltip(false), 6000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <>
      {/* Main Container: Fixed to the right, items-end keeps all circles aligned vertically */}
      <div className="fixed right-4 bottom-0 -translate-y-1/2 flex flex-col items-end gap-4 z-[999] pointer-events-auto">
        {/* Chat Section */}
        <div className="relative group flex items-center gap-3">
          {/* Tooltip to draw attention */}
          <div
            className={`hidden md:flex absolute right-full mr-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 whitespace-nowrap transition-all duration-500 pointer-events-none ${
              showTooltip
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0"
            }`}
          >
            <span className="text-sm font-semibold">
              Need help? Chat with us!
            </span>
            {/* Triangle pointer */}
            <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white dark:bg-slate-800 border-r border-t border-slate-200 dark:border-slate-700 rotate-45"></div>
          </div>

          {/* Attention animation wrapper */}
          <div className="relative">
            {/* Ping animation effect */}
            <div className="absolute inset-0 rounded-full bg-[#1f3769] opacity-30 animate-ping"></div>

            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="relative w-12 h-12 md:w-14 md:h-14 rounded-full border border-emerald-500/30 flex items-center justify-center bg-[#1f3769] text-white shadow-[0_0_20px_rgba(31,55,105,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:scale-110 hover:bg-[#1a305e] transition-all duration-300 ease-out"
              aria-label="Open chat"
            >
              <MessageCircle className="w-6 h-6 md:w-7 md:h-7 animate-[bounce_3s_infinite]" />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[1.2rem] h-[1.2rem] px-1 rounded-full bg-red-600 text-white text-[11px] leading-[1.2rem] font-bold text-center shadow-sm animate-pulse">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Chat Popup Modal */}
      <ChatPopup isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}
