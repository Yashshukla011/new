import { io } from "socket.io-client";

// Environment variable use karein, agar nahi mile toh localhost fallback
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001"; 

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'], // websocket ko priority dein
  withCredentials: true,
  autoConnect: false 
});

export default socket;