import React from 'react';

/**
 * ChatBubble — Hiển thị 1 tin nhắn dạng bubble
 * Props:
 *   message: { senderId, senderName, senderRole, content, imageUrl, createdAt }
 *   isOwn: boolean — true nếu tin nhắn do user hiện tại gửi
 */
const ChatBubble = ({ message, isOwn }) => {
    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
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
                        color: isOwn ? 'rgba(255,255,255,0.8)' : '#317B22',
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
                }}>
                    {formatTime(message.createdAt)}
                </div>
            </div>
        </div>
    );
};

export default ChatBubble;
