import { io } from "socket.io-client";

// Aapka current Railway URL
const SOCKET_URL = "https://new-production-132c.up.railway.app"; 

const socket = io(SOCKET_URL, {
  // Backend se matching transports
  transports: ['polling', 'websocket'], 
  withCredentials: true,
  autoConnect: false 
});

export default socket;