import { useCanvasStore } from "../stores/canvasStore";

export default function ZoomControls() {
  const { zoom, setZoom, setPan, darkMode } = useCanvasStore();
  const percentage = Math.round(zoom * 100);
  const bgColor = darkMode ? '#2a2a2a' : '#111111';
  const borderColor = darkMode ? '#555' : '#333';

  return (
    <div className="absolute bottom-12 right-4 flex items-center gap-1 rounded-full px-3 py-1.5 text-sm select-none" style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
      <button
        onClick={() => setZoom(zoom - 0.1)}
        className="w-6 h-6 flex items-center justify-center text-white hover:text-[#D4A843] rounded-full transition-colors"
      >
        −
      </button>
      <span className="w-12 text-center text-white text-xs">{percentage}%</span>
      <button
        onClick={() => setZoom(zoom + 0.1)}
        className="w-6 h-6 flex items-center justify-center text-white hover:text-[#D4A843] rounded-full transition-colors"
      >
        +
      </button>
      <div className="w-px h-4 mx-1" style={{ backgroundColor: borderColor }} />
      <button
        onClick={() => { setZoom(1); setPan(0, 0); }}
        className="px-2 py-0.5 text-[11px] text-[#D4A843] hover:bg-white/10 rounded transition-colors font-medium uppercase tracking-wider"
      >
        Reset
      </button>
    </div>
  );
}
