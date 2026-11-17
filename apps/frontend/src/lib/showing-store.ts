import { useState, useEffect } from "react";

export function useShowingMode() {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setIsShowing((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    isShowing,
    toggle: () => setIsShowing((prev) => !prev),
    mask: (val: string, fallback = "••••••••••••") => (isShowing ? fallback : val),
  };
}
