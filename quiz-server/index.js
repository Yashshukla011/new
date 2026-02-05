import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import axios from 'axios';
import he from 'he'; // HTML entities decode karne ke liye

const app = express();

const allowedOrigins = [
    "https://new-jsz523dyf-yashshukla011s-projects.vercel.app", 
    "https://new-bice-one-83.vercel.app",
    "http://localhost:5173"
];

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
}));

app.get('/', (req, res) => {
  res.send('Quiz Backend is Running!');
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

let rooms = {}; 

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("join_room", ({ roomId, userName, userId, maxPlayers }) => {
        if (!roomId || !userName) return;
        socket.join(roomId);
        
        if (!rooms[roomId]) {
            rooms[roomId] = { 
                players: [], 
                questions: [], 
                currentStep: 0, 
                answersReceived: 0,
                maxPlayers: maxPlayers || 2,
                gameStarted: false
            };
        }
        
        const room = rooms[roomId];
        const isAlreadyIn = room.players.find(p => p.userId === userId);

        if (!isAlreadyIn && room.players.length < room.maxPlayers) {
            room.players.push({ 
                userId, 
                name: userName, 
                socketId: socket.id, 
                score: 0 
            });
        } else if (isAlreadyIn) {
            isAlreadyIn.socketId = socket.id;
        }

        io.to(roomId).emit("update_players", { players: room.players, maxPlayers: room.maxPlayers });
    });

    socket.on("start_battle", async (roomId) => {
        const room = rooms[roomId];
        if (!room || room.gameStarted) return;

        try {
            const res = await axios.get('https://opentdb.com/api.php?amount=5&type=multiple&difficulty=medium');
            if (res.data.results) {
                room.questions = res.data.results.map((q, i) => ({
                    id: i,
                    q: he.decode(q.question),
                    options: [...q.incorrect_answers, q.correct_answer]
                        .map(opt => he.decode(opt))
                        .sort(() => Math.random() - 0.5),
                    ans: he.decode(q.correct_answer)
                }));

                room.gameStarted = true;
                room.currentStep = 0;
                room.answersReceived = 0;

                io.to(roomId).emit("next_question", { 
                    question: room.questions[0], 
                    index: 0, 
                    total: room.questions.length 
                });
            }
        } catch (e) {
            console.error("Fetch Error:", e.message);
        }
    });

    socket.on("submit_answer", ({ roomId, userId, points }) => {
        const room = rooms[roomId];
        if (!room || !room.gameStarted) return;
        
        const p = room.players.find(x => x.userId === userId);
        if (p) p.score += points;

        room.answersReceived++;

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
        io.to(roomId).emit("update_players", { players: room.players, maxPlayers: room.maxPlayers });
    });

    socket.on("disconnect", () => {
        for (const roomId in rooms) {
            const room = rooms[roomId];
            const pIdx = room.players.findIndex(p => p.socketId === socket.id);
            if (pIdx !== -1) {
                room.players.splice(pIdx, 1);
                if (room.players.length === 0) delete rooms[roomId];
                else io.to(roomId).emit("update_players", { players: room.players, maxPlayers: room.maxPlayers });
            }
        }
    });
});

const PORT = process.env.PORT || 3004;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));