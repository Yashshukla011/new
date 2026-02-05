import { io } from "socket.io-client";

const SOCKET_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3001" 
    : "https://new-production-132c.up.railway.app"; 

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'], 
  withCredentials: true,
  autoConnect: true 
});

export default socket;