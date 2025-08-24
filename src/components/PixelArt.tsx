import React, { useEffect, useMemo, useState, useRef } from "react";
import SaveDialog from "./SaveDialog";

// Grid size options
const GRID_SIZES = [8, 16, 24, 32] as const;
type GridSize = (typeof GRID_SIZES)[number];

// Default grid size
const DEFAULT_SIZE: GridSize = 16;
type Cell = { row: number; col: number };

// Color palettes
const PALETTES = {
  default: [
    "#000000", // black
    "#FF0000", // bright red
    "#FF6D00", // orange
    "#FFFF00", // yellow
    "#57AA21", // bright green
    "#00A9E4", // blue
    "#005BFF", // purple
    "#B700FF", // brown
    "#FFFFFF", // white
  ],
  pastel: [
    "#000000", // black
    "#3A224F", // dark purple
    "#73326A", // purple
    "#E3755F", // coral
    "#FFD7A3", // peach
    "#CFF291", // light green
    "#50AB76", // green
    "#2E5C6B", // teal
    "#1F2E52", // navy
    "#FFFFFF", // white
  ],
  nintendo: [
    "#000000", // black
    "#F10300", // bright red
    "#FF7E00", // orange
    "#FAFF04", // yellow
    "#7BE308", // green
    "#0673C9", // blue
    "#FAC18C", // peach
    "#984418", // brown
    "#FFFFFF", // white
  ],
  simpsons: [
    "#000000", // black
    "#5865CF", // blue
    "#DBF2D6", // green
    "#F7D824", // yellow
    "#C7AC60", // orange
    "#3B3B63", // purple
    "#9A3706", // brown
    "#FFFFFF", // white
  ],
  palette5: [
    "#000000", // black
    "#131E9A", // blue
    "#0B004D", // purple
    "#A05846", // brown
    "#FF0000", // red
    "#A1BAFF", // blue
    "#FFCB2F", // yellow
    "#008505", // green
    "#FFFFFF", // white
  ],
} as const;

type PaletteName = keyof typeof PALETTES;
const DEFAULT_PALETTE: PaletteName = "default";

interface PixelArtProps {
  onNavigateToGallery: () => void;
}

export const PixelArt: React.FC<PixelArtProps> = ({ onNavigateToGallery }) => {
  const [gridSize, setGridSize] = useState<GridSize>(DEFAULT_SIZE);
  const [currentPalette, setCurrentPalette] = useState<PaletteName>(DEFAULT_PALETTE);
  const [colorIndex, setColorIndex] = useState<number>(PALETTES[DEFAULT_PALETTE].length - 1); // Default to white (last color)
  const [grid, setGrid] = useState<number[][]>(() =>
    Array.from({ length: DEFAULT_SIZE }, () => Array.from({ length: DEFAULT_SIZE }, () => 0))
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<"add" | "remove" | null>(null);
  const [drawingMode, setDrawingMode] = useState<"normal" | "mirror">("normal");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
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

      // Calculate mirror position
      const mirrorRow = gridSize - 1 - row;
      const mirrorCol = gridSize - 1 - col;

      if (mode === "remove") {
        // Remove pixel (set to 0)
        next[row][col] = 0;
        // Mirror mode: also remove the opposite pixel
        if (drawingMode === "mirror") {
          next[mirrorRow][mirrorCol] = 0;
        }
      } else if (mode === "add") {
        // Add pixel with current color (add 1 to account for the shifted indices)
        next[row][col] = colorIndex + 1;
        // Mirror mode: also add the opposite pixel
        if (drawingMode === "mirror") {
          next[mirrorRow][mirrorCol] = colorIndex + 1;
        }
      } else {
        // This should never happen with the current logic, but keeping for safety
        if (currentValue === colorIndex + 1) {
          // Same color - clear to white
          next[row][col] = 0;
          // Mirror mode: also clear the opposite pixel
          if (drawingMode === "mirror") {
            next[mirrorRow][mirrorCol] = 0;
          }
        } else {
          // Different color - replace with selected color
          next[row][col] = colorIndex + 1;
          // Mirror mode: also replace the opposite pixel
          if (drawingMode === "mirror") {
            next[mirrorRow][mirrorCol] = colorIndex + 1;
          }
        }
      }
      return next;
    });
  };

  const handleClearAll = () => {
    setGrid(Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => 0)));
  };

  const handleSaveSuccess = () => {
    // Could add a success notification here
    console.log("Drawing saved successfully!");
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

    // Determine the appropriate mode for dragging
    if (currentValue === 0) {
      // Empty square - set to add mode for dragging
      setDragMode("add");
      setIsDragging(true);
      handlePaint(row, col, "add");
    } else if (currentValue === colorIndex + 1) {
      // Same color - set to remove mode for dragging
      setDragMode("remove");
      setIsDragging(true);
      handlePaint(row, col, "remove");
    } else {
      // Different color - set to add mode for dragging
      setDragMode("add");
      setIsDragging(true);
      handlePaint(row, col, "add");
    }
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
      <div className="bg-black bg-opacity-60 p-2 border-b border-gray-600">
        <div className="flex flex-col gap-2">
          {/* Top row: Grid selector, Palette controls, and Clear All */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-white text-sm">Grid:</span>
                <select
                  value={gridSize}
                  onChange={(e) => handleGridSizeChange(Number(e.target.value) as GridSize)}
                  className="px-2 py-1 text-xs bg-gray-700 text-gray-300 border border-gray-600 rounded hover:bg-gray-600 focus:outline-none focus:border-yellow-400"
                >
                  {GRID_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}×{size}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-1">
                <select
                  value={currentPalette}
                  onChange={(e) => setCurrentPalette(e.target.value as PaletteName)}
                  className="px-2 py-1 text-xs bg-gray-700 text-gray-300 border border-gray-600 rounded hover:bg-gray-600 focus:outline-none focus:border-yellow-400"
                >
                  {Object.keys(PALETTES).map((paletteName) => (
                    <option key={paletteName} value={paletteName}>
                      {paletteName === "default" ? "Rainbow" : paletteName.replace("palette", "P")}
                    </option>
                  ))}
                </select>
                {/* Palette navigation buttons */}
                <button
                  onClick={() => {
                    const paletteNames = Object.keys(PALETTES) as PaletteName[];
                    const currentIndex = paletteNames.indexOf(currentPalette);
                    const newIndex = currentIndex < paletteNames.length - 1 ? currentIndex + 1 : 0;
                    setCurrentPalette(paletteNames[newIndex]);
                  }}
                  className="px-2 py-1 text-xs bg-gray-700 text-gray-300 border border-gray-600 rounded hover:bg-gray-600"
                  title="Next Palette"
                >
                  →
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Gallery button */}
              <button
                onClick={onNavigateToGallery}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                title="Gallery"
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>

              {/* Save button */}
              <button
                onClick={() => setShowSaveDialog(true)}
                className="p-2 bg-green-600 hover:bg-green-700 text-white rounded"
                title="Save Drawing"
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
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
              </button>

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
          </div>
          {/* Bottom row: Color palette */}
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
                    grid[row][col] === 0 ? "#FFFFFF" : PALETTES[currentPalette][grid[row][col] - 1],
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Drawing mode selector */}
      <div className="relative mx-auto mt-2" style={{ maxWidth: "100vw" }}>
        <div className="mx-4">
          <div className="bg-gray-900 bg-opacity-30 rounded-lg p-2">
            <div className="flex items-center gap-2">
              <span className="text-white text-sm">Mode:</span>
              <button
                onClick={() => setDrawingMode("normal")}
                className={`px-1.5 py-0.5 text-xs rounded border ${
                  drawingMode === "normal"
                    ? "bg-yellow-600 text-white border-yellow-400"
                    : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => setDrawingMode("mirror")}
                className={`px-1.5 py-0.5 text-xs rounded border ${
                  drawingMode === "mirror"
                    ? "bg-yellow-600 text-white border-yellow-400"
                    : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                }`}
              >
                Mirror
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reference image area - natural flow, capped height to avoid overlap */}
      <div className="relative mx-auto mt-1" style={{ maxWidth: "100vw" }}>
        <div className="mx-4">
          <div className="bg-gray-900 bg-opacity-30 rounded-lg p-1">
            <div className="flex items-start gap-2">
              {/* Image display */}
              <div className="flex items-center justify-center overflow-hidden flex-1 min-h-0">
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
              <div className="flex flex-col gap-1 flex-shrink-0">
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

      {/* Save Dialog */}
      <SaveDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSaveSuccess}
        gridData={grid}
        gridSize={gridSize}
        paletteName={currentPalette}
      />
    </div>
  );
};
