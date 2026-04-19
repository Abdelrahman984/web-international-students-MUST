import { MessageCircle } from 'lucide-react';
import { useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

export function FloatingSocialBar() {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const { user } = useAuth();
  const { toggleChat, unreadCount } = useChat();

  // Social links to match Angular reference global-social-sidebar
  const socialLinks = [
    { icon: 'fab fa-linkedin-in', href: 'https://eg.linkedin.com/school/misr-university-for-science-and-technology/', label: 'LinkedIn', color: '#1f3769' },
    { icon: 'fab fa-facebook-f', href: 'https://www.facebook.com/groups/271864861322223', label: 'Facebook', color: '#1f3769' },
    { icon: 'fab fa-instagram', href: 'https://www.instagram.com/must_university/', label: 'Instagram', color: '#1f3769' },
    { icon: 'fab fa-twitter', href: 'https://twitter.com/must_university', label: 'X (Twitter)', color: '#1f3769' },
    { icon: 'fab fa-whatsapp', href: 'https://chat.whatsapp.com/BdekmLTYMbR9M9ibkl703w', label: 'WhatsApp', color: '#25D366' },
  ];

  return (
    /* Main Container: Fixed to the right, items-end keeps all circles aligned vertically */
    <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col items-end gap-4 z-[999] pointer-events-auto">
      
      {/* Social Icons */}
      {socialLinks.map(({ icon, href, label, color }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-gray-200 flex items-center justify-center 
                     bg-white shadow-md
                     hover:shadow-lg
                     hover:scale-110
                     transition-all duration-300 ease-in-out group"
          style={{ color: color }}
          aria-label={label}
        >
          <i className={`${icon} text-lg md:text-xl transition-transform duration-200 group-hover:scale-110`}></i>
        </a>
      ))}

      {/* Chat Section */}
      {user && (
        <div className="flex flex-row items-center space-x-2">
          {/* Label on the left of the button */}
          <div className="pointer-events-none">
            <p className="text-white px-3 py-1 bg-[#1f3769] rounded-xl font-bold text-sm whitespace-nowrap shadow-sm">
              Chat
            </p>
          </div>

          {/* Chat Button aligned with icons above */}
          <button
            ref={buttonRef}
            type="button"
            onClick={() => toggleChat(buttonRef.current)}
            className="relative w-10 h-10 md:w-12 md:h-12 rounded-full border border-gray-200 flex items-center justify-center bg-[#1f3769] text-white shadow-md hover:shadow-lg hover:scale-110 transition-all duration-300 ease-in-out"
            aria-label="Open chat"
          >
            <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-red-600 text-white text-[10px] leading-[1.1rem] font-bold text-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}