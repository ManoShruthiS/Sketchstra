import { useCanvasStore } from "../stores/canvasStore";
import type { Tool } from "../types/canvas";

const tools: { tool: Tool; label: string; shortcut: string }[] = [
  { tool: "select", label: "Select", shortcut: "V" },
  { tool: "hand", label: "Hand", shortcut: "H" },
  { tool: "freehand", label: "Pen", shortcut: "P" },
  { tool: "line", label: "Line", shortcut: "L" },
  { tool: "arrow", label: "Arrow", shortcut: "A" },
  { tool: "rectangle", label: "Rectangle", shortcut: "R" },
  { tool: "ellipse", label: "Ellipse", shortcut: "O" },
  { tool: "diamond", label: "Diamond", shortcut: "D" },
  { tool: "text", label: "Text", shortcut: "T" },
];

export default function Toolbar() {
  const { tool, setTool, strokeColor, fillColor, strokeWidth, opacity,
    setStrokeColor, setFillColor, setStrokeWidth, setOpacity,
    undo, redo, deleteElements, selectedIds } = useCanvasStore();

  return (
    <div className="flex flex-col items-center gap-1 py-3 px-2 bg-white border-r border-gray-200 h-full select-none">
      <div className="flex flex-col gap-1">
        {tools.map(({ tool: t, label, shortcut }) => (
          <button
            key={t}
            onClick={() => setTool(t)}
            title={`${label} (${shortcut})`}
            className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              tool === t
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {getToolIcon(t)}
          </button>
        ))}
      </div>

      <div className="border-t border-gray-200 w-8 my-2" />

      <div className="flex flex-col gap-2 items-center">
        <div className="flex flex-col items-center gap-1">
          <label className="text-[10px] text-gray-400">Stroke</label>
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            className="w-7 h-7 rounded cursor-pointer border-0"
          />
        </div>
        <div className="flex flex-col items-center gap-1">
          <label className="text-[10px] text-gray-400">Fill</label>
          <input
            type="color"
            value={fillColor === "transparent" ? "#ffffff" : fillColor}
            onChange={(e) => setFillColor(e.target.value)}
            className="w-7 h-7 rounded cursor-pointer border-0"
          />
        </div>
        <div className="flex flex-col items-center gap-1">
          <label className="text-[10px] text-gray-400">Size</label>
          <input
            type="range"
            min="1"
            max="20"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-8 accent-blue-500"
          />
        </div>
        <div className="flex flex-col items-center gap-1">
          <label className="text-[10px] text-gray-400">Opacity</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-8 accent-blue-500"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 w-8 my-2" />

      <div className="flex flex-col gap-1">
        <button
          onClick={undo}
          title="Undo (Ctrl+Z)"
          className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
        >
          ↶
        </button>
        <button
          onClick={redo}
          title="Redo (Ctrl+Shift+Z)"
          className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
        >
          ↷
        </button>
        {selectedIds.length > 0 && (
          <button
            onClick={() => deleteElements(selectedIds)}
            title="Delete (Del)"
            className="w-10 h-10 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
          >
            🗑
          </button>
        )}
      </div>
    </div>
  );
}

function getToolIcon(tool: Tool): string {
  const icons: Record<Tool, string> = {
    select: "↖",
    hand: "✋",
    freehand: "✎",
    line: "─",
    arrow: "→",
    rectangle: "□",
    ellipse: "○",
    diamond: "◇",
    text: "T",
  };
  return icons[tool];
}
