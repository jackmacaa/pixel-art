import React, { useEffect, useMemo, useState, useRef } from "react";

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
  const [dragMode, setDragMode] = useState<"add" | "remove" | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const handlePaint = (row: number, col: number, forceMode?: "add" | "remove") => {
    setGrid((prev) => {
      const next = prev.map((r) => r.slice());
      const currentValue = next[row][col];
      const mode = forceMode || dragMode;

      if (mode === "remove" || (mode === null && currentValue !== 0)) {
        // Remove pixel (set to 0)
        next[row][col] = 0;
      } else {
        // Add pixel with current color
        next[row][col] = colorIndex;
      }
      return next;
    });
  };

  const handleClearAll = () => {
    setGrid(Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => 0)));
  };

  const getCellFromPoint = (clientX: number, clientY: number): Cell | null => {
    if (!gridRef.current) return null;

    const rect = gridRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Calculate cell size (assuming equal spacing)
    const cellSize = rect.width / SIZE;

    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    if (row >= 0 && row < SIZE && col >= 0 && col < SIZE) {
      return { row, col };
    }
    return null;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const cell = getCellFromPoint(touch.clientX, touch.clientY);

    if (cell) {
      const currentValue = grid[cell.row][cell.col];
      const mode = currentValue === 0 ? "add" : "remove";

      setDragMode(mode);
      setIsDragging(true);
      handlePaint(cell.row, cell.col, mode);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isDragging || !dragMode) return;

    const touch = e.touches[0];
    const cell = getCellFromPoint(touch.clientX, touch.clientY);

    if (cell) {
      handlePaint(cell.row, cell.col, dragMode);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setDragMode(null);
  };

  const handleMouseDown = (row: number, col: number) => {
    const currentValue = grid[row][col];
    const mode = currentValue === 0 ? "add" : "remove";

    setDragMode(mode);
    setIsDragging(true);
    handlePaint(row, col, mode);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isDragging && dragMode) {
      handlePaint(row, col, dragMode);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragMode(null);
  };

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
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
          <div
            ref={gridRef}
            className="grid grid-cols-13 gap-1 p-3 bg-gray-900 bg-opacity-30 rounded-lg select-none touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {cells.map(({ row, col }) => (
              <button
                key={`${row}-${col}`}
                onMouseDown={() => handleMouseDown(row, col)}
                onMouseEnter={() => handleMouseEnter(row, col)}
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
