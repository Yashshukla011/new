import { io } from "socket.io-client";

// Purana link hata kar naya wala dalein
const SOCKET_URL = "https://new-production-132c.up.railway.app"; 

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'], 
  withCredentials: true,
  autoConnect: false 
});

export default socket;