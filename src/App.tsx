import { useEffect, useState } from "react";
import { PixelArt } from "./components/PixelArt";
import Gallery from "./components/Gallery";

type AppView = "editor" | "gallery";

function App() {
  const [currentView, setCurrentView] = useState<AppView>("editor");

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
        return <Gallery onNavigateToEditor={() => setCurrentView("editor")} />;
      default:
        return <PixelArt onNavigateToGallery={() => setCurrentView("gallery")} />;
    }
  };

  return <div className="min-h-screen poker-table-bg">{renderView()}</div>;
}

export default App;
