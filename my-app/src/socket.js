import { io } from "socket.io-client";

// Railway dashboard se jo "Public Domain" mila hai wo yahan dalein
const socket = io("https://perpetual-consideration-production.up.railway.app", {
    transports: ["websocket", "polling"],
    withCredentials: true
});