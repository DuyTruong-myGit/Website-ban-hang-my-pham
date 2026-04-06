import React from "react";

const Modal = ({
  show,
  title,
  onClose,
  onConfirm,
  confirmText = "Xác nhận",
  confirmVariant = "primary",
  children,
  size = "", // Cho phép truyền size (lg, xl) từ ngoài vào
}) => {
  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        style={{ zIndex: 1050 }}
        onClick={onClose}
      >
        <div
          // ĐÃ BỔ SUNG: Nhúng biến size vào class của Bootstrap
          className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${size ? `modal-${size}` : ""}`}
          style={{ maxWidth: size === "xl" ? "1140px" : undefined }} // Ép max-width cho form siêu to
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content shadow-lg border-0">
            <div className="modal-header bg-light border-bottom-0">
              <h5 className="modal-title fw-bold text-primary">{title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body p-4">{children}</div>
            <div className="modal-footer border-top-0 bg-light">
              <button
                type="button"
                className="btn btn-light border px-4"
                onClick={onClose}
              >
                Đóng
              </button>
              <button
                type="button"
                className={`btn btn-${confirmVariant} px-4`}
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
