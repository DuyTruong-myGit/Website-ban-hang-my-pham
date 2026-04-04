// ChatRoomList.jsx — TV4: Sidebar danh sách phòng chat cho Staff
import React from 'react';
import { Badge } from 'react-bootstrap';

const ChatRoomList = ({ rooms, activeRoomId, onSelectRoom, onAssignRoom }) => {

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const now = new Date();
        const diff = now - d;

        if (diff < 60000) return 'Vừa xong';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} phút`;
        if (diff < 86400000) return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'waiting': return <Badge bg="warning" text="dark">Chờ</Badge>;
            case 'active': return <Badge bg="success">Đang chat</Badge>;
            case 'closed': return <Badge bg="secondary">Đã đóng</Badge>;
            default: return null;
        }
    };

    if (!rooms || rooms.length === 0) {
        return (
            <div className="text-center text-muted py-4" style={{ fontSize: '0.8rem' }}>
                <i className="bi bi-chat-square fs-2 d-block mb-2 opacity-25"></i>
                Không có phòng chat nào
            </div>
        );
    }

    return (
        <div className="list-group list-group-flush">
            {rooms.map((room) => (
                <div
                    key={room.id}
                    className={`list-group-item list-group-item-action p-3 ${
                        activeRoomId === room.id ? 'active' : ''
                    }`}
                    style={{
                        cursor: 'pointer',
                        borderLeft: activeRoomId === room.id ? '3px solid #317B22' : '3px solid transparent',
                        background: activeRoomId === room.id ? '#f0f7ee' : 'transparent',
                    }}
                    onClick={() => onSelectRoom(room)}
                >
                    <div className="d-flex justify-content-between align-items-start">
                        <div className="d-flex align-items-center gap-2" style={{ flex: 1, minWidth: 0 }}>
                            {/* Avatar */}
                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    background: '#e8f5e9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    color: '#317B22',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                }}
                            >
                                {room.customerName?.charAt(0)?.toUpperCase() || 'K'}
                            </div>

                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div className="d-flex align-items-center gap-1 mb-1">
                                    <span className="fw-bold text-truncate" style={{ fontSize: '0.85rem' }}>
                                        {room.customerName || 'Khách hàng'}
                                    </span>
                                    {getStatusBadge(room.status)}
                                </div>
                                <div
                                    className="text-muted text-truncate"
                                    style={{ fontSize: '0.75rem' }}
                                >
                                    {room.lastMessage || room.subject}
                                </div>
                            </div>
                        </div>

                        <div className="text-end" style={{ flexShrink: 0, marginLeft: 8 }}>
                            <div className="text-muted" style={{ fontSize: '0.65rem' }}>
                                {formatTime(room.lastMessageAt || room.createdAt)}
                            </div>
                            {room.unreadStaff > 0 && (
                                <Badge pill bg="danger" className="mt-1" style={{ fontSize: '0.6rem' }}>
                                    {room.unreadStaff}
                                </Badge>
                            )}
                            {room.status === 'waiting' && onAssignRoom && (
                                <button
                                    className="btn btn-sm btn-outline-success mt-1"
                                    style={{ fontSize: '0.65rem', padding: '2px 6px' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAssignRoom(room.id);
                                    }}
                                >
                                    Tiếp nhận
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ChatRoomList;
