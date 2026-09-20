import { create } from "zustand";
import type { Tool, CanvasElement } from "../types/canvas";

interface CanvasState {
  tool: Tool;
  elements: CanvasElement[];
  selectedIds: string[];
  zoom: number;
  panX: number;
  panY: number;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  opacity: number;

  setTool: (tool: Tool) => void;
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElements: (ids: string[]) => void;
  setSelectedIds: (ids: string[]) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  setStrokeColor: (color: string) => void;
  setFillColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setOpacity: (opacity: number) => void;
  undo: () => void;
  redo: () => void;
}

interface HistoryEntry {
  elements: CanvasElement[];
}

const history: HistoryEntry[] = [{ elements: [] }];
let historyIndex = 0;

export const useCanvasStore = create<CanvasState>((set, get) => ({
  tool: "freehand",
  elements: [],
  selectedIds: [],
  zoom: 1,
  panX: 0,
  panY: 0,
  strokeColor: "#000000",
  fillColor: "transparent",
  strokeWidth: 2,
  opacity: 1,

  setTool: (tool) => set({ tool }),

  addElement: (element) => {
    const elements = [...get().elements, element];
    historyIndex++;
    history.length = historyIndex;
    history.push({ elements });
    set({ elements });
  },

  updateElement: (id, updates) => {
    const elements = get().elements.map((el) =>
      el.id === id ? ({ ...el, ...updates } as CanvasElement) : el
    );
    set({ elements });
  },

  deleteElements: (ids) => {
    const elements = get().elements.filter((el) => !ids.includes(el.id));
    historyIndex++;
    history.length = historyIndex;
    history.push({ elements });
    set({ elements, selectedIds: [] });
  },

  setSelectedIds: (ids) => set({ selectedIds: ids }),

  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),

  setPan: (x, y) => set({ panX: x, panY: y }),

  setStrokeColor: (color) => set({ strokeColor: color }),

  setFillColor: (color) => set({ fillColor: color }),

  setStrokeWidth: (width) => set({ strokeWidth: width }),

  setOpacity: (opacity) => set({ opacity }),

  undo: () => {
    if (historyIndex > 0) {
      historyIndex--;
      set({ elements: history[historyIndex].elements, selectedIds: [] });
    }
  },

  redo: () => {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      set({ elements: history[historyIndex].elements, selectedIds: [] });
    }
  },
}));
