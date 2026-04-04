// ChatContext.jsx — TV4: WebSocket connection + Chat state management
import React, { createContext, useState, useEffect, useContext, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
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

    const stompClientRef = useRef(null);
    const subscriptionsRef = useRef([]);

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
            } else if (data.type === 'room_closed') {
                setCurrentRoom(prev => prev ? { ...prev, status: 'closed' } : prev);
            }
        });

        subscriptionsRef.current = [msgSub, typingSub, statusSub];
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
            subscribeToRoom,
            sendMessageWS,
            sendTyping,
            sendMarkAsRead,
            subscribeToNewRooms,
        }}>
            {children}
        </ChatContext.Provider>
    );
};
