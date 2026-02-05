import { io } from "socket.io-client";

const socket = io("https://new-1-vev3.onrender.com", {
  withCredentials: true,
  transports: ["websocket", "polling"]
});