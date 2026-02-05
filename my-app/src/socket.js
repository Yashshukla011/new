import { io } from "socket.io-client";

// Local test kar rahe ho to localhost chalega, deploy karoge to Railway URL
const SOCKET_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3001" 
    : "https://new-production-132c.up.railway.app"; 

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'], 
  withCredentials: true,
  autoConnect: true // Ise true kar diya taaki click pe wait na karna pade
});

export default socket;