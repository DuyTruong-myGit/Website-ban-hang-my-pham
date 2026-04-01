import React from 'react';

const Modal = ({ show, title, onClose, onConfirm, confirmText = 'Xác nhận', confirmVariant = 'primary', children }) => {
    if (!show) return null;

    return (
        <>
            <div className="modal-backdrop fade show" onClick={onClose}></div>
            <div className="modal fade show d-block" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow">
                        <div className="modal-header border-0">
                            <h5 className="modal-title fw-bold">{title}</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">
                            {children}
                        </div>
                        <div className="modal-footer border-0">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Đóng
                            </button>
                            {onConfirm && (
                                <button type="button" className={`btn btn-${confirmVariant}`} onClick={onConfirm}>
                                    {confirmText}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Modal;
