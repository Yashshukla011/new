import io from 'socket.io-client';

// FIX: Yahan 5173 ki jagah 3001 karein
const SOCKET_URL = "http://localhost:3001"; 

export const socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'], 
    withCredentials: true
});