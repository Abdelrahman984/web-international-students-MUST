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
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 150);
      return () => window.clearTimeout(timeoutId);
    }
  }, [pathname, hash, search]);

  return null;
}
