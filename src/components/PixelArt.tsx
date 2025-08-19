import React, { useEffect, useMemo, useState } from "react";

// 13x13 grid for pixel art
const SIZE = 13;
type Cell = { row: number; col: number };

const PALETTE: string[] = [
  "#000000", // black
  "#ff4500", // orange
  "#ff0000", // red
  "#8a2be2", // purple
  "#0066ff", // blue
  "#00ff00", // green
  "#ffff00", // yellow
  "#ffffff", // white
];

export const PixelArt: React.FC = () => {
  const [colorIndex, setColorIndex] = useState<number>(2);
  const [grid, setGrid] = useState<number[][]>(() =>
    Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => 0))
  );
  const [isDragging, setIsDragging] = useState(false);

  const handlePaint = (row: number, col: number) => {
    setGrid((prev) => {
      const next = prev.map((r) => r.slice());
      // If clicking on a painted tile, clear it (set to 0)
      if (next[row][col] !== 0) {
        next[row][col] = 0;
      } else {
        next[row][col] = colorIndex;
      }
      return next;
    });
  };

  const handleClearAll = () => {
    setGrid(Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => 0)));
  };

  useEffect(() => {
    const up = () => setIsDragging(false);
    document.addEventListener("mouseup", up);
    return () => document.removeEventListener("mouseup", up);
  }, []);

  const cells: Cell[] = useMemo(() => {
    const list: Cell[] = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) list.push({ row: r, col: c });
    }
    return list;
  }, []);

  return (
    <div className="min-h-screen poker-table-bg">
      {/* Header */}
      <div className="bg-black bg-opacity-60 p-4 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">Pixel Art</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearAll}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
            >
              Clear All
            </button>
            <div className="flex gap-1">
              {PALETTE.map((hex, i) => (
                <button
                  key={hex + i}
                  onClick={() => setColorIndex(i)}
                  className={`w-6 h-6 rounded border ${
                    i === colorIndex ? "ring-2 ring-yellow-400" : ""
                  }`}
                  style={{ backgroundColor: hex, borderColor: "#555" }}
                  title={`Color ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid - mobile-friendly container height */}
      <div className="relative mx-auto mt-4 mobile-vh-60" style={{ maxWidth: "100vw" }}>
        <div className="mx-4">
          <div className="grid grid-cols-13 gap-1 p-3 bg-gray-900 bg-opacity-30 rounded-lg select-none touch-none">
            {cells.map(({ row, col }) => (
              <button
                key={`${row}-${col}`}
                onPointerDown={(e) => {
                  setIsDragging(true);
                  handlePaint(row, col);
                  e.preventDefault();
                }}
                onPointerEnter={() => {
                  if (isDragging) handlePaint(row, col);
                }}
                onPointerUp={() => setIsDragging(false)}
                className="aspect-square border border-gray-700"
                style={{ backgroundColor: PALETTE[grid[row][col]] }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom controls padding */}
      <div className="h-24" />
    </div>
  );
};
