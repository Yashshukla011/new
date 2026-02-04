import io from 'socket.io-client';

// Ye URL aapko Render dashboard se milega
const SOCKET_URL = "https://your-backend-name.onrender.com"; 

export const socket = io(SOCKET_URL, {
    transports: ['websocket'], // Render/Vercel par websocket fast chalta hai
});