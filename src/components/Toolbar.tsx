import { useCanvasStore } from "../stores/canvasStore";
import type { Tool } from "../types/canvas";

interface ToolDef {
  tool: Tool;
  label: string;
  shortcut: string;
  icon: React.ReactNode;
}

const tools: ToolDef[] = [
  {
    tool: "select",
    label: "Select",
    shortcut: "V",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M4 4l7 18 3-7 7-3z" />
      </svg>
    ),
  },
  {
    tool: "hand",
    label: "Hand",
    shortcut: "H",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M18 11V6a2 2 0 00-4 0v1M14 10V4a2 2 0 00-4 0v6M10 10V5a2 2 0 00-4 0v9l-1.8-2.7a2 2 0 00-3.4 2L6 21h12l2-9a2 2 0 00-2-2h-4z" />
      </svg>
    ),
  },
  {
    tool: "freehand",
    label: "Pen",
    shortcut: "P",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
      </svg>
    ),
  },
  {
    tool: "eraser",
    label: "Eraser",
    shortcut: "E",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M20 20H7L3 16l9.5-9.5a2.828 2.828 0 014 4L8 19" />
        <path d="M18 13l-1.5-1.5" />
      </svg>
    ),
  },
  {
    tool: "line",
    label: "Line",
    shortcut: "L",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
        <line x1="5" y1="19" x2="19" y2="5" />
      </svg>
    ),
  },
  {
    tool: "arrow",
    label: "Arrow",
    shortcut: "A",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
        <line x1="5" y1="19" x2="19" y2="5" />
        <polyline points="10,5 19,5 19,14" />
      </svg>
    ),
  },
  {
    tool: "rectangle",
    label: "Rectangle",
    shortcut: "R",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="4" y="4" width="16" height="16" rx="1" />
      </svg>
    ),
  },
  {
    tool: "ellipse",
    label: "Ellipse",
    shortcut: "O",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    tool: "diamond",
    label: "Diamond",
    shortcut: "D",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M12 3l9 9-9 9-9-9z" />
      </svg>
    ),
  },
  {
    tool: "text",
    label: "Text",
    shortcut: "T",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
        <polyline points="4,7 4,4 20,4 20,7" />
        <line x1="12" y1="4" x2="12" y2="20" />
        <line x1="8" y1="20" x2="16" y2="20" />
      </svg>
    ),
  },
];

export default function Toolbar() {
  const {
    tool, setTool,
    strokeColor, fillColor, strokeWidth, opacity, darkMode,
    setStrokeColor, setFillColor, setStrokeWidth, setOpacity,
    undo, redo, deleteElements, selectedIds,
  } = useCanvasStore();

  const bgColor = darkMode ? '#1a1a1a' : '#111111';
  const borderColor = darkMode ? '#444' : '#333';

  return (
    <div className="w-14 flex flex-col items-center py-3 gap-1 select-none" style={{ backgroundColor: bgColor, borderRight: `1px solid ${borderColor}` }}>
      <div className="flex flex-col gap-0.5">
        {tools.map(({ tool: t, label, shortcut, icon }) => (
          <button
            key={t}
            onClick={() => setTool(t)}
            title={`${label} (${shortcut})`}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-150 ${
              tool === t
                ? "bg-[#D4A843] text-[#111111]"
                : "text-[#9CA3AF] hover:bg-[#1a1a1a] hover:text-[#D4A843]"
            }`}
          >
            {icon}
          </button>
        ))}
      </div>

      <div className="w-8 h-px bg-[#D4A843]/30 my-2" />

      <div className="flex flex-col gap-3 items-center">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[9px] text-[#9CA3AF] uppercase tracking-wider">Stroke</span>
          <div className="relative">
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="w-8 h-8 rounded-full cursor-pointer border-2 border-[#D4A843] appearance-none bg-transparent"
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-[9px] text-[#9CA3AF] uppercase tracking-wider">Fill</span>
          <div className="relative">
            <input
              type="color"
              value={fillColor === "transparent" ? "#ffffff" : fillColor}
              onChange={(e) => setFillColor(e.target.value)}
              className="w-8 h-8 rounded-full cursor-pointer border-2 border-[#D4A843] appearance-none bg-transparent"
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-[9px] text-[#9CA3AF] uppercase tracking-wider">Size</span>
          <span className="text-[11px] text-white font-medium">{strokeWidth}px</span>
          <input
            type="range"
            min="1"
            max="20"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-8 accent-[#D4A843]"
            style={{ writingMode: "vertical-lr", direction: "rtl", height: "40px" }}
          />
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-[9px] text-[#9CA3AF] uppercase tracking-wider">Opac</span>
          <span className="text-[11px] text-white font-medium">{Math.round(opacity * 100)}%</span>
          <input
            type="range"
            min="10"
            max="100"
            value={opacity * 100}
            onChange={(e) => setOpacity(Number(e.target.value) / 100)}
            className="w-8 accent-[#D4A843]"
            style={{ writingMode: "vertical-lr", direction: "rtl", height: "40px" }}
          />
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex flex-col gap-1">
        <button
          onClick={undo}
          title="Undo (Ctrl+Z)"
          className="w-10 h-10 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:bg-[#1a1a1a] hover:text-[#D4A843] transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M3 10h10a5 5 0 015 5v2M3 10l5-5M3 10l5 5" />
          </svg>
        </button>
        <button
          onClick={redo}
          title="Redo (Ctrl+Shift+Z)"
          className="w-10 h-10 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:bg-[#1a1a1a] hover:text-[#D4A843] transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M21 10H11a5 5 0 00-5 5v2M21 10l-5-5M21 10l-5 5" />
          </svg>
        </button>
        {selectedIds.length > 0 && (
          <button
            onClick={() => deleteElements(selectedIds)}
            title="Delete (Del)"
            className="w-10 h-10 flex items-center justify-center rounded-lg text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="3,6 5,6 21,6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
