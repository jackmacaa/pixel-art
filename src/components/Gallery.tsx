import React, { useEffect, useState } from "react";
import { supabase, type Drawing } from "../lib/supabase";

interface GalleryProps {
  onNavigateToEditor: () => void;
  onEditDrawing: (drawing: {
    grid_data: number[][];
    grid_size: number;
    palette_name: string;
  }) => void;
}

const Gallery: React.FC<GalleryProps> = ({ onNavigateToEditor, onEditDrawing }) => {
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingDrawingId, setDeletingDrawingId] = useState<string | null>(null);

  useEffect(() => {
    loadDrawings();
  }, []);

  const loadDrawings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("drawings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDrawings(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load drawings");
    } finally {
      setLoading(false);
    }
  };

  const deleteDrawing = async (id: string) => {
    try {
      const { error } = await supabase.from("drawings").delete().eq("id", id);

      if (error) throw error;
      await loadDrawings(); // Reload the list
      setDeletingDrawingId(null); // Close confirmation dialog
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete drawing");
      setDeletingDrawingId(null); // Close confirmation dialog on error
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading drawings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateToEditor}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
            >
              ← Back to Editor
            </button>
            <h1 className="text-3xl font-bold text-white">Pixel Art Gallery</h1>
          </div>
          <div className="text-gray-400 text-sm">
            {drawings.length} drawing{drawings.length !== 1 ? "s" : ""}
          </div>
        </div>

        {drawings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-xl mb-4">No drawings yet</div>
            <div className="text-gray-500">Create your first pixel art masterpiece!</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {drawings.map((drawing) => (
              <div
                key={drawing.id}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-yellow-500 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-white truncate">{drawing.title}</h3>
                  {drawing.is_permanent && (
                    <span className="text-yellow-400 text-xs bg-yellow-900 px-2 py-1 rounded">
                      Permanent
                    </span>
                  )}
                </div>

                {/* Drawing Preview */}
                <div className="grid gap-0.5 bg-gray-700 p-2 rounded mb-3">
                  {drawing.grid_data.map((row, rowIndex) => (
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

                {/* Drawing Info */}
                <div className="text-gray-400 text-sm mb-3">
                  <div>
                    Grid: {drawing.grid_size}×{drawing.grid_size}
                  </div>
                  <div>Palette: {drawing.palette_name}</div>
                  <div>Created: {formatDate(drawing.created_at)}</div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      onEditDrawing({
                        grid_data: drawing.grid_data,
                        grid_size: drawing.grid_size,
                        palette_name: drawing.palette_name,
                      })
                    }
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingDrawingId(drawing.id)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deletingDrawingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Delete Drawing</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this drawing? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingDrawingId(null)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteDrawing(deletingDrawingId)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
