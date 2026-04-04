// ChatPopup.jsx — TV4: Floating chat popup cho khách hàng
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { chatApi } from '../../services/chatService';
import ChatBubble from './ChatBubble';
import './ChatPopup.css';

const SUBJECTS = [
    { label: 'Tư vấn chăm sóc da', icon: 'bi-droplet' },
    { label: 'Hỏi về sản phẩm', icon: 'bi-box-seam' },
    { label: 'Thắc mắc đơn hàng', icon: 'bi-truck' },
    { label: 'Khiếu nại / Đổi trả', icon: 'bi-arrow-repeat' },
    { label: 'Khác', icon: 'bi-three-dots' },
];

const ChatPopup = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const chatContext = useChat();

    // Destructure chat context safely (may be null if not logged in)
    const connected = chatContext?.connected || false;
    const currentRoom = chatContext?.currentRoom || null;
    const setCurrentRoom = chatContext?.setCurrentRoom || (() => {});
    const messages = chatContext?.messages || [];
    const setMessages = chatContext?.setMessages || (() => {});
    const typingUser = chatContext?.typingUser || null;
    const chatOpen = chatContext?.chatOpen || false;
    const setChatOpen = chatContext?.setChatOpen || (() => {});
    const subscribeToRoom = chatContext?.subscribeToRoom || (() => {});
    const sendMessageWS = chatContext?.sendMessageWS || (() => {});
    const sendTyping = chatContext?.sendTyping || (() => {});
    const sendMarkAsRead = chatContext?.sendMarkAsRead || (() => {});

    const [inputMsg, setInputMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPreChat, setShowPreChat] = useState(true);
    const [localChatOpen, setLocalChatOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Dùng chatOpen từ context nếu đã login, local state nếu chưa
    const isChatOpen = token ? chatOpen : localChatOpen;
    const toggleChatOpen = (val) => {
        if (token) {
            setChatOpen(val);
        } else {
            setLocalChatOpen(val);
        }
    };

    // Scroll xuống cuối khi có tin nhắn mới
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Khi mở popup, kiểm tra phòng chat hiện có
    useEffect(() => {
        if (isChatOpen && token) {
            loadExistingRoom();
        }
    }, [isChatOpen, token]);

    // Subscribe khi vào phòng
    useEffect(() => {
        if (currentRoom?.id && connected) {
            subscribeToRoom(currentRoom.id);
            sendMarkAsRead(currentRoom.id);
        }
    }, [currentRoom?.id, connected]);

    const loadExistingRoom = async () => {
        try {
            const res = await chatApi.getMyRooms();
            if (res.success && res.data?.length > 0) {
                const openRoom = res.data.find(r => r.status === 'waiting' || r.status === 'active');
                if (openRoom) {
                    setCurrentRoom(openRoom);
                    setShowPreChat(false);
                    const msgRes = await chatApi.getMessages(openRoom.id);
                    if (msgRes.success) {
                        setMessages(msgRes.data || []);
                    }
                    return;
                }
            }
            setShowPreChat(true);
            setCurrentRoom(null);
            setMessages([]);
        } catch (err) {
            console.error('Lỗi load phòng chat:', err);
        }
    };

    // Tạo phòng chat mới
    const handleSelectSubject = async (subject) => {
        setLoading(true);
        try {
            const res = await chatApi.createRoom(subject);
            if (res.success) {
                setCurrentRoom(res.data);
                setShowPreChat(false);
                setMessages([]);
            }
        } catch (err) {
            console.error('Lỗi tạo phòng chat:', err);
        } finally {
            setLoading(false);
        }
    };

    // Gửi tin nhắn
    const handleSend = async () => {
        const content = inputMsg.trim();
        if (!content || !currentRoom) return;

        setInputMsg('');

        if (connected) {
            sendMessageWS(currentRoom.id, content);
        } else {
            try {
                const res = await chatApi.sendMessage(currentRoom.id, content);
                if (res.success) {
                    setMessages(prev => [...prev, res.data]);
                }
            } catch (err) {
                console.error('Lỗi gửi tin nhắn:', err);
            }
        }
    };

    // Typing indicator
    const handleInputChange = (e) => {
        setInputMsg(e.target.value);
        if (currentRoom && connected) {
            sendTyping(currentRoom.id, true);
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                sendTyping(currentRoom.id, false);
            }, 1500);
        }
    };

    // Enter để gửi
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Đóng phòng chat
    const handleCloseChat = async () => {
        if (currentRoom && currentRoom.status !== 'closed') {
            try {
                await chatApi.closeRoom(currentRoom.id);
            } catch (err) {
                console.error('Lỗi đóng chat:', err);
            }
        }
        setCurrentRoom(null);
        setMessages([]);
        setShowPreChat(true);
    };

    const userId = user?.id || user?._id;
    const isRoomClosed = currentRoom?.status === 'closed';

    // Ẩn nút chat nếu là staff/admin (họ dùng /staff/chats)
    if (user && (user.role === 'admin' || user.role === 'staff')) {
        return null;
    }

    return (
        <>
            {/* Floating Button — Luôn hiển thị cho khách & visitor */}
            <button
                className="chat-floating-btn"
                onClick={() => toggleChatOpen(!isChatOpen)}
                title="Chat với nhân viên tư vấn"
            >
                <i className={`bi ${isChatOpen ? 'bi-x-lg' : 'bi-chat-dots-fill'}`}></i>
            </button>

            {/* Chat Popup */}
            {isChatOpen && (
                <div className="chat-popup">
                    {/* Header */}
                    <div className="chat-popup-header">
                        <div className="staff-info">
                            <div className="staff-avatar">
                                <i className="bi bi-headset"></i>
                            </div>
                            <div>
                                <div className="staff-name">
                                    {currentRoom?.staffName || 'AuraBeauty Support'}
                                </div>
                                <div className="staff-status">
                                    {!token
                                        ? '🟢 Sẵn sàng hỗ trợ'
                                        : currentRoom?.status === 'active'
                                            ? '🟢 Đang trực tuyến'
                                            : currentRoom?.status === 'waiting'
                                                ? '⏳ Đang chờ nhân viên...'
                                                : isRoomClosed
                                                    ? '🔴 Đã kết thúc'
                                                    : '🟢 Sẵn sàng hỗ trợ'}
                                </div>
                            </div>
                        </div>
                        <button className="close-btn" onClick={() => toggleChatOpen(false)}>
                            <i className="bi bi-dash-lg"></i>
                        </button>
                    </div>

                    {/* Chưa đăng nhập → Hiện form yêu cầu đăng nhập */}
                    {!token ? (
                        <div className="pre-chat">
                            <h5>👋 Xin chào!</h5>
                            <p>Vui lòng đăng nhập để bắt đầu trò chuyện với nhân viên tư vấn của chúng tôi</p>
                            <button
                                className="subject-btn"
                                style={{
                                    background: '#317B22',
                                    color: 'white',
                                    fontWeight: 600,
                                    textAlign: 'center',
                                    fontSize: '0.95rem',
                                }}
                                onClick={() => {
                                    toggleChatOpen(false);
                                    navigate('/login');
                                }}
                            >
                                <i className="bi bi-box-arrow-in-right"></i>
                                Đăng nhập ngay
                            </button>
                            <button
                                className="subject-btn"
                                style={{ textAlign: 'center' }}
                                onClick={() => {
                                    toggleChatOpen(false);
                                    navigate('/register');
                                }}
                            >
                                <i className="bi bi-person-plus"></i>
                                Đăng ký tài khoản mới
                            </button>
                        </div>
                    ) : showPreChat ? (
                        /* Đã đăng nhập: Chọn chủ đề */
                        <div className="pre-chat">
                            <h5>👋 Xin chào, {user?.name}!</h5>
                            <p>Chọn chủ đề bạn cần tư vấn để bắt đầu trò chuyện</p>
                            {SUBJECTS.map((s, idx) => (
                                <button
                                    key={idx}
                                    className="subject-btn"
                                    onClick={() => handleSelectSubject(s.label)}
                                    disabled={loading}
                                >
                                    <i className={`bi ${s.icon}`}></i>
                                    {loading ? 'Đang tạo phòng...' : s.label}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <>
                            {/* Message Body */}
                            <div className="chat-popup-body">
                                {messages.length === 0 && (
                                    <div className="text-center text-muted py-4" style={{ fontSize: '0.8rem' }}>
                                        <i className="bi bi-chat-square-text fs-1 d-block mb-2 opacity-25"></i>
                                        {currentRoom?.status === 'waiting'
                                            ? 'Đang chờ nhân viên tiếp nhận...\nBạn có thể nhắn tin trước!'
                                            : 'Bắt đầu trò chuyện!'}
                                    </div>
                                )}

                                {messages.map((msg, idx) => (
                                    <ChatBubble
                                        key={msg.id || idx}
                                        message={msg}
                                        isOwn={msg.senderId === userId}
                                    />
                                ))}

                                {typingUser && (
                                    <div className="typing-indicator">
                                        {typingUser} đang gõ...
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Room closed */}
                            {isRoomClosed && (
                                <div className="room-closed-msg">
                                    <i className="bi bi-info-circle me-1"></i>
                                    Cuộc trò chuyện đã kết thúc.
                                    <button
                                        className="btn btn-sm btn-outline-success ms-2"
                                        onClick={() => { setShowPreChat(true); setCurrentRoom(null); setMessages([]); }}
                                    >
                                        Bắt đầu mới
                                    </button>
                                </div>
                            )}

                            {/* Footer — Input */}
                            {!isRoomClosed && (
                                <div className="chat-popup-footer">
                                    <input
                                        type="text"
                                        placeholder="Nhập tin nhắn..."
                                        value={inputMsg}
                                        onChange={handleInputChange}
                                        onKeyDown={handleKeyDown}
                                        autoFocus
                                    />
                                    <button
                                        className="send-btn"
                                        onClick={handleSend}
                                        disabled={!inputMsg.trim()}
                                        title="Gửi"
                                    >
                                        <i className="bi bi-send-fill"></i>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default ChatPopup;
