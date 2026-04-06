import React from "react";

const ImageUpload = ({
  images,
  onUpload,
  onRemove,
  uploading,
  multiple = true,
}) => {
  return (
    <div className="mb-3">
      <label className="form-label small fw-medium">Hình ảnh tải lên</label>
      <input
        type="file"
        className="form-control mb-2"
        multiple={multiple}
        accept="image/*"
        onChange={onUpload}
        disabled={uploading}
      />
      {uploading && (
        <div className="text-primary small mb-2">
          <i className="spinner-border spinner-border-sm me-2"></i>Đang tải ảnh
          lên...
        </div>
      )}

      <div className="d-flex flex-wrap gap-2 mt-2">
        {images &&
          images.map((img, idx) => (
            <div
              key={idx}
              className="position-relative border rounded p-1"
              style={{ width: "60px", height: "60px" }}
            >
              <img
                src={img}
                alt="preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <button
                type="button"
                className="btn btn-danger btn-sm position-absolute rounded-circle p-0"
                style={{
                  top: "-5px",
                  right: "-5px",
                  width: "20px",
                  height: "20px",
                  fontSize: "10px",
                }}
                onClick={() => onRemove(idx)}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ImageUpload;
