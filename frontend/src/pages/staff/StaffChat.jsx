// StaffChat.jsx — TV4: Trang quản lý chat cho Staff
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Badge, Button } from 'react-bootstrap';
import AdminLayout from '../../components/admin/AdminLayout';
import ChatRoomList from '../../components/chat/ChatRoomList';
import ChatBubble from '../../components/chat/ChatBubble';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { chatApi, staffChatApi } from '../../services/chatService';
import './StaffChat.css';

const StaffChat = () => {
    const { user } = useAuth();
    const {
        connected,abc
        messages,
        setMessages,
        typingUser,
        subscribeToRoom,
        sendMessageWS,
        sendTyping,
        sendMarkAsRead,
        subscribeToNewRooms,
        sendPresence,
        stompClientRef,
    } = useChat();

    const [activeTab, setActiveTab] = useState('pending'); // pending, mine, closed
    const [rooms, setRooms] = useState({ pending: [], mine: [], closed: [] });
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [inputMsg, setInputMsg] = useState('');
    const [loadingRooms, setLoadingRooms] = useState(false);

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const newRoomSubRef = useRef(null);
    const staffNotifSubRef = useRef(null);
    const selectedRoomRef = useRef(null);

    const userId = user?.id || user?._id;

    // Sync ref
    useEffect(() => {
        selectedRoomRef.current = selectedRoom;
    }, [selectedRoom]);

    // ─── Load danh sách phòng chat ──────────────────────────────────────────

    const loadRooms = useCallback(async () => {
        setLoadingRooms(true);
        try {
            const [pendingRes, myRes, allRes] = await Promise.all([
                staffChatApi.getPending(),
                staffChatApi.getMyRooms(),
                staffChatApi.getAllRooms(),
            ]);

            const pending = pendingRes.success ? pendingRes.data : [];
            const mine = myRes.success ? myRes.data.filter(r => r.status === 'active') : [];
            const closed = allRes.success ? allRes.data.filter(r => r.status === 'closed') : [];

            setRooms({ pending, mine, closed });
        } catch (err) {
            console.error('Lỗi load phòng chat:', err);
        } finally {
            setLoadingRooms(false);
        }
    }, []);

    useEffect(() => {
        loadRooms();
    }, [loadRooms]);

    // ─── Subscribe phòng chat mới (realtime) ────────────────────────────────

    useEffect(() => {
        if (connected && !newRoomSubRef.current) {
            newRoomSubRef.current = subscribeToNewRooms((newRoom) => {
                setRooms(prev => ({
                    ...prev,
                    pending: [newRoom, ...prev.pending.filter(r => r.id !== newRoom.id)],
                }));
            });
        }

        return () => {
            if (newRoomSubRef.current) {
                newRoomSubRef.current.unsubscribe();
                newRoomSubRef.current = null;
            }
        };
    }, [connected, subscribeToNewRooms]);

    // ─── Subscribe notification channel cho staff: nhận unread updates ───────

    useEffect(() => {
        const client = stompClientRef?.current;
        if (!client || !connected || !userId) return;

        // Hủy subscription cũ
        if (staffNotifSubRef.current) {
            staffNotifSubRef.current.unsubscribe();
            staffNotifSubRef.current = null;
        }

        // Subscribe vào channel notification cá nhân của staff
        staffNotifSubRef.current = client.subscribe(
            `/topic/user/${userId}/chat-notification`,
            (frame) => {
                const data = JSON.parse(frame.body);
                const currentSelected = selectedRoomRef.current;

                // Nếu tin nhắn thuộc phòng đang chọn → không tăng unread (vì đang xem)
                if (currentSelected?.id === data.roomId) {
                    // Đánh dấu đã đọc ngay
                    sendMarkAsRead(data.roomId);
                    return;
                }

                // Cập nhật unread count cho room trong sidebar
                setRooms(prev => ({
                    pending: prev.pending.map(r =>
                        r.id === data.roomId
                            ? { ...r, unreadStaff: (r.unreadStaff || 0) + 1, lastMessage: data.content }
                            : r
                    ),
                    mine: prev.mine.map(r =>
                        r.id === data.roomId
                            ? { ...r, unreadStaff: (r.unreadStaff || 0) + 1, lastMessage: data.content }
                            : r
                    ),
                    closed: prev.closed,
                }));
            }
        );

        return () => {
            if (staffNotifSubRef.current) {
                staffNotifSubRef.current.unsubscribe();
                staffNotifSubRef.current = null;
            }
        };
    }, [connected, userId]);

    // ─── Scroll xuống cuối ──────────────────────────────────────────────────

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ─── Subscribe khi chọn phòng ───────────────────────────────────────────

    useEffect(() => {
        if (selectedRoom?.id && connected) {
            subscribeToRoom(selectedRoom.id);
            sendMarkAsRead(selectedRoom.id);
            // Gửi presence online cho phòng chat
            if (sendPresence) {
                sendPresence(selectedRoom.id, true);
            }
        }
    }, [selectedRoom?.id, connected]);

    // ─── Chọn phòng chat ─────────────────────────────────────────────────────

    const handleSelectRoom = async (room) => {
        setSelectedRoom(room);

        // Reset unread ngay lập tức trên UI (không cần đợi API)
        setRooms(prev => ({
            pending: prev.pending.map(r =>
                r.id === room.id ? { ...r, unreadStaff: 0 } : r
            ),
            mine: prev.mine.map(r =>
                r.id === room.id ? { ...r, unreadStaff: 0 } : r
            ),
            closed: prev.closed,
        }));

        try {
            const res = await chatApi.getMessages(room.id);
            if (res.success) {
                setMessages(res.data || []);
            }

            // Đánh dấu đã đọc qua REST + WebSocket
            await chatApi.markAsRead(room.id);
            if (connected) {
                sendMarkAsRead(room.id);
            }
        } catch (err) {
            console.error('Lỗi load tin nhắn:', err);
        }
    };

    // ─── Staff tiếp nhận phòng ───────────────────────────────────────────────

    const handleAssignRoom = async (roomId) => {
        try {
            const res = await chatApi.assignRoom(roomId);
            if (res.success) {
                // Chuyển phòng từ pending sang mine
                setRooms(prev => ({
                    pending: prev.pending.filter(r => r.id !== roomId),
                    mine: [res.data, ...prev.mine],
                    closed: prev.closed,
                }));
                setSelectedRoom(res.data);
                setActiveTab('mine');

                // Load tin nhắn
                const msgRes = await chatApi.getMessages(roomId);
                if (msgRes.success) setMessages(msgRes.data || []);
            }
        } catch (err) {
            console.error('Lỗi tiếp nhận phòng:', err);
        }
    };

    // ─── Đóng phòng ─────────────────────────────────────────────────────────

    const handleCloseRoom = async () => {
        if (!selectedRoom) return;
        try {
            const res = await chatApi.closeRoom(selectedRoom.id);
            if (res.success) {
                setRooms(prev => ({
                    pending: prev.pending,
                    mine: prev.mine.filter(r => r.id !== selectedRoom.id),
                    closed: [res.data, ...prev.closed],
                }));
                setSelectedRoom({ ...selectedRoom, status: 'closed' });
            }
        } catch (err) {
            console.error('Lỗi đóng phòng:', err);
        }
    };

    // ─── Gửi tin nhắn ────────────────────────────────────────────────────────

    const handleSend = async () => {
        const content = inputMsg.trim();
        if (!content || !selectedRoom) return;

        setInputMsg('');
        if (connected) {
            sendMessageWS(selectedRoom.id, content);
        } else {
            try {
                const res = await chatApi.sendMessage(selectedRoom.id, content);
                if (res.success) setMessages(prev => [...prev, res.data]);
            } catch (err) {
                console.error('Lỗi gửi tin nhắn:', err);
            }
        }
    };

    const handleInputChange = (e) => {
        setInputMsg(e.target.value);
        if (selectedRoom && connected) {
            sendTyping(selectedRoom.id, true);
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                sendTyping(selectedRoom.id, false);
            }, 1500);
        }
    };


    // ─── Lấy rooms theo tab hiện tại ─────────────────────────────────────────

    const getCurrentRooms = () => {
        switch (activeTab) {
            case 'pending': return rooms.pending;
            case 'mine': return rooms.mine;
            case 'closed': return rooms.closed;
            default: return [];
        }
    };

    return (
        <AdminLayout>
            <div className="staff-chat-container">
                {/* ── Sidebar ── */}
                <div className="staff-chat-sidebar">
                    <div className="sidebar-header">
                        <h5><i className="bi bi-chat-dots me-2"></i>Quản lý Chat</h5>
                    </div>

                    {/* Tabs */}
                    <div className="sidebar-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                            onClick={() => setActiveTab('pending')}
                        >
                            Đang chờ
                            {rooms.pending.length > 0 && (
                                <Badge bg="danger" className="count-badge">{rooms.pending.length}</Badge>
                            )}
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'mine' ? 'active' : ''}`}
                            onClick={() => setActiveTab('mine')}
                        >
                            Của tôi
                            {rooms.mine.filter(r => r.unreadStaff > 0).length > 0 && (
                                <Badge bg="danger" className="count-badge">
                                    {rooms.mine.reduce((sum, r) => sum + (r.unreadStaff || 0), 0)}
                                </Badge>
                            )}
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'closed' ? 'active' : ''}`}
                            onClick={() => setActiveTab('closed')}
                        >
                            Đã đóng
                        </button>
                    </div>

                    {/* Room list */}
                    <div className="sidebar-body">
                        {loadingRooms ? (
                            <div className="text-center py-4 text-muted">Đang tải...</div>
                        ) : (
                            <ChatRoomList
                                rooms={getCurrentRooms()}
                                activeRoomId={selectedRoom?.id}
                                onSelectRoom={handleSelectRoom}
                                onAssignRoom={activeTab === 'pending' ? handleAssignRoom : null}
                            />
                        )}
                    </div>
                </div>

                {/* ── Main Chat Area ── */}
                {selectedRoom ? (
                    <div className="staff-chat-main">
                        {/* Chat header */}
                        <div className="chat-header">
                            <div className="chat-header-info">
                                <div className="chat-header-avatar">
                                    {selectedRoom.customerName?.charAt(0)?.toUpperCase() || 'K'}
                                </div>
                                <div>
                                    <div className="fw-bold">{selectedRoom.customerName}</div>
                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                        {selectedRoom.subject}
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex gap-2">
                                {selectedRoom.status === 'active' && (
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={handleCloseRoom}
                                    >
                                        <i className="bi bi-x-circle me-1"></i>Đóng
                                    </Button>
                                )}
                                {selectedRoom.status === 'waiting' && (
                                    <Button
                                        variant="success"
                                        size="sm"
                                        onClick={() => handleAssignRoom(selectedRoom.id)}
                                    >
                                        <i className="bi bi-check-circle me-1"></i>Tiếp nhận
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="chat-messages">
                            {messages.map((msg, idx) => (
                                <ChatBubble
                                    key={msg.id || idx}
                                    message={msg}
                                    isOwn={msg.senderId === userId}
                                />
                            ))}
                            {typingUser && (
                                <div className="typing-indicator" style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic' }}>
                                    {typingUser} đang gõ...
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        {selectedRoom.status !== 'closed' && (
                            <div className="chat-input-area">
                                <input
                                    type="text"
                                    placeholder="Nhập tin nhắn..."
                                    value={inputMsg}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                />
                                <Button
                                    variant="success"
                                    onClick={handleSend}
                                    disabled={!inputMsg.trim()}
                                    style={{ borderRadius: '50%', width: 40, height: 40 }}
                                >
                                    <i className="bi bi-send-fill"></i>
                                </Button>
                            </div>
                        )}

                        {selectedRoom.status === 'closed' && (
                            <div className="text-center py-3 bg-light text-muted" style={{ fontSize: '0.85rem' }}>
                                <i className="bi bi-lock me-1"></i>Phòng chat đã đóng
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="no-chat-selected">
                        <i className="bi bi-chat-square-text"></i>
                        <p>Chọn một phòng chat để bắt đầu</p>
                    </div>
                )}

                {/* ── Right Panel — Customer Info ── */}
                {selectedRoom && (
                    <div className="staff-chat-info-panel">
                        <div className="customer-avatar">
                            {selectedRoom.customerName?.charAt(0)?.toUpperCase() || 'K'}
                        </div>
                        <div className="text-center mb-3">
                            <div className="fw-bold">{selectedRoom.customerName}</div>
                            <small className="text-muted">Khách hàng</small>
                        </div>

                        <div className="info-section">
                            <h6>Thông tin cuộc chat</h6>
                            <div className="info-item">
                                <span className="label">Chủ đề:</span>
                                <span>{selectedRoom.subject}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Trạng thái:</span>
                                <span>{selectedRoom.status === 'active' ? '🟢 Đang chat' : selectedRoom.status === 'waiting' ? '⏳ Chờ' : '🔴 Đã đóng'}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Tạo lúc:</span>
                                <span style={{ fontSize: '0.75rem' }}>
                                    {selectedRoom.createdAt ? (() => {
                                        try {
                                            if (Array.isArray(selectedRoom.createdAt)) {
                                                const [y, m, d, h = 0, min = 0] = selectedRoom.createdAt;
                                                return new Date(y, m - 1, d, h, min).toLocaleString('vi-VN');
                                            }
                                            return new Date(selectedRoom.createdAt).toLocaleString('vi-VN');
                                        } catch { return '—'; }
                                    })() : '—'}
                                </span>
                            </div>
                        </div>

                        <div className="info-section">
                            <h6>Ghi chú</h6>
                            <p className="text-muted" style={{ fontSize: '0.8rem' }}>
                                Thông tin hồ sơ da và đơn hàng gần đây của khách hàng sẽ hiển thị tại đây (tích hợp sau).
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default StaffChat;
