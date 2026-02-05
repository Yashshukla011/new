const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');
const he = require('he');

const app = express();
const server = http.createServer(app);

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

app.get('/', (req, res) => res.send('Server is Live ✅'));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true
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
            exists.socketId = socket.id;
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
            io.to(roomId).emit("next_question", { question: room.questions[0], index: 0, total: 5 });
        } catch (e) {
            console.error("API Error");
        }
    });

    socket.on("submit_answer", ({ roomId, userId, points }) => {
        const room = rooms[roomId];
        if (!room) return;
        const p = room.players.find(x => x.userId === userId);
        if (p) p.score += points;
        room.answersReceived++;

        if (room.answersReceived >= room.players.length) {
            room.currentStep++;
            room.answersReceived = 0;
            if (room.currentStep < room.questions.length) {
                io.to(roomId).emit("next_question", { question: room.questions[room.currentStep], index: room.currentStep, total: 5 });
            } else {
                io.to(roomId).emit("game_over", room.players);
                room.gameStarted = false;
            }
        }
    });

    socket.on("disconnect", () => {
        for (const id in rooms) {
            rooms[id].players = rooms[id].players.filter(p => p.socketId !== socket.id);
            io.to(id).emit("update_players", { players: rooms[id].players, maxPlayers: rooms[id].maxPlayers });
        }
    });
});

server.listen(process.env.PORT || 3001, () => console.log("Server Running"));