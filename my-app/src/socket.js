import io from 'socket.io-client';

const SOCKET_URL = "https://new-bice-one-83.vercel.app/"; 

export const socket = io(SOCKET_URL, {
    transports: ['websocket'], 
});