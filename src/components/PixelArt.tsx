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
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  type ReferenceImage = { name: string; url: string; description?: string };
  const DEFAULT_REFERENCE_IMAGES: ReferenceImage[] = [
    { name: "Mario", url: "/images/mario.png", description: "Classic Mario pixel art" },
    { name: "Sonic", url: "/images/sonic.png", description: "Sonic the Hedgehog pixel art" },
  ];
  const [referenceImages, setReferenceImages] =
    useState<ReferenceImage[]>(DEFAULT_REFERENCE_IMAGES);

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

  // Load local public manifest if available, else fall back to defaults
  useEffect(() => {
    fetch("/reference-images.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (
          Array.isArray(data) &&
          data.every((d) => typeof d?.name === "string" && typeof d?.url === "string")
        ) {
          setReferenceImages(data);
          setSelectedImageIndex(0);
        }
      })
      .catch(() => {});
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

      {/* Grid section - width-driven sizing, natural height */}
      <div className="relative mx-auto mt-2" style={{ maxWidth: "100vw" }}>
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

      {/* Reference image area - natural flow, capped height to avoid overlap */}
      <div className="relative mx-auto mt-1" style={{ maxWidth: "100vw" }}>
        <div className="mx-4">
          <div className="bg-gray-900 bg-opacity-30 rounded-lg p-2 flex flex-col">
            {/* Image selector */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-white text-sm">Reference Image</span>
              <div className="flex gap-1">
                {referenceImages.map((img, index) => (
                  <button
                    key={img.name}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`px-2 py-1 text-xs rounded border ${
                      index === selectedImageIndex
                        ? "bg-yellow-600 text-white border-yellow-400"
                        : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                    }`}
                    title={img.description || img.name}
                  >
                    {img.name}
                  </button>
                ))}
              </div>
            </div>
            {/* Image display */}
            <div
              className="flex items-center justify-center overflow-hidden"
              style={{ maxHeight: "40vh" }}
            >
              <img
                src={
                  referenceImages[
                    Math.min(selectedImageIndex, Math.max(0, referenceImages.length - 1))
                  ]?.url
                }
                alt="Reference"
                className="max-h-full max-w-full object-contain"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom controls padding */}
      <div className="h-24" />
    </div>
  );
};
