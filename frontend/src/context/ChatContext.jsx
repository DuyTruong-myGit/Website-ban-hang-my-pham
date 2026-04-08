// ChatContext.jsx — TV4: WebSocket connection + Chat state management
import React, { createContext, useState, useEffect, useContext, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

export const ChatContext = createContext();
export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const { user, token } = useAuth();

    const [connected, setConnected] = useState(false);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [typingUser, setTypingUser] = useState(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [staffOnline, setStaffOnline] = useState(false);

    const socketRef = useRef(null);
    const chatOpenRef = useRef(chatOpen);
    const currentRoomRef = useRef(currentRoom);

    // Sync refs với state
    useEffect(() => {
        chatOpenRef.current = chatOpen;
    }, [chatOpen]);

    useEffect(() => {
        currentRoomRef.current = currentRoom;
    }, [currentRoom]);

    // ─── Kết nối WebSocket (Socket.io) ──────────────────────────────────────────────────

    useEffect(() => {
        if (!token) return;

        const wsUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace('/api', '');

        const socket = io(wsUrl, {
            query: { token }
        });

        socket.on('connect', () => {
            console.log('✅ WebSocket (Socket.io) Connected');
            setConnected(true);
            
            // Tham gia kênh thông báo riêng của User/Staff
            const userId = user?.id || user?._id;
            if (userId) {
                socket.emit('subscribe_user', userId);
            }
            if (user?.role === 'staff' || user?.role === 'admin') {
                socket.emit('subscribe_staff_notifications');
            }
        });

        socket.on('disconnect', () => {
            console.log('❌ WebSocket Disconnected');
            setConnected(false);
            setStaffOnline(false);
        });

        // Lắng nghe notification tăng unread
        socket.on('chat_notification', (data) => {
            if (!chatOpenRef.current) {
                setUnreadCount(prev => prev + 1);
            }
        });

        socketRef.current = socket;

        return () => {
            if (socket.connected) {
                socket.disconnect();
            }
        };
    }, [token, user]);

    // ─── Gửi offline presence trước khi trang đóng ──────────────────────────

    useEffect(() => {
        const handleBeforeUnload = () => {
            const socket = socketRef.current;
            const room = currentRoomRef.current;
            const userId = user?.id || user?._id;
            if (socket && socket.connected && room?.id && userId) {
                socket.emit('chat_presence', {
                    roomId: room.id,
                    userId,
                    isOnline: false,
                    role: user.role,
                });
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [user]);

    // ─── Subscribe vào phòng chat ───────────────────────────────────────────

    const subscribeToRoom = useCallback((roomId) => {
        const socket = socketRef.current;
        if (!socket || !socket.connected) return;

        // Luôn luôn remove listener trước khi đăng ký mới để tránh duplicate listener
        socket.off('new_message');
        socket.off('typing');
        socket.off('room_status');
        socket.off('room_presence');
        socket.off('room_read');
        socket.off('room_unread');

        // Bỏ theo dõi phòng cũ 
        if (currentRoomRef.current?.id) {
            socket.emit('leave_room', currentRoomRef.current.id);
        }

        socket.emit('join_room', roomId);

        // Lắng nghe tin nhắn
        socket.on('new_message', (data) => {
            const incomingMsg = data.message || data;
            setMessages(prev => {
                const exists = prev.find(m => m.id === incomingMsg.id);
                if (exists) return prev;
                return [...prev, incomingMsg];
            });
            
            const userId = user?.id || user?._id;
            const msgSender = data.message?.senderId || data.senderId;
            if (msgSender !== userId && !chatOpenRef.current) {
                setUnreadCount(prev => prev + 1);
            }
        });

        // Typing
        socket.on('typing', (data) => {
            if (data.senderId !== user?.id) {
                setTypingUser(data.isTyping ? data.senderName : null);
                if (data.isTyping) {
                    setTimeout(() => setTypingUser(null), 3000);
                }
            }
        });

        // Status (assign, close)
        socket.on('room_status', (data) => {
            if (data.type === 'room_assigned') {
                setCurrentRoom(prev => prev ? { ...prev, status: 'active', staffName: data.staffName } : prev);
                setStaffOnline(true);
            } else if (data.type === 'room_closed') {
                setCurrentRoom(prev => prev ? { ...prev, status: 'closed' } : prev);
                setStaffOnline(false);
            }
        });

        // Presence
        socket.on('room_presence', (data) => {
            if (data.role === 'staff' || data.role === 'admin') {
                setStaffOnline(data.isOnline);
            }
        });

        // Unread Staff/Customer
        socket.on('room_unread', (data) => {
            setCurrentRoom(prev => {
                if (prev && prev.id === data.roomId) {
                    return {
                        ...prev,
                        unreadCustomer: data.unreadCustomer,
                        unreadStaff: data.unreadStaff,
                    };
                }
                return prev;
            });
        });

        // Đánh dấu đã đọc
        socket.on('room_read', () => {
            // Placeholder tick đọc
        });

        // Gửi presence online cho phòng này
        sendPresence(roomId, true);
    }, [user]);

    // ─── Gửi tin nhắn qua WebSocket ─────────────────────────────────────────

    const sendMessageWS = useCallback((roomId, content, imageUrl = null) => {
        const socket = socketRef.current;
        if (!socket || !socket.connected || !user) return;

        socket.emit('chat_send', {
            roomId,
            senderId: user.id || user._id,
            content,
            imageUrl,
        });
    }, [user]);

    // ─── Gửi typing event ───────────────────────────────────────────────────

    const sendTyping = useCallback((roomId, isTyping) => {
        const socket = socketRef.current;
        if (!socket || !socket.connected || !user) return;

        socket.emit('chat_typing', {
            roomId,
            senderId: user.id || user._id,
            senderName: user.name,
            isTyping,
        });
    }, [user]);

    // ─── Gửi mark as read ───────────────────────────────────────────────────

    const sendMarkAsRead = useCallback((roomId) => {
        const socket = socketRef.current;
        if (!socket || !socket.connected || !user) return;

        socket.emit('chat_read', {
            roomId,
            userId: user.id || user._id,
        });
    }, [user]);

    // ─── Gửi presence (online/offline) ──────────────────────────────────────

    const sendPresence = useCallback((roomId, isOnline) => {
        const socket = socketRef.current;
        if (!socket || !socket.connected || !user) return;

        socket.emit('chat_presence', {
            roomId,
            userId: user.id || user._id,
            isOnline,
            role: user.role,
        });
    }, [user]);

    // ─── Gửi offline cho tất cả rooms trước khi logout ─────────────────────

    const sendOfflineBeforeLogout = useCallback(() => {
        const socket = socketRef.current;
        const room = currentRoomRef.current;
        const userId = user?.id || user?._id;
        if (socket && socket.connected && room?.id && userId) {
            socket.emit('chat_presence', {
                roomId: room.id,
                userId,
                isOnline: false,
                role: user.role,
            });
        }
    }, [user]);

    // ─── Reset unread count ─────────────────────────────────────────────────

    const resetUnread = useCallback(() => {
        setUnreadCount(0);
    }, []);

    // ─── Subscribe cho staff: phòng chat mới ────────────────────────────────

    const subscribeToNewRooms = useCallback((callback) => {
        const socket = socketRef.current;
        if (!socket || !socket.connected) return null;

        const listener = (newRoom) => {
            if (callback) callback(newRoom);
        };
        
        socket.on('new_staff_room', listener);

        return {
            unsubscribe: () => {
                socket.off('new_staff_room', listener);
            }
        };
    }, []);

    const subscribeToChatNotification = useCallback((callback) => {
        const socket = socketRef.current;
        if (!socket || !socket.connected) return null;

        const listener = (data) => {
            if (callback) callback(data);
        };
        
        socket.on('chat_notification', listener);

        return {
            unsubscribe: () => {
                socket.off('chat_notification', listener);
            }
        };
    }, []);

    return (
        <ChatContext.Provider value={{
            connected,
            currentRoom,
            setCurrentRoom,
            messages,
            setMessages,
            typingUser,
            chatOpen,
            setChatOpen,
            unreadCount,
            setUnreadCount,
            resetUnread,
            staffOnline,
            setStaffOnline,
            subscribeToRoom,
            sendMessageWS,
            sendTyping,
            sendMarkAsRead,
            sendPresence,
            sendOfflineBeforeLogout,
            subscribeToNewRooms,
            subscribeToChatNotification,
            stompClientRef: { current: socketRef.current }, // Mock stompClientRef để không lỗi StaffChat.jsx khi gọi client.subscribe
        }}>
            {children}
        </ChatContext.Provider>
    );
};
