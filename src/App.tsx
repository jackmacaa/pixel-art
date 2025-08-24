import { useEffect, useState } from "react";
import { PixelArt } from "./components/PixelArt";
import Gallery from "./components/Gallery";

type AppView = "editor" | "gallery";

interface DrawingData {
  grid_data: number[][];
  grid_size: number;
  palette_name: string;
}

function App() {
  const [currentView, setCurrentView] = useState<AppView>("editor");
  const [editingDrawing, setEditingDrawing] = useState<DrawingData | null>(null);

  // Set dynamic viewport height for mobile
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setVH();
    window.addEventListener("resize", setVH);
    return () => window.removeEventListener("resize", setVH);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case "gallery":
        return (
          <Gallery
            onNavigateToEditor={() => {
              setEditingDrawing(null); // Clear editing state when going back to editor
              setCurrentView("editor");
            }}
            onEditDrawing={(drawing) => {
              setEditingDrawing(drawing); // Set drawing to be edited
              setCurrentView("editor");
            }}
          />
        );
      default:
        return (
          <PixelArt
            onNavigateToGallery={() => setCurrentView("gallery")}
            initialDrawing={editingDrawing}
            onDrawingLoaded={() => setEditingDrawing(null)} // Clear editing state after loading
          />
        );
    }
  };

  return <div className="min-h-screen poker-table-bg">{renderView()}</div>;
}

export default App;
