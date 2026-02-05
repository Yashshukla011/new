import { io } from "socket.io-client";

// IMPORTANT: Yahan apna real backend link hi dalna
const SOCKET_URL = "https://new-production-132c.up.railway.app";
const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'], 
  withCredentials: true,
  autoConnect: false // Iska matlab hai socket tabhi start hoga jab hum bolenge
});

export default socket;