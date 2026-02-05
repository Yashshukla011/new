import { io } from "socket.io-client";

// Ensure URL is correct
const SOCKET_URL = "https://new-production-132c.up.railway.app"; 

const socket = io(SOCKET_URL, {
  // Sabse pehle 'polling' use karein taaki handshake fail na ho
  transports: ['polling', 'websocket'], 
  withCredentials: true,
  autoConnect: false 
});

// Debugging ke liye (Optional)
socket.on("connect", () => {
  console.log("Connected to server with ID:", socket.id);
});

socket.on("connect_error", (err) => {
  console.log("Connection Error:", err.message);
});

export default socket;