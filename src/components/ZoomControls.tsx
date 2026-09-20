import { useCanvasStore } from "../stores/canvasStore";

export default function ZoomControls() {
  const { zoom, setZoom } = useCanvasStore();
  const percentage = Math.round(zoom * 100);

  return (
    <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white rounded-lg shadow-md px-3 py-1.5 text-sm select-none">
      <button
        onClick={() => setZoom(zoom - 0.1)}
        className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
      >
        −
      </button>
      <span className="w-12 text-center text-gray-700">{percentage}%</span>
      <button
        onClick={() => setZoom(zoom + 0.1)}
        className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
      >
        +
      </button>
      <button
        onClick={() => setZoom(1)}
        className="ml-1 px-2 py-0.5 text-xs text-gray-500 hover:bg-gray-100 rounded"
      >
        Reset
      </button>
    </div>
  );
}
