// src/components/UserUploadModal.jsx
import React, { useEffect, useState, useRef } from "react";
import galleryService from '../services/galleryService'; // ✅ Use service instead of axios

const UserUploadModal = ({ albums = [], initialAlbum = "", onClose, onUploaded }) => {
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
      galleryService.getAlbums()
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
    const droppedFiles = Array.from(e.dataTransfer.files || []).filter(file => file.type.startsWith("image/"));
    if (droppedFiles.length) setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("⚠️ You must be logged in to upload images.");
      return;
    }
    
    if (!selectedAlbum) {
      setMessage("Please select an album.");
      return;
    }
    
    if (files.length === 0) {
      setMessage("Please select at least one image.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));
      formData.append("caption", caption);

      // ✅ FIXED: Use galleryService instead of direct axios
      const result = await galleryService.userUpload(selectedAlbum, formData);

      setMessage("✅ Upload request submitted for admin approval!");
      onUploaded && onUploaded(result);
      setFiles([]);
      setCaption("");
      setTimeout(() => onClose && onClose(), 2000);
    } catch (err) {
      console.error("User upload failed:", err);
      setMessage(err.message || "❌ Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal card-modal smooth-modal">
        <div className="card-header">
          <h3>📸 Share Your Memory</h3>
          <button className="close" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>

        <div className="card-body">
          <p className="modal-description">
            Upload your travel photos for admin approval. They'll appear in the gallery once approved.
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
                  <option key={a._id} value={a._id}>{a.albumName}</option>
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
              Caption (Optional)
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption for your images..."
                rows="3"
              />
            </label>

            <div className="card-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Uploading..." : "Submit for Approval"}
              </button>
            </div>
          </form>

          {message && <p className="status-message">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default UserUploadModal;