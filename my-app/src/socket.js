// index.js (Backend)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend ka address
    methods: ["GET", "POST"]
  }
});