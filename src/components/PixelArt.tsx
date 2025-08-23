import React, { useEffect, useMemo, useState, useRef } from "react";

// Grid size options
const GRID_SIZES = [8, 16, 32] as const;
type GridSize = (typeof GRID_SIZES)[number];

// Default grid size
const DEFAULT_SIZE: GridSize = 16;
type Cell = { row: number; col: number };

// Color palettes
const PALETTES = {
  default: [
    "#FFDCA3",
    "#ff4500", // orange
    "#ff0000", // red
    "#8a2be2", // purple
    "#0066ff", // blue
    "#00ff00", // green
    "#ffff00", // yellow
    "#ffffff", // white
  ],
  palette1: [
    "#3A224F", // dark purple
    "#73326A", // purple
    "#E3755F", // coral
    "#FFD7A3", // peach
    "#CFF291", // light green
    "#50AB76", // green
    "#2E5C6B", // teal
    "#1F2E52", // navy
  ],
  palette2: [
    "#C20000", // red
    "#9E0909", // dark red
    "#218D00", // green
    "#00518D", // blue
    "#EAD200", // yellow
    "#ECDB42", // light yellow
    "#E0994C", // orange
    "#B04500", // dark orange
  ],
  palette3: [
    "#FF000D", // bright red
    "#FF7E00", // orange
    "#FFF200", // yellow
    "#00FF48", // bright green
    "#0011FF", // blue
    "#9900FF", // purple
    "#542C1D", // brown
    "#B4B4B4", // gray
  ],
} as const;

type PaletteName = keyof typeof PALETTES;
const DEFAULT_PALETTE: PaletteName = "default";

export const PixelArt: React.FC = () => {
  const [gridSize, setGridSize] = useState<GridSize>(DEFAULT_SIZE);
  const [currentPalette, setCurrentPalette] = useState<PaletteName>(DEFAULT_PALETTE);
  const [colorIndex, setColorIndex] = useState<number>(7);
  const [grid, setGrid] = useState<number[][]>(() =>
    Array.from({ length: DEFAULT_SIZE }, () => Array.from({ length: DEFAULT_SIZE }, () => 0))
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
        // Add pixel with current color (add 1 to account for the shifted indices)
        next[row][col] = colorIndex + 1;
      }
      return next;
    });
  };

  const handleClearAll = () => {
    setGrid(Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => 0)));
  };

  const handleGridSizeChange = (newSize: GridSize) => {
    setGridSize(newSize);
    setGrid(Array.from({ length: newSize }, () => Array.from({ length: newSize }, () => 0)));
  };

  const getCellFromPoint = (clientX: number, clientY: number): Cell | null => {
    if (!gridRef.current) return null;

    const rect = gridRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Calculate cell size (assuming equal spacing)
    const cellSize = rect.width / gridSize;

    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
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
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) list.push({ row: r, col: c });
    }
    return list;
  }, [gridSize]);

  return (
    <div className="min-h-screen poker-table-bg">
      {/* Header */}
      <div className="bg-black bg-opacity-60 p-4 border-b border-gray-600">
        <div className="flex flex-col gap-2">
          {/* Top row: Grid size selector and Clear All */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-white text-sm">Grid:</span>
              {GRID_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => handleGridSizeChange(size)}
                  className={`px-2 py-1 text-xs rounded border ${
                    size === gridSize
                      ? "bg-yellow-600 text-white border-yellow-400"
                      : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                  }`}
                >
                  {size}×{size}
                </button>
              ))}
            </div>
            {/* Clear All button with trash icon */}
            <button
              onClick={handleClearAll}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded"
              title="Clear All"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
          {/* Bottom row: Color palette and Palette selector */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {PALETTES[currentPalette].map((hex, i) => (
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
            <div className="flex items-center gap-1">
              <select
                value={currentPalette}
                onChange={(e) => setCurrentPalette(e.target.value as PaletteName)}
                className="px-2 py-1 text-xs bg-gray-700 text-gray-300 border border-gray-600 rounded hover:bg-gray-600 focus:outline-none focus:border-yellow-400"
              >
                {Object.keys(PALETTES).map((paletteName) => (
                  <option key={paletteName} value={paletteName}>
                    {paletteName === "default" ? "Default" : paletteName.replace("palette", "P")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid section - width-driven sizing, natural height */}
      <div className="relative mx-auto mt-1" style={{ maxWidth: "100vw" }}>
        <div className="mx-1">
          <div
            ref={gridRef}
            className={`grid bg-gray-900 bg-opacity-30 select-none touch-none`}
            style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
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
                style={{
                  backgroundColor:
                    grid[row][col] === 0 ? "#000000" : PALETTES[currentPalette][grid[row][col] - 1],
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Reference image area - natural flow, capped height to avoid overlap */}
      <div className="relative mx-auto mt-1" style={{ maxWidth: "100vw" }}>
        <div className="mx-4">
          <div className="bg-gray-900 bg-opacity-30 rounded-lg p-1">
            <div className="flex items-start gap-2">
              {/* Image display */}
              <div
                className="flex items-center justify-center overflow-hidden flex-1"
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
              {/* Image selector */}
              <div className="flex flex-col gap-1">
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
          </div>
        </div>
      </div>

      {/* Bottom controls padding */}
      <div className="h-24" />
    </div>
  );
};
