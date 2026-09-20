import { useState, useCallback } from "react";
import Toolbar from "./components/Toolbar";
import Canvas from "./components/Canvas";
import Header from "./components/Header";
import StatusBar from "./components/StatusBar";
import ZoomControls from "./components/ZoomControls";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useCanvasStore } from "./stores/canvasStore";

export default function App() {
  useKeyboardShortcuts();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const darkMode = useCanvasStore((s) => s.darkMode);

  const handleCanvasMouseMove = useCallback((x: number, y: number) => {
    setMousePos({ x, y });
  }, []);

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden ${darkMode ? "bg-[#1a1a1a]" : "bg-[#111111]"}`}>
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Toolbar />
        <div className="flex-1 relative overflow-hidden">
          <Canvas onMouseMove={handleCanvasMouseMove} />
          <ZoomControls />
        </div>
      </div>
      <StatusBar mouseX={mousePos.x} mouseY={mousePos.y} />
    </div>
  );
}
