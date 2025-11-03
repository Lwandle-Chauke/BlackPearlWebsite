// src/components/AdminUploadModal.jsx
import React, { useEffect, useState, useRef } from "react";
import galleryService from "../services/galleryService";

const AdminUploadModal = ({ albums = [], initialAlbum = "", onClose, onUploaded }) => {
  const [availableAlbums, setAvailableAlbums] = useState(albums);
  const [selectedAlbum, setSelectedAlbum] = useState(initialAlbum || albums?.[0]?._id || "");
  const [files, setFiles] = useState([]);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const dropRef = useRef(null);

  // Fetch albums if none provided
  useEffect(() => {
    if (!availableAlbums || availableAlbums.length === 0) {
      galleryService
        .getAlbums()
        .then((data) => {
          setAvailableAlbums(data);
          if (!selectedAlbum && data.length > 0) setSelectedAlbum(data[0]._id);
        })
        .catch((err) => console.error("Failed to load albums:", err));
    }
  }, [availableAlbums, selectedAlbum]);

  // Drag & Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    if (dropRef.current) dropRef.current.classList.add("drag-over");
  };

  const handleDragLeave = () => {
    if (dropRef.current) dropRef.current.classList.remove("drag-over");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (dropRef.current) dropRef.current.classList.remove("drag-over");
    const droppedFiles = Array.from(e.dataTransfer.files || []).filter((file) =>
      file.type.startsWith("image/")
    );
    if (droppedFiles.length) setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedAlbum) return setMessage("Please select an album.");
    if (files.length === 0) return setMessage("Please select at least one image.");

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));
      formData.append("caption", caption);

      console.log("🔄 Starting admin upload to album:", selectedAlbum);

      const result = await galleryService.adminUpload(selectedAlbum, formData);

      console.log("✅ Admin upload successful:", result);
      setMessage("✅ Uploaded successfully! Images are now live in the gallery.");

      // Trigger gallery refresh immediately
      onUploaded &&
        onUploaded({
          ...result,
          albumId: selectedAlbum,
          action: "adminUpload",
        });

      setFiles([]);
      setCaption("");

      // Close modal after successful upload
      setTimeout(() => {
        onClose && onClose();
      }, 2000);
    } catch (err) {
      console.error("❌ Upload failed:", err);
      setMessage(err.response?.data?.message || err.message || "❌ Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal card-modal smooth-modal">
        <div className="card-header">
          <h3>📸 Admin Upload</h3>
          <button className="close" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>

        <div className="card-body">
          <p className="modal-description">
            Upload images directly to the gallery with an optional caption.
          </p>

          <div className="form-grid">
            <div className="col">
              <label htmlFor="album">Select an Album</label>
              <select
                id="album"
                value={selectedAlbum}
                onChange={(e) => setSelectedAlbum(e.target.value)}
              >
                <option value="">-- Choose an album --</option>
                {availableAlbums.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.albumName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <form onSubmit={handleFileUpload} className="upload-form">
            <div
              className="drag-drop-area"
              ref={dropRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <p>Drag & drop images here, or click below to select files</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
              />
            </div>

            {files.length > 0 && (
              <p>{files.length} file{files.length > 1 ? "s" : ""} selected</p>
            )}

            <label>
              Caption
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Optional caption..."
              />
            </label>

            <div className="card-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </form>

          {message && <p className="status-message">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminUploadModal;
