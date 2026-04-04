// AdminChats.jsx — Trang quản lý chat cho Admin
import React, { useState, useEffect, useCallback } from 'react';
import { Badge, Button, Modal, Spinner } from 'react-bootstrap';
import AdminLayout from '../../components/admin/AdminLayout';
import ChatBubble from '../../components/chat/ChatBubble';
import { adminChatApi } from '../../services/chatService';

const AdminChats = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, waiting, active, closed
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // ─── Load danh sách phòng chat ──────────────────────────────────────────

    const loadRooms = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminChatApi.getAllRooms();
            if (res.success) {
                setRooms(res.data || []);
            }
        } catch (err) {
            console.error('Lỗi load phòng chat:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRooms();
    }, [loadRooms]);

    // ─── Lọc phòng ──────────────────────────────────────────────────────────

    const filteredRooms = rooms
        .filter(r => filter === 'all' || r.status === filter)
        .sort((a, b) => {
            // Sắp xếp: waiting > active > closed, mới nhất trước
            const statusOrder = { waiting: 0, active: 1, closed: 2 };
            const statusDiff = (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
            if (statusDiff !== 0) return statusDiff;
            return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
        });

    // ─── Xem lịch sử chat ───────────────────────────────────────────────────

    const handleViewChat = async (room) => {
        setSelectedRoom(room);
        setLoadingMessages(true);
        try {
            const res = await adminChatApi.getMessages(room.id);
            if (res.success) {
                setMessages(res.data || []);
            }
        } catch (err) {
            console.error('Lỗi load tin nhắn:', err);
        } finally {
            setLoadingMessages(false);
        }
    };

    // ─── Đóng phòng chat ─────────────────────────────────────────────────────

    const handleCloseRoom = async (roomId) => {
        try {
            const res = await adminChatApi.closeRoom(roomId);
            if (res.success) {
                setRooms(prev => prev.map(r =>
                    r.id === roomId ? { ...r, status: 'closed' } : r
                ));
                if (selectedRoom?.id === roomId) {
                    setSelectedRoom(prev => ({ ...prev, status: 'closed' }));
                }
            }
        } catch (err) {
            console.error('Lỗi đóng phòng:', err);
        }
    };

    // ─── Xóa phòng chat ─────────────────────────────────────────────────────

    const handleDeleteRoom = async () => {
        if (!roomToDelete) return;
        setDeleting(true);
        try {
            const res = await adminChatApi.deleteRoom(roomToDelete.id);
            if (res.success) {
                setRooms(prev => prev.filter(r => r.id !== roomToDelete.id));
                if (selectedRoom?.id === roomToDelete.id) {
                    setSelectedRoom(null);
                    setMessages([]);
                }
            }
        } catch (err) {
            console.error('Lỗi xóa phòng:', err);
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
            setRoomToDelete(null);
        }
    };

    // ─── Format thời gian ────────────────────────────────────────────────────

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        try {
            let d;
            if (Array.isArray(dateStr)) {
                const [year, month, day, hour = 0, minute = 0] = dateStr;
                d = new Date(year, month - 1, day, hour, minute);
            } else {
                d = new Date(dateStr);
            }
            if (isNaN(d.getTime())) return '—';
            return d.toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return '—';
        }
    };

    // ─── Status badge ────────────────────────────────────────────────────────

    const getStatusBadge = (status) => {
        switch (status) {
            case 'waiting': return <Badge bg="warning" text="dark">Đang chờ</Badge>;
            case 'active': return <Badge bg="success">Đang chat</Badge>;
            case 'closed': return <Badge bg="secondary">Đã đóng</Badge>;
            default: return <Badge bg="light" text="dark">{status}</Badge>;
        }
    };

    // ─── Stats ───────────────────────────────────────────────────────────────

    const stats = {
        total: rooms.length,
        waiting: rooms.filter(r => r.status === 'waiting').length,
        active: rooms.filter(r => r.status === 'active').length,
        closed: rooms.filter(r => r.status === 'closed').length,
    };

    return (
        <AdminLayout>
            <div className="mb-4">
                <h4 className="fw-bold mb-1">
                    <i className="bi bi-chat-dots me-2" style={{ color: '#317B22' }}></i>
                    Quản lý Chat
                </h4>
                <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                    Xem và quản lý tất cả các cuộc trò chuyện của hệ thống
                </p>
            </div>

            {/* Stats Cards */}
            <div className="row g-3 mb-4">
                {[
                    { label: 'Tổng phòng chat', value: stats.total, icon: 'bi-chat-square-dots', color: '#6366f1', bg: '#eef2ff' },
                    { label: 'Đang chờ', value: stats.waiting, icon: 'bi-hourglass-split', color: '#f59e0b', bg: '#fffbeb' },
                    { label: 'Đang chat', value: stats.active, icon: 'bi-chat-left-text', color: '#22c55e', bg: '#f0fdf4' },
                    { label: 'Đã đóng', value: stats.closed, icon: 'bi-check-circle', color: '#6b7280', bg: '#f9fafb' },
                ].map((stat, idx) => (
                    <div className="col-md-3" key={idx}>
                        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                            <div className="card-body d-flex align-items-center gap-3">
                                <div
                                    className="d-flex align-items-center justify-content-center rounded-circle"
                                    style={{
                                        width: 48,
                                        height: 48,
                                        background: stat.bg,
                                        color: stat.color,
                                        fontSize: '1.2rem',
                                        flexShrink: 0,
                                    }}
                                >
                                    <i className={`bi ${stat.icon}`}></i>
                                </div>
                                <div>
                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{stat.label}</div>
                                    <div className="fw-bold fs-4">{stat.value}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row g-4">
                {/* Room List */}
                <div className={selectedRoom ? 'col-md-5' : 'col-md-12'}>
                    <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                        <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between"
                            style={{ borderRadius: '12px 12px 0 0' }}>
                            <h6 className="mb-0 fw-bold">Danh sách phòng chat</h6>
                            <div className="d-flex gap-1">
                                {['all', 'waiting', 'active', 'closed'].map(f => (
                                    <button
                                        key={f}
                                        className={`btn btn-sm ${filter === f ? 'btn-success' : 'btn-outline-secondary'}`}
                                        style={{ fontSize: '0.7rem', padding: '3px 10px', borderRadius: '20px' }}
                                        onClick={() => setFilter(f)}
                                    >
                                        {f === 'all' ? 'Tất cả' : f === 'waiting' ? 'Chờ' : f === 'active' ? 'Active' : 'Đóng'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="card-body p-0" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            {loading ? (
                                <div className="text-center py-5 text-muted">
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Đang tải...
                                </div>
                            ) : filteredRooms.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    <i className="bi bi-chat-square fs-1 d-block mb-2 opacity-25"></i>
                                    Không có phòng chat nào
                                </div>
                            ) : (
                                <div className="list-group list-group-flush">
                                    {filteredRooms.map(room => (
                                        <div
                                            key={room.id}
                                            className={`list-group-item list-group-item-action p-3 ${
                                                selectedRoom?.id === room.id ? 'active' : ''
                                            }`}
                                            style={{
                                                cursor: 'pointer',
                                                borderLeft: selectedRoom?.id === room.id
                                                    ? '3px solid #317B22'
                                                    : '3px solid transparent',
                                                background: selectedRoom?.id === room.id
                                                    ? '#f0f7ee'
                                                    : 'transparent',
                                            }}
                                            onClick={() => handleViewChat(room)}
                                        >
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div className="d-flex align-items-center gap-2 mb-1">
                                                        <div
                                                            style={{
                                                                width: 32,
                                                                height: 32,
                                                                borderRadius: '50%',
                                                                background: '#e8f5e9',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: '#317B22',
                                                                fontWeight: 700,
                                                                fontSize: '0.8rem',
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            {room.customerName?.charAt(0)?.toUpperCase() || 'K'}
                                                        </div>
                                                        <div style={{ minWidth: 0, flex: 1 }}>
                                                            <div className="d-flex align-items-center gap-1">
                                                                <span className="fw-bold text-truncate" style={{ fontSize: '0.85rem' }}>
                                                                    {room.customerName || 'Khách hàng'}
                                                                </span>
                                                                {getStatusBadge(room.status)}
                                                            </div>
                                                            <div className="text-muted text-truncate" style={{ fontSize: '0.75rem' }}>
                                                                {room.subject}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex justify-content-between" style={{ fontSize: '0.7rem' }}>
                                                        <span className="text-muted text-truncate" style={{ maxWidth: '60%' }}>
                                                            {room.lastMessage || '—'}
                                                        </span>
                                                        <span className="text-muted">
                                                            {room.staffName ? `NV: ${room.staffName}` : 'Chưa tiếp nhận'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-end ms-2" style={{ flexShrink: 0 }}>
                                                    <div className="text-muted" style={{ fontSize: '0.65rem' }}>
                                                        {formatDate(room.lastMessageAt || room.createdAt).split(' ').slice(0, 1)}
                                                    </div>
                                                    <div className="d-flex gap-1 mt-1 justify-content-end">
                                                        {room.status !== 'closed' && (
                                                            <button
                                                                className="btn btn-outline-warning btn-sm"
                                                                style={{ fontSize: '0.6rem', padding: '1px 5px' }}
                                                                title="Đóng phòng"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleCloseRoom(room.id);
                                                                }}
                                                            >
                                                                <i className="bi bi-x-circle"></i>
                                                            </button>
                                                        )}
                                                        <button
                                                            className="btn btn-outline-danger btn-sm"
                                                            style={{ fontSize: '0.6rem', padding: '1px 5px' }}
                                                            title="Xóa phòng"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setRoomToDelete(room);
                                                                setShowDeleteModal(true);
                                                            }}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Chat Messages Panel */}
                {selectedRoom && (
                    <div className="col-md-7">
                        <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                            <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between"
                                style={{ borderRadius: '12px 12px 0 0' }}>
                                <div className="d-flex align-items-center gap-2">
                                    <div
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: '50%',
                                            background: '#e8f5e9',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#317B22',
                                            fontWeight: 700,
                                        }}
                                    >
                                        {selectedRoom.customerName?.charAt(0)?.toUpperCase() || 'K'}
                                    </div>
                                    <div>
                                        <div className="fw-bold" style={{ fontSize: '0.9rem' }}>
                                            {selectedRoom.customerName}
                                        </div>
                                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                            {selectedRoom.subject} · {getStatusBadge(selectedRoom.status)}
                                            {selectedRoom.staffName && (
                                                <span className="ms-1">· NV: {selectedRoom.staffName}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className="btn btn-sm btn-light"
                                    onClick={() => { setSelectedRoom(null); setMessages([]); }}
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>
                            <div className="card-body" style={{
                                maxHeight: '55vh',
                                overflowY: 'auto',
                                background: '#fafafa',
                            }}>
                                {loadingMessages ? (
                                    <div className="text-center py-5 text-muted">
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Đang tải tin nhắn...
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center py-5 text-muted">
                                        <i className="bi bi-chat-square-text fs-1 d-block mb-2 opacity-25"></i>
                                        Chưa có tin nhắn
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => (
                                        <ChatBubble
                                            key={msg.id || idx}
                                            message={msg}
                                            isOwn={false}
                                        />
                                    ))
                                )}
                            </div>
                            <div className="card-footer bg-white text-muted text-center" style={{ fontSize: '0.75rem' }}>
                                <i className="bi bi-eye me-1"></i>
                                Chế độ xem — Admin không tham gia chat trực tiếp
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title style={{ fontSize: '1rem' }}>
                        <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i>
                        Xác nhận xóa phòng chat
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Bạn có chắc chắn muốn xóa phòng chat với <strong>{roomToDelete?.customerName}</strong>?
                    </p>
                    <p className="text-danger mb-0" style={{ fontSize: '0.85rem' }}>
                        <i className="bi bi-exclamation-circle me-1"></i>
                        Hành động này sẽ xóa vĩnh viễn tất cả tin nhắn trong phòng và không thể khôi phục.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" size="sm" onClick={() => setShowDeleteModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="danger" size="sm" onClick={handleDeleteRoom} disabled={deleting}>
                        {deleting ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-1" />
                                Đang xóa...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-trash me-1"></i>
                                Xóa phòng chat
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </AdminLayout>
    );
};

export default AdminChats;
