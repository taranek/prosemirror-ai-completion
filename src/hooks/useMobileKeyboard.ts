import { useEffect, useRef } from "react";

interface UseMobileKeyboardProps {
  editorRef: React.RefObject<HTMLElement>;
}

export function useMobileKeyboard({ editorRef }: UseMobileKeyboardProps) {
  const initialViewportHeight = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Store initial viewport height
    initialViewportHeight.current = window.visualViewport?.height || window.innerHeight;

    const handleViewportChange = () => {
      if (!editorRef.current) return;

      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const heightDifference = initialViewportHeight.current - currentHeight;
      
      // If height has decreased significantly (keyboard is likely visible)
      if (heightDifference > 150) {
        // Add a small delay to ensure the keyboard is fully visible
        setTimeout(() => {
          editorRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);
      }
    };

    // Listen for both visualViewport (modern browsers) and resize events (fallback)
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportChange);
    } else {
      window.addEventListener("resize", handleViewportChange);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleViewportChange);
      } else {
        window.removeEventListener("resize", handleViewportChange);
      }
    };
  }, [editorRef]);
}