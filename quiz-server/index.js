const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');

const app = express();

// 1. CORS Middleware update kiya (Production ke liye)
app.use(cors({
    origin: ["https://new-jsz523dyf-yashshukla011s-projects.vercel.app", "https://new-bice-one-83.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true
}));

app.get('/', (req, res) => {
  res.send('Quiz Backend is Running!');
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    // Yahan '*' bhi chalega par specific domain zyada safe hai
    origin: "*", 
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
        if (room.gameStarted) {
            socket.emit("receive_message", { sender: "System", text: "Game already in progress.", time: "" });
            return;
        }

        const isAlreadyIn = room.players.find(p => p.userId === userId || p.socketId === socket.id);
        if (room.players.length >= room.maxPlayers && !isAlreadyIn) {
            socket.emit("room_full");
            return;
        }

        if (!isAlreadyIn) {
            room.players.push({ 
                userId, 
                name: userName, 
                socketId: socket.id, 
                score: 0 
            });
            
            io.to(roomId).emit("receive_message", {
                sender: "System",
                text: `${userName} joined the battle!`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
        }
        io.to(roomId).emit("update_players", { players: room.players, maxPlayers: room.maxPlayers });
    });

    socket.on("send_message", (data) => {
        io.to(data.roomId).emit("receive_message", {
            sender: data.sender, 
            text: data.text,
            time: data.time
        });
    });

    socket.on("start_battle", async (roomId) => {
        const room = rooms[roomId];
        if (!room || room.gameStarted) return;

        try {
            const res = await axios.get('https://opentdb.com/api.php?amount=5&type=multiple&difficulty=medium', { timeout: 5000 });
            
            if (res.data.results) {
                const formatted = res.data.results.map((q, i) => {
                    const opts = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);
                    return { id: i, q: q.question, options: opts, ans: q.correct_answer };
                });

                room.questions = formatted;
                room.gameStarted = true;
                room.currentStep = 0;
                room.answersReceived = 0;

                io.to(roomId).emit("next_question", { 
                    question: formatted[0], 
                    index: 0, 
                    total: formatted.length 
                });
            }
        } catch (e) { 
            console.error("Error fetching questions:", e.message);
            io.to(roomId).emit("receive_message", { sender: "System", text: "Failed to load questions. Try again.", time: "" });
        }
    });

    socket.on("submit_answer", ({ roomId, userId, points }) => {
        const room = rooms[roomId];
        if (!room || !room.gameStarted) return;
        
        const p = room.players.find(x => x.userId === userId || x.socketId === socket.id);
        if (p) { p.score += points; }

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
            const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
            if (playerIndex !== -1) {
                const playerName = room.players[playerIndex].name;
                room.players.splice(playerIndex, 1);
                io.to(roomId).emit("update_players", { players: room.players, maxPlayers: room.maxPlayers });
                if (room.players.length === 0) { delete rooms[roomId]; }
            }
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));