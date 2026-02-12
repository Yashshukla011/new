import React, { useState, useEffect, useRef } from 'react';
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import * as pdfjsLib from 'pdfjs-dist';

// PDF Worker Setup
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const socket = io("https://new-1-vev3.onrender.com", {
    transports: ["websocket", "polling"],
    withCredentials: true
});

const MultiplePlayer = () => {
    const [roomId, setRoomId] = useState('');
    const [userName, setUserName] = useState('');
    const [players, setPlayers] = useState([]);
    const [maxPlayers, setMaxPlayers] = useState(2);
    const [isCreating, setIsCreating] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [manualText, setManualText] = useState("");

    const [currentQ, setCurrentQ] = useState(null);
    const [qInfo, setQInfo] = useState({ index: 0, total: 0 });
    const [hasAnswered, setHasAnswered] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15);
    const timerRef = useRef(null);

    const [userId] = useState(() => {
        let id = sessionStorage.getItem('battle_uid') || 'U-' + Math.random().toString(36).substr(2, 6).toUpperCase();
        sessionStorage.setItem('battle_uid', id);
        return id;
    });

    useEffect(() => {
        socket.on("update_players", (data) => {
            setPlayers([...data.players].sort((a, b) => b.score - a.score));
            if (data.maxPlayers) setMaxPlayers(data.maxPlayers);
        });

        socket.on("next_question", (data) => {
            setCurrentQ(data.question);
            setQInfo({ index: data.index, total: data.total });
            setHasAnswered(false);
            setSelectedOption(null);
            setTimeLeft(15);
            setGameOver(false);
        });

        socket.on("game_over", (list) => {
            setPlayers(list.sort((a, b) => b.score - a.score));
            setGameOver(true);
            setCurrentQ(null);
        });

        socket.on("room_full", () => {
            alert("⚠️ Room is full! Limit reached.");
            setRoomId('');
        });

        return () => socket.off();
    }, []);

    useEffect(() => {
        if (currentQ && timeLeft > 0 && !gameOver) {
            timerRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && currentQ && !hasAnswered) {
            handleAnswer(null);
        }
        return () => clearInterval(timerRef.current);
    }, [timeLeft, currentQ, gameOver]);

    const parseData = (rawText) => {
        const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.includes('|'));
        const parsed = lines.map(line => {
            const p = line.split('|').map(s => s.trim());
            if (p.length >= 6) return { q: p[0], options: [p[1], p[2], p[3], p[4]], ans: p[5] };
            return null;
        }).filter(q => q !== null);

        if (parsed.length > 0) {
            setQuestions(parsed);
            return true;
        }
        return false;
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsParsing(true);
        const reader = new FileReader();
        reader.onload = async function () {
            const typedarray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            let fullText = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                fullText += textContent.items.map(s => s.str).join(" ") + "\n";
            }
            const success = parseData(fullText);
            if (!success) alert("Format Error! Check if text is: Q | A | B | C | D | Ans");
            setIsParsing(false);
        };
        reader.readAsArrayBuffer(file);
    };

    const handleAnswer = (opt) => {
        if (hasAnswered) return;
        setHasAnswered(true);
        setSelectedOption(opt);
        let points = (opt === currentQ.ans) ? timeLeft : 0;
        socket.emit("submit_answer", { roomId, userId, points });
    };

    // --- SCREEN: GAME OVER ---
    if (gameOver) return (
        <div className="h-screen bg-black text-white flex flex-col items-center justify-center p-8">
            <motion.h2 initial={{scale: 0.8}} animate={{scale: 1}} className="text-5xl font-black text-cyan-500 mb-10 italic tracking-tighter">BATTLE REPORT</motion.h2>
            <div className="w-full max-w-md space-y-4">
                {players.map((p, i) => (
                    <motion.div key={i} initial={{x: -20, opacity: 0}} animate={{x: 0, opacity: 1}} transition={{delay: i*0.1}}
                        className={`flex justify-between items-center p-5 rounded-2xl border ${i === 0 ? 'border-yellow-500 bg-yellow-500/10 shadow-[0_0_20px_rgba(234,179,8,0.2)]' : 'border-white/5 bg-zinc-900'}`}>
                        <div className="flex items-center gap-4">
                            <span className="text-2xl font-black text-zinc-600">#{i+1}</span>
                            <span className="font-bold">{p.name} {p.userId === userId && " (YOU)"}</span>
                        </div>
                        <span className="font-black text-cyan-400">{p.score} PT</span>
                    </motion.div>
                ))}
            </div>
            <button onClick={() => window.location.reload()} className="mt-10 bg-white text-black px-12 py-4 rounded-full font-black uppercase text-xs">New Mission</button>
        </div>
    );

    return (
        <div className="h-screen bg-[#08080a] text-white flex flex-col font-sans overflow-hidden">
            {!roomId ? (
                // --- SCREEN: LOGIN ---
                <div className="flex-1 flex flex-col items-center justify-center p-10 space-y-6">
                    <h1 className="text-6xl font-black italic text-cyan-500 tracking-tighter">CYBER<span className="text-white">QUIZ</span></h1>
                    <input placeholder="CALLSIGN" value={userName} onChange={e => setUserName(e.target.value.toUpperCase())} className="w-full max-w-xs bg-zinc-900 p-5 rounded-2xl border border-white/5 text-center font-bold outline-none focus:border-cyan-500" />
                    
                    <div className="w-full max-w-xs bg-zinc-900 p-4 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-zinc-500 text-center mb-2 uppercase font-bold">Player Limit</p>
                        <input type="number" value={maxPlayers} onChange={e => setMaxPlayers(parseInt(e.target.value) || 1)} className="w-full bg-black p-2 rounded text-center text-cyan-400 font-bold outline-none" />
                    </div>

                    <button onClick={() => {
                        if (!userName) return alert("Enter Name");
                        const rid = Math.random().toString(36).substr(2, 5).toUpperCase();
                        setRoomId(rid); setIsCreating(true);
                        socket.emit("join_room", { roomId: rid, userName, userId, maxPlayers });
                    }} className="w-full max-w-xs bg-cyan-500 text-black p-5 rounded-2xl font-black text-xs tracking-widest">HOST MISSION</button>

                    <div className="w-full max-w-xs border-t border-white/5 pt-6 space-y-3">
                        <input placeholder="ROOM ID" id="join_id" className="w-full bg-zinc-900 p-4 rounded-2xl text-center outline-none" />
                        <button onClick={() => {
                            const val = document.getElementById('join_id').value.toUpperCase();
                            if (!val || !userName) return;
                            setRoomId(val);
                            socket.emit("join_room", { roomId: val, userName, userId });
                        }} className="w-full border border-cyan-500/50 text-cyan-500 p-4 rounded-2xl font-bold">JOIN MISSION</button>
                    </div>
                </div>
            ) : isCreating && !currentQ ? (
                // --- SCREEN: HOST LOBBY ---
                <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                    <div className="text-center mb-10">
                        <p className="text-[10px] font-black text-cyan-500 tracking-[8px] uppercase">Frequency ID</p>
                        <h2 className="text-5xl font-black text-white">{roomId}</h2>
                    </div>

                    <div className="w-full max-w-lg space-y-4">
                        {/* INDICATOR BOX */}
                        <div className={`p-6 rounded-3xl border transition-all ${questions.length > 0 ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/5 bg-zinc-900'}`}>
                            <h2 className="text-xs font-bold text-center mb-4 uppercase tracking-widest">
                                {questions.length > 0 ? "✅ Mission Data Locked" : "📁 Upload Mission Data"}
                            </h2>
                            
                            <div className="flex flex-col gap-3">
                                <textarea value={manualText} onChange={(e)=>setManualText(e.target.value)} placeholder="Type manually or Upload PDF..." className="w-full h-20 bg-black/50 p-3 rounded-xl text-[10px] font-mono border border-white/10 outline-none" />
                                <div className="flex gap-2">
                                    <button onClick={()=>parseData(manualText)} className="flex-1 bg-zinc-800 p-2 rounded-lg text-[10px] font-bold">LOAD TEXT</button>
                                    <label className="flex-1 bg-white text-black p-2 rounded-lg text-[10px] font-black text-center cursor-pointer">
                                        {isParsing ? "READING..." : "UPLOAD PDF"}
                                        <input type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* STATUS INDICATOR */}
                        {questions.length > 0 && (
                            <p className="text-center text-emerald-400 font-bold text-xs animate-pulse tracking-widest">
                                {questions.length} QUESTIONS READY FOR BATTLE
                            </p>
                        )}

                        <button onClick={() => socket.emit("start_battle", { roomId, questions })} disabled={questions.length === 0}
                            className={`w-full py-6 rounded-3xl font-black text-xs tracking-[5px] transition-all shadow-2xl ${questions.length > 0 ? 'bg-cyan-500 text-black shadow-cyan-500/20' : 'bg-zinc-800 text-zinc-600 grayscale'}`}>
                            INITIALIZE BATTLE
                        </button>
                    </div>

                    <div className="mt-10 flex gap-4">
                        {players.map((p, i) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                                <span className="text-[8px] text-zinc-500 font-bold">{p.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : currentQ ? (
                // --- SCREEN: GAMEPLAY ---
                <div className="flex-1 flex flex-col p-6">
                    <div className="w-full h-1 bg-zinc-900 rounded-full mb-10 overflow-hidden">
                        <motion.div key={qInfo.index} initial={{ width: "100%" }} animate={{ width: "0%" }} transition={{ duration: 15, ease: "linear" }} className="h-full bg-cyan-400" />
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <h2 className="text-2xl md:text-4xl font-bold text-center mb-12 leading-tight">{currentQ.q}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                            {currentQ.options.map((opt, i) => (
                                <button key={i} disabled={hasAnswered} onClick={() => handleAnswer(opt)}
                                    className={`p-6 rounded-2xl font-bold border-2 text-left transition-all ${selectedOption === opt ? (opt === currentQ.ans ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-red-500 bg-red-500/10 text-red-400') : 'border-white/5 bg-zinc-900 hover:border-white/20'}`}>
                                    <span className="text-cyan-500/40 mr-3 italic">{i+1}</span> {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                // --- SCREEN: WAITING ---
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <h1 className="text-9xl font-black mb-4 italic opacity-10">{roomId}</h1>
                    <p className="text-cyan-500 tracking-[10px] font-bold uppercase animate-pulse text-xs">Waiting for Host...</p>
                </div>
            )}
        </div>
    );
};

export default MultiplePlayer;