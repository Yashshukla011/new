import io from 'socket.io-client';

const SOCKET_URL = "https://new-bvuzpz8aw-yashshukla011s-projects.vercel.app/"; 

export const socket = io(SOCKET_URL, {
    transports: ['websocket'], 
});