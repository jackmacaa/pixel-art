import React, { useEffect } from "react";
import { PixelArt } from "./components/PixelArt";

function App() {
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

  return (
    <div className="min-h-screen poker-table-bg">
      <PixelArt />
    </div>
  );
}

export default App;
