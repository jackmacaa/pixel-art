import React, { useState } from "react";
import { supabase } from "../lib/supabase";

interface SaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  gridData: number[][];
  gridSize: number;
  paletteName: string;
}

const SaveDialog: React.FC<SaveDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  gridData,
  gridSize,
  paletteName,
}) => {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const { error } = await supabase.from("drawings").insert({
        title: title.trim(),
        grid_data: gridData,
        grid_size: gridSize,
        palette_name: paletteName,
        is_permanent: false,
      });

      if (error) throw error;

      setTitle("");
      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save drawing");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-white mb-4">Save Drawing</h2>

        <div className="mb-4">
          <label className="block text-gray-300 text-sm mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter drawing title..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
            maxLength={50}
          />
        </div>

        {/* Preview */}
        <div className="mb-4">
          <label className="block text-gray-300 text-sm mb-2">Preview</label>
          <div className="grid gap-0.5 bg-gray-700 p-2 rounded">
            {gridData.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-0.5">
                {row.map((cell, colIndex) => (
                  <div
                    key={colIndex}
                    className={`w-2 h-2 ${cell ? "bg-yellow-500" : "bg-gray-800"}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Drawing Info */}
        <div className="mb-4 text-gray-400 text-sm">
          <div>
            Grid: {gridSize}×{gridSize}
          </div>
          <div>Palette: {paletteName}</div>
        </div>

        {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveDialog;
