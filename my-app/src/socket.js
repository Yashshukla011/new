import io from 'socket.io-client';

const SOCKET_URL = "https://your-backend-name.onrender.com"; 

export const socket = io(SOCKET_URL, {
    transports: ['websocket'], 
});