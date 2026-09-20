export default function Header() {
  return (
    <header className="h-12 flex items-center justify-between px-4 bg-white border-b border-gray-200 select-none">
      <h1 className="text-lg font-semibold text-gray-800">Sketchstra</h1>
      <div className="flex items-center gap-3">
        <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
          Menu
        </button>
      </div>
    </header>
  );
}
