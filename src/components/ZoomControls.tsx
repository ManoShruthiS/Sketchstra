import { useCanvasStore } from "../stores/canvasStore";

export default function ZoomControls() {
  const { zoom, setZoom, setPan } = useCanvasStore();
  const percentage = Math.round(zoom * 100);

  return (
    <div className="absolute bottom-12 right-4 flex items-center gap-1 bg-[#111111] rounded-full px-3 py-1.5 text-sm select-none border border-[#333]">
      <button
        onClick={() => setZoom(zoom - 0.1)}
        className="w-6 h-6 flex items-center justify-center text-white hover:text-[#D4A843] rounded-full hover:bg-[#1a1a1a] transition-colors"
      >
        −
      </button>
      <span className="w-12 text-center text-white text-xs">{percentage}%</span>
      <button
        onClick={() => setZoom(zoom + 0.1)}
        className="w-6 h-6 flex items-center justify-center text-white hover:text-[#D4A843] rounded-full hover:bg-[#1a1a1a] transition-colors"
      >
        +
      </button>
      <div className="w-px h-4 bg-[#333] mx-1" />
      <button
        onClick={() => { setZoom(1); setPan(0, 0); }}
        className="px-2 py-0.5 text-[11px] text-[#D4A843] hover:bg-[#1a1a1a] rounded transition-colors font-medium uppercase tracking-wider"
      >
        Reset
      </button>
    </div>
  );
}
