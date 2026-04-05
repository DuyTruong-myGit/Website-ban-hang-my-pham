import React from 'react';

/**
 * RatingStars — Hiển thị sao đánh giá
 * Props:
 *   rating: số sao (0-5)
 *   size: kích thước ('sm', 'md', 'lg')
 *   interactive: boolean — cho phép click chọn sao
 *   onRate: callback khi chọn sao (nếu interactive=true)
 *   showValue: boolean — hiển thị số bên cạnh
 */
const RatingStars = ({ rating = 0, size = 'md', interactive = false, onRate, showValue = false, count }) => {
    const sizes = { sm: '0.8rem', md: '1rem', lg: '1.3rem' };
    const fontSize = sizes[size] || sizes.md;

    const renderStar = (index) => {
        const filled = rating >= index;
        const half = rating >= index - 0.5 && rating < index;

        let icon = 'bi-star';
        if (filled) icon = 'bi-star-fill';
        else if (half) icon = 'bi-star-half';

        return (
            <i
                key={index}
                className={`bi ${icon}`}
                style={{
                    color: filled || half ? '#fbbf24' : '#d1d5db',
                    fontSize,
                    cursor: interactive ? 'pointer' : 'default',
                    marginRight: '2px',
                    transition: 'transform 0.2s',
                }}
                onClick={() => interactive && onRate && onRate(index)}
                onMouseEnter={(e) => interactive && (e.target.style.transform = 'scale(1.2)')}
                onMouseLeave={(e) => interactive && (e.target.style.transform = 'scale(1)')}
            />
        );
    };

    return (
        <span className="d-inline-flex align-items-center gap-1">
            {[1, 2, 3, 4, 5].map(renderStar)}
            {showValue && (
                <span style={{ fontSize, fontWeight: 600, color: '#333', marginLeft: '4px' }}>
                    {rating > 0 ? rating : ''}
                </span>
            )}
            {count !== undefined && (
                <span style={{ fontSize: '0.8em', color: '#999', marginLeft: '4px' }}>
                    ({count})
                </span>
            )}
        </span>
    );
};

export default RatingStars;
