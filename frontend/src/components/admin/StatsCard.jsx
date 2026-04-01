import React from 'react';

const StatsCard = ({ icon, label, value, color = 'primary', trend, trendValue }) => {
    // color có thể là primary, success, warning, danger, info
    const iconClass = `stats-icon-${color}`;

    return (
        <div className="admin-card admin-card-hover h-100">
            <div className="card-body p-4 d-flex align-items-center">
                <div className={`stats-icon-box ${iconClass} me-4 flex-shrink-0`}>
                    <i className={`bi ${icon} fs-3`}></i>
                </div>
                <div className="flex-grow-1">
                    <p className="text-uppercase fw-semibold mb-1" style={{ fontSize: '11px', color: '#64748b', letterSpacing: '0.5px' }}>
                        {label}
                    </p>
                    <h3 className="mb-0 fw-bold" style={{ color: '#1e293b' }}>{value}</h3>
                    {trend && (
                        <div className="mt-2">
                            <span className={`admin-badge admin-badge-${trend === 'up' ? 'success' : 'danger'}`}>
                                <i className={`bi bi-arrow-${trend} me-1`}></i>
                                {trendValue}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
