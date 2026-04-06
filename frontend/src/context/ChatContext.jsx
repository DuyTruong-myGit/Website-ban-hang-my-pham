// ChatContext.jsx — TV4: WebSocket connection + Chat state management
import React, { createContext, useState, useEffect, useContext, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import { useAuth } from './AuthContext';
import { API_BASE_URL, WS_URL } from '../config/apiConfig';

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

    const stompClientRef = useRef(null);
    const subscriptionsRef = useRef([]);
    const notificationSubRef = useRef(null);
    const chatOpenRef = useRef(chatOpen);
    const currentRoomRef = useRef(currentRoom);

    // Sync refs với state
    useEffect(() => {
        chatOpenRef.current = chatOpen;
    }, [chatOpen]);

    useEffect(() => {
        currentRoomRef.current = currentRoom;
    }, [currentRoom]);

    // ─── Kết nối WebSocket ──────────────────────────────────────────────────

    useEffect(() => {
        if (!token) return;

        const wsUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace('/api', '') + '/ws';

        const client = new Client({
            webSocketFactory: () => new SockJS(wsUrl),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log('✅ WebSocket Connected');
                setConnected(true);
            },
            onDisconnect: () => {
                console.log('❌ WebSocket Disconnected');
                setConnected(false);
                setStaffOnline(false);
            },
            onStompError: (frame) => {
                console.error('STOMP Error:', frame.headers['message']);
            },
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (client.active) {
                client.deactivate();
            }
        };
    }, [token]);

    // ─── Subscribe notification channel riêng cho user ──────────────────────
    // Đảm bảo customer luôn nhận unread update dù popup đóng hay mở

    useEffect(() => {
        const client = stompClientRef.current;
        const userId = user?.id || user?._id;
        if (!client || !connected || !userId) return;

        // Hủy subscription cũ
        if (notificationSubRef.current) {
            notificationSubRef.current.unsubscribe();
            notificationSubRef.current = null;
        }

        // Subscribe vào channel notification cá nhân
        notificationSubRef.current = client.subscribe(
            `/topic/user/${userId}/chat-notification`,
            (frame) => {
                const data = JSON.parse(frame.body);
                // Nếu popup đang đóng → tăng unread count
                if (!chatOpenRef.current) {
                    setUnreadCount(data.unreadCount || 1);
                }
            }
        );

        return () => {
            if (notificationSubRef.current) {
                notificationSubRef.current.unsubscribe();
                notificationSubRef.current = null;
            }
        };
    }, [connected, user]);

    // ─── Gửi offline presence trước khi trang đóng ──────────────────────────

    useEffect(() => {
        const handleBeforeUnload = () => {
            const client = stompClientRef.current;
            const room = currentRoomRef.current;
            const userId = user?.id || user?._id;
            if (client && client.connected && room?.id && userId) {
                client.publish({
                    destination: `/app/chat.presence/${room.id}`,
                    body: JSON.stringify({
                        userId,
                        isOnline: false,
                        role: user.role,
                    }),
                });
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [user]);

    // ─── Subscribe vào phòng chat ───────────────────────────────────────────

    const subscribeToRoom = useCallback((roomId) => {
        const client = stompClientRef.current;
        if (!client || !client.connected) return;

        // Hủy subscriptions cũ
        subscriptionsRef.current.forEach(sub => sub.unsubscribe());
        subscriptionsRef.current = [];

        // Subscribe tin nhắn mới
        const msgSub = client.subscribe(`/topic/chat/${roomId}`, (frame) => {
            const newMessage = JSON.parse(frame.body);
            setMessages(prev => [...prev, newMessage]);

            // Nếu popup đóng và tin nhắn không phải do mình gửi → tăng unread
            const userId = user?.id || user?._id;
            if (newMessage.senderId !== userId && !chatOpenRef.current) {
                setUnreadCount(prev => prev + 1);
            }
        });

        // Subscribe typing
        const typingSub = client.subscribe(`/topic/chat/${roomId}/typing`, (frame) => {
            const data = JSON.parse(frame.body);
            if (data.senderId !== user?.id) {
                setTypingUser(data.isTyping ? data.senderName : null);
                // Auto clear typing indicator sau 3s
                if (data.isTyping) {
                    setTimeout(() => setTypingUser(null), 3000);
                }
            }
        });

        // Subscribe trạng thái phòng
        const statusSub = client.subscribe(`/topic/chat/${roomId}/status`, (frame) => {
            const data = JSON.parse(frame.body);
            if (data.type === 'room_assigned') {
                setCurrentRoom(prev => prev ? { ...prev, status: 'active', staffName: data.staffName } : prev);
                setStaffOnline(true);
            } else if (data.type === 'room_closed') {
                setCurrentRoom(prev => prev ? { ...prev, status: 'closed' } : prev);
                setStaffOnline(false);
            }
        });

        // Subscribe presence (online/offline)
        const presenceSub = client.subscribe(`/topic/chat/${roomId}/presence`, (frame) => {
            const data = JSON.parse(frame.body);
            if (data.role === 'staff') {
                setStaffOnline(data.isOnline);
            }
        });

        // Subscribe read event
        const readSub = client.subscribe(`/topic/chat/${roomId}/read`, (frame) => {
            // Có thể dùng để hiện tick "đã đọc" sau này
        });

        // Subscribe unread count update
        const unreadSub = client.subscribe(`/topic/chat/${roomId}/unread`, (frame) => {
            const data = JSON.parse(frame.body);
            // Cập nhật unread count cho room (dùng trong StaffChat sidebar)
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

        subscriptionsRef.current = [msgSub, typingSub, statusSub, presenceSub, readSub, unreadSub];

        // Gửi presence online cho phòng này
        sendPresence(roomId, true);
    }, [user]);

    // ─── Gửi tin nhắn qua WebSocket ─────────────────────────────────────────

    const sendMessageWS = useCallback((roomId, content, imageUrl = null) => {
        const client = stompClientRef.current;
        if (!client || !client.connected || !user) return;

        client.publish({
            destination: `/app/chat.send/${roomId}`,
            body: JSON.stringify({
                senderId: user.id || user._id,
                content,
                imageUrl,
            }),
        });
    }, [user]);

    // ─── Gửi typing event ───────────────────────────────────────────────────

    const sendTyping = useCallback((roomId, isTyping) => {
        const client = stompClientRef.current;
        if (!client || !client.connected || !user) return;

        client.publish({
            destination: `/app/chat.typing/${roomId}`,
            body: JSON.stringify({
                senderId: user.id || user._id,
                senderName: user.name,
                isTyping,
            }),
        });
    }, [user]);

    // ─── Gửi mark as read ───────────────────────────────────────────────────

    const sendMarkAsRead = useCallback((roomId) => {
        const client = stompClientRef.current;
        if (!client || !client.connected || !user) return;

        client.publish({
            destination: `/app/chat.read/${roomId}`,
            body: JSON.stringify({
                userId: user.id || user._id,
            }),
        });
    }, [user]);

    // ─── Gửi presence (online/offline) ──────────────────────────────────────

    const sendPresence = useCallback((roomId, isOnline) => {
        const client = stompClientRef.current;
        if (!client || !client.connected || !user) return;

        client.publish({
            destination: `/app/chat.presence/${roomId}`,
            body: JSON.stringify({
                userId: user.id || user._id,
                isOnline,
                role: user.role,
            }),
        });
    }, [user]);

    // ─── Gửi offline cho tất cả rooms trước khi logout ─────────────────────

    const sendOfflineBeforeLogout = useCallback(() => {
        const client = stompClientRef.current;
        const room = currentRoomRef.current;
        const userId = user?.id || user?._id;
        if (client && client.connected && room?.id && userId) {
            client.publish({
                destination: `/app/chat.presence/${room.id}`,
                body: JSON.stringify({
                    userId,
                    isOnline: false,
                    role: user.role,
                }),
            });
        }
    }, [user]);

    // ─── Reset unread count ─────────────────────────────────────────────────

    const resetUnread = useCallback(() => {
        setUnreadCount(0);
    }, []);

    // ─── Subscribe cho staff: phòng chat mới ────────────────────────────────

    const subscribeToNewRooms = useCallback((callback) => {
        const client = stompClientRef.current;
        if (!client || !client.connected) return null;

        const sub = client.subscribe('/topic/staff/new-room', (frame) => {
            const newRoom = JSON.parse(frame.body);
            if (callback) callback(newRoom);
        });

        return sub;
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
            stompClientRef,
        }}>
            {children}
        </ChatContext.Provider>
    );
};
