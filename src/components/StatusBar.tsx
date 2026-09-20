import { useCanvasStore } from "../stores/canvasStore";

export default function StatusBar({ mouseX = 0, mouseY = 0 }: { mouseX?: number; mouseY?: number }) {
  const { selectedIds, zoom, darkMode } = useCanvasStore();
  const bgColor = darkMode ? '#1a1a1a' : '#111111';
  const borderColor = darkMode ? '#444' : '#333';

  return (
    <div className="h-8 flex items-center justify-between px-4 select-none" style={{ backgroundColor: bgColor, borderTop: `1px solid ${borderColor}` }}>
      <div className="flex items-center gap-4 text-xs">
        <span className="text-[#9CA3AF]">
          X: <span className="text-white">{Math.round(mouseX)}</span>
        </span>
        <span className="text-[#9CA3AF]">
          Y: <span className="text-white">{Math.round(mouseY)}</span>
        </span>
        {selectedIds.length > 0 && (
          <>
            <span style={{ color: borderColor }}>•</span>
            <span className="text-[#D4A843]">
              {selectedIds.length} object{selectedIds.length > 1 ? "s" : ""} selected
            </span>
          </>
        )}
      </div>
      <div className="flex items-center gap-4 text-xs">
        <span className="text-[#9CA3AF]">
          Canvas Zoom: <span className="text-[#D4A843]">{Math.round(zoom * 100)}%</span>
        </span>
        <span style={{ color: borderColor }}>•</span>
        <span className="text-[#9CA3AF] uppercase tracking-wider">Infinite Canvas</span>
      </div>
    </div>
  );
}
