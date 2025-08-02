import { useRef, useEffect } from "react";
import type { CompletionEditor } from "@/components/ProseKitCompletionExample";
import { useEditorEvent } from "@/hooks/useEditorEvent";

interface UseDoubleSpaceConfirmationProps {
  editor: CompletionEditor;
  hasActiveCompletion: boolean;
  confirmCompletion: () => void;
  cancelCompletion: () => void;
}

function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  
  return window.matchMedia("(max-width: 768px)").matches ||
         /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function useDoubleSpaceConfirmation({
  editor,
  hasActiveCompletion,
  confirmCompletion,
  cancelCompletion,
}: UseDoubleSpaceConfirmationProps) {
  const lastSpaceTime = useRef<number>(0);
  const doubleSpaceTimeout = useRef<NodeJS.Timeout | null>(null);

  const insertSpace = () => {
    const state = editor.state;
    const tr = state.tr;
    tr.insertText(" ");
    editor.view.dispatch(tr);
  };

  const handleSpacePress = () => {
    const now = Date.now();
    const timeSinceLastSpace = now - lastSpaceTime.current;
    const doubleTapDetected = timeSinceLastSpace < 300 && hasActiveCompletion && isMobileDevice()
    
    if (doubleTapDetected) {
      confirmCompletion();
      
      if (doubleSpaceTimeout.current) {
        clearTimeout(doubleSpaceTimeout.current);
        doubleSpaceTimeout.current = null;
      }
      lastSpaceTime.current = 0;
      return; // Don't insert space on double tap
    }
    
    lastSpaceTime.current = now;

    if (doubleSpaceTimeout.current) {
      clearTimeout(doubleSpaceTimeout.current);
    }
    
    // Insert space immediately for single tap
    insertSpace();
    
    doubleSpaceTimeout.current = setTimeout(() => {
      if (hasActiveCompletion && isMobileDevice()) {
        cancelCompletion();
      }
    }, 300);
  };

  // Handle space key events within the hook
  useEditorEvent(editor, "keydown", (event: KeyboardEvent) => {
    if (event.key === " " && hasActiveCompletion && isMobileDevice()) {
      event.preventDefault();
      handleSpacePress();
    }
  });

  useEffect(function cleanupTimersOnUnmount() {
    return () => {
      if (doubleSpaceTimeout.current) {
        clearTimeout(doubleSpaceTimeout.current);
        doubleSpaceTimeout.current = null;
      }
    };
  }, []);
}
