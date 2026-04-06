import React from 'react';

const Pagination = ({ page, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let start = Math.max(0, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible);
    if (end - start < maxVisible) {
        start = Math.max(0, end - maxVisible);
    }

    for (let i = start; i < end; i++) {
        pages.push(i);
    }

    return (
        <nav className="d-flex justify-content-center mt-3">
            <ul className="pagination mb-0">
                <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => onPageChange(page - 1)}>
                        <i className="bi bi-chevron-left"></i>
                    </button>
                </li>
                {pages.map((p) => (
                    <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => onPageChange(p)}>
                            {p + 1}
                        </button>
                    </li>
                ))}
                <li className={`page-item ${page >= totalPages - 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => onPageChange(page + 1)}>
                        <i className="bi bi-chevron-right"></i>
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Pagination;
