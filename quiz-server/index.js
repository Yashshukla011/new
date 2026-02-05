const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');
const he = require('he');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
    "https://new-bice-one-83.vercel.app", 
    "https://new-jsz523dyf-yashshukla011s-projects.vercel.app",
    "http://localhost:5173"
];

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
}));

app.get('/', (req, res) => res.send('Server is Live ✅'));

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling'] 
});

let rooms = {}; 

io.on("connection", (socket) => {
    console.log(`Connected: ${socket.id}`);

    socket.on("join_room", ({ roomId, userName, userId, maxPlayers }) => {
        if (!roomId || !userName) return;
        socket.join(roomId);
        
        if (!rooms[roomId]) {
            rooms[roomId] = { 
                players: [], 
                questions: [], 
                currentStep: 0, 
                answersReceived: 0,
                maxPlayers: parseInt(maxPlayers) || 2,
                gameStarted: false
            };
        }
        
        const room = rooms[roomId];
        const exists = room.players.find(p => p.userId === userId);

        if (!exists && room.players.length < room.maxPlayers) {
            room.players.push({ userId, name: userName, socketId: socket.id, score: 0 });
        } else if (exists) {
            exists.socketId = socket.id; // Update socket ID on reconnect
        }

        io.to(roomId).emit("update_players", { players: room.players, maxPlayers: room.maxPlayers });
    });

    socket.on("start_battle", async (roomId) => {
        const room = rooms[roomId];
        if (!room || room.gameStarted) return;

        try {
            const res = await axios.get('https://opentdb.com/api.php?amount=5&type=multiple');
            room.questions = res.data.results.map((q, i) => ({
                id: i,
                q: he.decode(q.question),
                options: [...q.incorrect_answers, q.correct_answer].map(o => he.decode(o)).sort(() => Math.random() - 0.5),
                ans: he.decode(q.correct_answer)
            }));
            room.gameStarted = true;
            room.currentStep = 0;
            room.answersReceived = 0;
            
            io.to(roomId).emit("next_question", { question: room.questions[0], index: 0, total: 5 });
        } catch (e) {
            console.error("API Error:", e);
        }
    });

    socket.on("submit_answer", ({ roomId, userId, points }) => {
        const room = rooms[roomId];
        if (!room) return;

        const p = room.players.find(x => x.userId === userId);
        if (p) {
            p.score += points;
        }

        room.answersReceived++;

        // --- FIX: Har answer ke baad updated scores bhejna zaroori hai ---
        io.to(roomId).emit("update_players", { players: room.players, maxPlayers: room.maxPlayers });

        if (room.answersReceived >= room.players.length) {
            room.currentStep++;
            room.answersReceived = 0;

            if (room.currentStep < room.questions.length) {
                io.to(roomId).emit("next_question", { 
                    question: room.questions[room.currentStep], 
                    index: room.currentStep, 
                    total: 5 
                });
            } else {
                io.to(roomId).emit("game_over", room.players);
                room.gameStarted = false;
                // Game khatam hone par score reset nahi kiya hai taaki result dikhe
            }
        }
    });

    socket.on("send_message", (data) => {
        if(data.roomId) {
            io.to(data.roomId).emit("receive_message", data);
        }
    });

    socket.on("disconnect", () => {
        for (const roomId in rooms) {
            const room = rooms[roomId];
            const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
            
            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1);
                
                if (room.players.length === 0) {
                    delete rooms[roomId]; // Room delete agar koi nahi bacha
                } else {
                    io.to(roomId).emit("update_players", { players: room.players, maxPlayers: room.maxPlayers });
                }
            }
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server Running on port ${PORT}`));