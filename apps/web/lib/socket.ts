import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getChatSocket(): Socket {
    if (!socket) {
        socket = io(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/chat`, {
            auth: (cb) => {
                const token = typeof window !== 'undefined' ? localStorage.getItem('cloned_token') : null;
                cb({ token });
            },
            transports: ['websocket', 'polling'],
            autoConnect: true,
        });
    }
    return socket;
}

export function disconnectChatSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
