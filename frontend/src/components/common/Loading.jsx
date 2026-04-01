import React from 'react';

const Loading = ({ message = 'Đang tải dữ liệu...' }) => {
    return (
        <div className="d-flex flex-column align-items-center justify-content-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">{message}</p>
        </div>
    );
};

export default Loading;
