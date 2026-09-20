import Toolbar from "./components/Toolbar";
import Canvas from "./components/Canvas";
import Header from "./components/Header";
import ZoomControls from "./components/ZoomControls";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

export default function App() {
  useKeyboardShortcuts();

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Toolbar />
        <div className="flex-1 relative overflow-hidden">
          <Canvas />
          <ZoomControls />
        </div>
      </div>
    </div>
  );
}
