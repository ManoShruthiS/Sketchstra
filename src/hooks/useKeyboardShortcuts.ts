import { useEffect, useCallback } from "react";
import { useCanvasStore } from "../stores/canvasStore";

export function useKeyboardShortcuts() {
  const { undo, redo, deleteElements, selectedIds, setTool } =
    useCanvasStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedIds.length > 0) {
          e.preventDefault();
          deleteElements(selectedIds);
        }
      }

      const toolMap: Record<string, string> = {
        v: "select",
        h: "hand",
        p: "freehand",
        l: "line",
        a: "arrow",
        r: "rectangle",
        o: "ellipse",
        d: "diamond",
        t: "text",
      };

      if (!e.ctrlKey && !e.metaKey && toolMap[e.key]) {
        setTool(toolMap[e.key] as Parameters<typeof setTool>[0]);
      }
    },
    [undo, redo, deleteElements, selectedIds, setTool]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
