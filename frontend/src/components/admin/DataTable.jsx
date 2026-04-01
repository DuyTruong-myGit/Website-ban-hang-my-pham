import React from 'react';

const DataTable = ({ columns, data, onRowClick, emptyMessage = 'Không có dữ liệu.' }) => {
    if (!data || data.length === 0) {
        return (
            <div className="admin-card border-0 mb-4 p-5 text-center">
                <i className="bi bi-inbox fs-1 d-block mb-3 text-muted" style={{opacity: 0.5}}></i>
                <p className="text-muted mb-0">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="admin-table-wrapper admin-card mb-4 shadow-sm">
            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} style={col.style || {}}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, rowIdx) => (
                            <tr
                                key={row.id || row._id || rowIdx}
                                onClick={() => onRowClick && onRowClick(row)}
                                style={onRowClick ? { cursor: 'pointer' } : {}}
                            >
                                {columns.map((col, colIdx) => (
                                    <td key={colIdx}>
                                        {col.render ? col.render(row) : row[col.field]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;
