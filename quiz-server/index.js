const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
    "https://new-bice-one-83.vercel.app", 
    "https://new-jsz523dyf-yashshukla011s-projects.vercel.app",
    "http://localhost:5173"
];

app.use(cors({ origin: allowedOrigins, credentials: true }));

const io = new Server(server, {
    cors: { origin: allowedOrigins, methods: ["GET", "POST"], credentials: true },
    transports: ['websocket', 'polling'] 
});

let rooms = {}; 

io.on("connection", (socket) => {
    // JOIN ROOM
    socket.on("join_room", ({ roomId, userName, userId, maxPlayers }) => {
        socket.join(roomId);
        if (!rooms[roomId]) {
            rooms[roomId] = { 
                players: [], questions: [], currentStep: 0, 
                answersReceived: 0, maxPlayers: parseInt(maxPlayers) || 2, gameStarted: false
            };
        }
        
        const room = rooms[roomId];
        const exists = room.players.find(p => p.userId === userId);

        if (!exists && room.players.length < room.maxPlayers) {
            room.players.push({ userId, name: userName, socketId: socket.id, score: 0 });
            io.to(roomId).emit("update_players", { players: room.players, maxPlayers: room.maxPlayers });
        } else if (exists) {
            exists.socketId = socket.id;
            io.to(roomId).emit("update_players", { players: room.players, maxPlayers: room.maxPlayers });
        } else {
            socket.emit("room_full");
        }
    });

    // START BATTLE
    socket.on("start_battle", ({ roomId, questions }) => {
        const room = rooms[roomId];
        if (!room || !questions || questions.length === 0) return;

        room.questions = questions;
        room.gameStarted = true;
        room.currentStep = 0;
        room.answersReceived = 0;
        
        io.to(roomId).emit("next_question", { 
            question: room.questions[0], 
            index: 0, 
            total: room.questions.length 
        });
    });

    // SUBMIT ANSWER
    socket.on("submit_answer", ({ roomId, userId, points }) => {
        const room = rooms[roomId];
        if (!room) return;

        const p = room.players.find(x => x.userId === userId);
        if (p) p.score += points;

        room.answersReceived++;
        io.to(roomId).emit("update_players", { players: room.players });

        if (room.answersReceived >= room.players.length) {
            room.currentStep++;
            room.answersReceived = 0;

            if (room.currentStep < room.questions.length) {
                setTimeout(() => {
                    io.to(roomId).emit("next_question", { 
                        question: room.questions[room.currentStep], 
                        index: room.currentStep, 
                        total: room.questions.length 
                    });
                }, 1000);
            } else {
                io.to(roomId).emit("game_over", room.players);
                room.gameStarted = false;
            }
        }
    });

    socket.on("disconnect", () => {
        for (const rid in rooms) {
            rooms[rid].players = rooms[rid].players.filter(p => p.socketId !== socket.id);
            io.to(rid).emit("update_players", { players: rooms[rid].players });
            if(rooms[rid].players.length === 0) delete rooms[rid];
        }
    });
});

server.listen(process.env.PORT || 3001, () => console.log("Server Running"));