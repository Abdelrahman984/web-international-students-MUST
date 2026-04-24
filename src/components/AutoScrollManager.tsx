import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function AutoScrollManager() {
  const { pathname, hash, search } = useLocation();

  useEffect(() => {
    if (hash) {
      // Small delay to allow page render
      const timeoutId = window.setTimeout(() => {
        const id = hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          const y = element.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: Math.max(y, 0), behavior: "smooth" });
        }
      }, 150);
      return () => window.clearTimeout(timeoutId);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname, hash, search]);

  return null;
}
