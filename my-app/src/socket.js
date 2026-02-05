import io from 'socket.io-client';

// Local testing ke liye aapka backend port 3001 hai
const SOCKET_URL = "http://localhost:5173/"; 

export const socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'], // Polling ko backup ke liye rakhein
    withCredentials: true
});