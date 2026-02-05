import { io } from "socket.io-client";

const SOCKET_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3001" 
    : "https://new-1-vev3.onrender.com/"; 

const socket = io(SOCKET_URL, {
  transports: ['polling', 'websocket'], // Fallback mechanism
  withCredentials: true,
  autoConnect: true, 
  reconnection: true,
  reconnectionAttempts: 5
});

socket.on("connect", () => console.log("Connected to Server! Socket ID:", socket.id));
socket.on("connect_error", (err) => console.error("Socket Connection Error:", err.message));

export default socket;