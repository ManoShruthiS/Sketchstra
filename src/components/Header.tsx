import { useState } from "react";
import { useCanvasStore } from "../stores/canvasStore";

type Tab = "studio" | "layers" | "preferences";

export default function Header() {
  const { zoom, setZoom, darkMode, toggleDarkMode } = useCanvasStore();
  const [activeTab, setActiveTab] = useState<Tab>("studio");
  const [canvasName, setCanvasName] = useState("Untitled Architectural Canvas");
  const [isEditingName, setIsEditingName] = useState(false);

  const tabs: { id: Tab; label: string }[] = [
    { id: "studio", label: "Studio" },
    { id: "layers", label: "Layers" },
    { id: "preferences", label: "Preferences" },
  ];

  return (
    <header className="h-12 bg-[#111111] flex items-center justify-between px-4 select-none border-b-2 border-[#D4A843]">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#D4A843] rounded flex items-center justify-center">
            <span className="text-[#111111] text-xs font-bold">S</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-white text-sm font-semibold">Sketchstra</span>
            <span className="text-[#9CA3AF] text-[9px]">by Mahistra</span>
          </div>
        </div>

        <nav className="flex items-center gap-1 ml-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                activeTab === tab.id
                  ? "bg-[#D4A843] text-[#111111] font-medium"
                  : "text-[#9CA3AF] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {isEditingName ? (
          <input
            autoFocus
            value={canvasName}
            onChange={(e) => setCanvasName(e.target.value)}
            onBlur={() => setIsEditingName(false)}
            onKeyDown={(e) => e.key === "Enter" && setIsEditingName(false)}
            className="bg-[#1a1a1a] text-white text-sm px-3 py-1 rounded border border-[#D4A843] outline-none"
          />
        ) : (
          <button
            onClick={() => setIsEditingName(true)}
            className="flex items-center gap-2 text-white text-sm hover:bg-[#1a1a1a] px-3 py-1 rounded"
          >
            {canvasName}
            <svg className="w-3 h-3 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setZoom(zoom - 0.1)}
          className="w-7 h-7 rounded flex items-center justify-center text-white hover:bg-[#1a1a1a] transition-colors"
        >
          −
        </button>
        <span className="text-white text-sm min-w-[3rem] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(zoom + 0.1)}
          className="w-7 h-7 rounded flex items-center justify-center text-white hover:bg-[#1a1a1a] transition-colors"
        >
          +
        </button>

        <div className="w-px h-5 bg-[#333] mx-2" />

        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white hover:bg-[#1a1a1a] rounded transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>

        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#D4A843] text-[#111111] font-medium rounded hover:bg-[#C9A84C] transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Export
        </button>

        <div className="w-px h-5 bg-[#333] mx-1" />

        <button
          onClick={toggleDarkMode}
          className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white hover:bg-[#252525] transition-colors"
        >
          {darkMode ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        <button className="w-8 h-8 rounded-full bg-[#D4A843] flex items-center justify-center text-[#111111] hover:bg-[#C9A84C] transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
