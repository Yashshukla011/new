const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');

const app = express();

// CORS ko open rakha hai taaki Vercel se connection ho sake
app.use(cors());

// Render check ke liye ek basic route
app.get('/', (req, res) => {
  res.send('Quiz Backend is Running!');
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Production mein aap yahan apna Vercel URL daal sakte hain
    methods: ["GET", "POST"]
  }
});

let rooms = {}; 

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("join_room", ({ roomId, userName, userId, maxPlayers }) => {
        socket.join(roomId);
        if (!rooms[roomId]) {
            rooms[roomId] = { 
                players: [], 
                questions: [], 
                currentStep: 0, 
                answersReceived: 0,
                maxPlayers: maxPlayers || 2 
            };
        }
        const room = rooms[roomId];
        
        if (room.players.length >= room.maxPlayers && !room.players.find(p => p.userId === userId)) {
            socket.emit("room_full");
            return;
        }

        if (!room.players.find(p => p.userId === userId)) {
            room.players.push({ userId, name: userName, socketId: socket.id, score: 0 });
            io.to(roomId).emit("receive_message", {
                sender: "System",
                text: `${userName} joined the battle!`,
                time: ""
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
        if (!room) return;
        try {
            const res = await axios.get('https://opentdb.com/api.php?amount=5&type=multiple&difficulty=medium');
            const formatted = res.data.results.map((q, i) => {
                const opts = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);
                return { id: i, q: q.question, options: opts, ans: q.correct_answer };
            });
            room.questions = formatted;
            io.to(roomId).emit("next_question", { question: formatted[0], index: 0, total: formatted.length });
        } catch (e) { 
            console.log("Error fetching questions:", e); 
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
                io.to(roomId).emit("next_question", { 
                    question: room.questions[room.currentStep], 
                    index: room.currentStep, 
                    total: room.questions.length 
                });
            } else {
                io.to(roomId).emit("game_over", room.players);
            }
        }
        io.to(roomId).emit("update_players", { players: room.players, maxPlayers: room.maxPlayers });
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });
});

// Render dynamic port use karta hai, isliye process.env.PORT zaroori hai
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));