import { io } from "socket.io-client";

// import.meta.env Vite ka tarika hai variables access karne ka
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "https://new-production-132c.up.railway.app"; 

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'], 
  withCredentials: true,
  autoConnect: false 
});

export default socket;