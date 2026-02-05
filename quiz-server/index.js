const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

let rooms = {}; 

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("join_room", ({ roomId, userName, userId, maxPlayers }) => {
        socket.join(roomId);
        
        // Fix 1: Socket ID ko user object mein track karna zaroori hai disconnect ke liye
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
        } else {
            // Agar user refresh kare toh uska socket ID update karein
            const pIndex = room.players.findIndex(p => p.userId === userId);
            room.players[pIndex].socketId = socket.id;
        }
        
        io.to(roomId).emit("update_players", { players: room.players, maxPlayers: room.maxPlayers });
    });

    socket.on("start_battle", async (roomId) => {
        const room = rooms[roomId];
        if (!room) return;
        try {
            const res = await axios.get('https://opentdb.com/api.php?amount=5&type=multiple&difficulty=medium');
            const formatted = res.data.results.map((q, i) => {
                const opts = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);
                // Fix 2: Question decode karne ka logic frontend pe lagana ya yahan clean karna
                return { id: i, q: q.question, options: opts, ans: q.correct_answer };
            });
            room.questions = formatted;
            room.currentStep = 0; // Reset step
            room.answersReceived = 0; // Reset count
            io.to(roomId).emit("next_question", { question: formatted[0], index: 0, total: formatted.length });
        } catch (e) { 
            console.log("Error fetching questions:", e);
            io.to(roomId).emit("error_msg", "Failed to load questions.");
        }
    });

    socket.on("submit_answer", ({ roomId, userId, points }) => {
        const room = rooms[roomId];
        if (!room || !room.questions.length) return;
        
        const p = room.players.find(x => x.userId === userId);
        if (p) p.score += points;

        room.answersReceived++;

        // Fix 3: Logic check for game progression
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
                // Optional: delete rooms[roomId]; // Game khatam hone par memory saaf karein
            }
        }
        io.to(roomId).emit("update_players", { players: room.players, maxPlayers: room.maxPlayers });
    });

    // Fix 4: Disconnect Logic jo game ko phansne se bachayega
    socket.on("disconnect", () => {
        for (const roomId in rooms) {
            const room = rooms[roomId];
            const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
            
            if (playerIndex !== -1) {
                const removedPlayer = room.players.splice(playerIndex, 1)[0];
                console.log(`Player ${removedPlayer.name} disconnected`);
                
                // Agar koi player nahi bacha toh room delete karein
                if (room.players.length === 0) {
                    delete rooms[roomId];
                } else {
                    io.to(roomId).emit("update_players", { players: room.players, maxPlayers: room.maxPlayers });
                    io.to(roomId).emit("receive_message", {
                        sender: "System",
                        text: `${removedPlayer.name} left the battle.`,
                        time: ""
                    });
                    
                    // IMPORTANT: Agar game chal raha tha, toh check karein ki kya ab questions aage badhne chahiye
                    if (room.questions.length > 0 && room.answersReceived >= room.players.length) {
                         // Yahan logic trigger karein next question ka agar zarurat ho
                    }
                }
            }
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));