import { io } from "socket.io-client";

// Localhost aur Production URL handle karein
const SOCKET_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3001" 
    : "https://new-production-132c.up.railway.app"; 

const socket = io(SOCKET_URL, {
  transports: ['polling', 'websocket'], // Polling se start karega fir upgrade
  withCredentials: true,
  autoConnect: true 
});

// Debugging ke liye
socket.on("connect", () => console.log("Connected to Server!"));
socket.on("connect_error", (err) => console.log("Connection Error: ", err.message));

export default socket;