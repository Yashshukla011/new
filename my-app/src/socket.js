import io from 'socket.io-client';

const SOCKET_URL = "https://new-kns828ge1-yashshukla011s-projects.vercel.app/"; 

export const socket = io(SOCKET_URL, {
    transports: ['websocket'], 
});