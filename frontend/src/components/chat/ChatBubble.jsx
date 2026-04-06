import React from 'react';

/**
 * ChatBubble — Hiển thị 1 tin nhắn dạng bubble
 * Props:
 *   message: { senderId, senderName, senderRole, content, imageUrl, createdAt, created_at }
 *   isOwn: boolean — true nếu tin nhắn do user hiện tại gửi
 */
const ChatBubble = ({ message, isOwn }) => {
    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        try {
            let d;

            // Xử lý trường hợp LocalDateTime từ Spring Boot trả về dạng array [2026, 4, 4, 14, 30, 0]
            if (Array.isArray(dateStr)) {
                const [year, month, day, hour = 0, minute = 0, second = 0] = dateStr;
                d = new Date(year, month - 1, day, hour, minute, second);
            }
            // Xử lý trường hợp chuỗi ISO hoặc chuỗi thông thường
            else if (typeof dateStr === 'string') {
                // Spring Boot LocalDateTime có thể trả về "2026-04-04T14:30:00" (không có Z)
                // Thêm 'Z' nếu không có timezone info để parse đúng
                if (dateStr.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/) && !dateStr.includes('Z') && !dateStr.includes('+')) {
                    d = new Date(dateStr); // Parse as local time
                } else {
                    d = new Date(dateStr);
                }
            }
            // Nếu là number (timestamp)
            else if (typeof dateStr === 'number') {
                d = new Date(dateStr);
            } else {
                return '';
            }

            if (isNaN(d.getTime())) return '';

            const now = new Date();
            const isToday = d.toDateString() === now.toDateString();
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            const isYesterday = d.toDateString() === yesterday.toDateString();

            const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

            if (isToday) return time;
            if (isYesterday) return `Hôm qua ${time}`;
            return `${d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} ${time}`;
        } catch (e) {
            console.warn('Lỗi format time:', e);
            return '';
        }
    };

    // Lấy thời gian từ nhiều field khả dĩ (Spring Boot có thể trả về createdAt hoặc created_at)
    const getTimeDisplay = () => {
        const timeValue = message.createdAt || message.created_at || message.timestamp;
        const formatted = formatTime(timeValue);
        if (formatted) return formatted;

        // Fallback: Nếu không parse được, hiển thị "Vừa xong"
        // (tin nhắn mới gửi qua WebSocket có thể chưa có createdAt từ DB)
        if (!timeValue && message.id) return '';
        if (!timeValue) return 'Vừa xong';
        return '';
    };

    return (
        <div className={`d-flex mb-2 ${isOwn ? 'justify-content-end' : 'justify-content-start'}`}>
            <div
                style={{
                    maxWidth: '70%',
                    borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    padding: '10px 14px',
                    backgroundColor: isOwn ? '#317B22' : '#f0f0f0',
                    color: isOwn ? '#fff' : '#333',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    wordWrap: 'break-word',
                }}
            >
                {!isOwn && (
                    <div style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        marginBottom: '2px',
                        color: '#317B22',
                    }}>
                        {message.senderName}
                        {message.senderRole !== 'customer' && (
                            <span className="badge bg-info ms-1" style={{ fontSize: '0.6rem' }}>
                                {message.senderRole === 'admin' ? 'Admin' : 'NV'}
                            </span>
                        )}
                    </div>
                )}

                {message.imageUrl && (
                    <img
                        src={message.imageUrl}
                        alt="Ảnh"
                        style={{
                            maxWidth: '100%',
                            borderRadius: '8px',
                            marginBottom: message.content ? '6px' : 0,
                        }}
                    />
                )}

                {message.content && (
                    <div style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                        {message.content}
                    </div>
                )}

                <div style={{
                    fontSize: '0.65rem',
                    textAlign: 'right',
                    marginTop: '4px',
                    opacity: 0.7,
                    color: isOwn ? 'rgba(255,255,255,0.8)' : '#999',
                }}>
                    {getTimeDisplay()}
                </div>
            </div>
        </div>
    );
};

export default ChatBubble;
