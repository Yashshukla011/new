import React, { useState, useEffect, useRef } from 'react';
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";

const socket = io("https://new-1-vev3.onrender.com", {
    transports: ["websocket", "polling"],
    withCredentials: true
});

const MultiplePlayer = () => {
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [players, setPlayers] = useState([]);
  const [maxPlayers, setMaxPlayers] = useState(2);
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

  // 1. Socket Events Listener
  useEffect(() => {
    socket.on("update_players", (data) => {
        setPlayers([...data.players].sort((a, b) => b.score - a.score));
        if(data.maxPlayers) setMaxPlayers(data.maxPlayers);
    });

    socket.on("next_question", (data) => {
      // Clear interval immediately to avoid overlaps
      if (timerRef.current) clearInterval(timerRef.current);
      
      // RESET STATES FOR NEW QUESTION
      setHasAnswered(false);
      setSelectedOption(null);
      setTimeLeft(15); 
      setCurrentQ(data.question);
      setQInfo({ index: data.index, total: data.total });
    });

    socket.on("game_over", (list) => { 
        if (timerRef.current) clearInterval(timerRef.current);
        setPlayers(list.sort((a, b) => b.score - a.score)); 
        setGameOver(true); 
    });

    return () => {
        socket.off();
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // 2. AUTO-SYNC TIMER LOGIC
  useEffect(() => {
    if (currentQ && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } 
    // AGAR TIME KHATAM HO GAYA AUR USER NE JAWAB NAHI DIYA
    else if (timeLeft === 0 && !hasAnswered && currentQ) {
      handleAutoSubmit();
    }
    
    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, currentQ, hasAnswered]);

  const handleAutoSubmit = () => {
    setHasAnswered(true);
    // Server ko 0 points bhejna taki wo agle question par move kar sake
    socket.emit("submit_answer", { roomId, userId, points: 0 });
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleAnswer = (opt) => {
    if (hasAnswered || timeLeft <= 0) return;
    
    setHasAnswered(true);
    setSelectedOption(opt);
    
    // Speed based scoring
    let points = (opt === currentQ.ans) ? timeLeft : 0;
    socket.emit("submit_answer", { roomId, userId, points });
  };

  // --- RENDERING ---
  if (gameOver) {
    return (
      <div className="h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-8">
        <h2 className="text-4xl font-black italic mb-10 text-yellow-500 tracking-tighter">BATTLE RESULTS</h2>
        <div className="w-full max-w-md space-y-3">
          {players.map((p, i) => (
            <div key={p.userId} className={`flex justify-between p-6 rounded-[24px] border ${i === 0 ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/5 bg-[#0d0d0d]'}`}>
              <span className="font-bold uppercase">{i === 0 ? '🏆 ' : ''}{p.name} {p.userId === userId && "(YOU)"}</span>
              <span className="font-black text-yellow-500">{p.score} PTS</span>
            </div>
          ))}
        </div>
        <button onClick={() => window.location.reload()} className="mt-10 bg-white text-black px-12 py-4 rounded-full font-black uppercase text-[10px] tracking-[4px]">Rematch</button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col font-sans overflow-hidden">
      {!roomId ? (
        <div className="flex-1 flex flex-col items-center justify-center p-10 space-y-6">
          <div className="text-center">
            <h1 className="text-6xl font-black italic tracking-tighter">QUIZ<span className="text-emerald-500">BATTLE</span></h1>
            <p className="text-[9px] font-black text-zinc-600 tracking-[10px] uppercase mt-2">PvP Arena v2.0</p>
          </div>
          <input placeholder="ENTER CALLSIGN" value={userName} onChange={e => setUserName(e.target.value.toUpperCase())} className="w-full max-w-xs bg-[#0d0d0d] p-5 rounded-2xl text-center font-black border border-white/5 outline-none" />
          
          <div className="w-full max-w-xs bg-[#0d0d0d] p-5 rounded-2xl border border-white/5">
            <p className="text-[10px] text-center mb-4 font-black text-zinc-600 uppercase">Set Squad Limit</p>
            <div className="flex gap-2">
              {[2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setMaxPlayers(n)} className={`flex-1 py-3 rounded-xl font-black transition-all ${maxPlayers === n ? 'bg-emerald-500 text-black' : 'bg-black text-zinc-700'}`}>{n}P</button>
              ))}
            </div>
          </div>

          <button onClick={() => { 
            if(!userName) return alert("Enter Name!"); 
            const rid = Math.random().toString(36).substr(2, 5).toUpperCase(); 
            setRoomId(rid); 
            socket.emit("join_room", { roomId: rid, userName, userId, maxPlayers }); 
          }} className="w-full max-w-xs bg-white text-black p-5 rounded-2xl font-black text-[10px] tracking-[3px]">INITIALIZE ROOM</button>

          <div className="flex items-center gap-4 w-full max-w-xs text-zinc-800"><hr className="flex-1 border-zinc-900"/><span>OR</span><hr className="flex-1 border-zinc-900"/></div>

          <div className="w-full max-w-xs space-y-2">
            <input placeholder="ROOM CODE" id="r_input" className="w-full bg-[#0d0d0d] p-5 rounded-2xl text-center font-black border border-white/5 outline-none" />
            <button onClick={() => { 
                const val = document.getElementById('r_input').value.toUpperCase(); 
                if(!val || !userName) return alert("Fill all!"); 
                setRoomId(val); 
                socket.emit("join_room", { roomId: val, userName, userId }); 
            }} className="w-full border border-white/10 p-5 rounded-2xl font-black text-[10px] tracking-[3px] text-zinc-500">JOIN FREQUENCY</button>
          </div>
        </div>
      ) : currentQ ? (
        <div className="flex-1 flex flex-col">
          {/* Animated Progress Bar */}
          <div className="w-full h-2 bg-zinc-900">
            <motion.div 
              key={qInfo.index}
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 15, ease: "linear" }}
              className={`h-full ${timeLeft < 5 ? 'bg-red-600' : 'bg-emerald-500'}`}
            />
          </div>

          <div className="p-6 flex justify-between items-center bg-black/40 border-b border-white/5">
            <div>
                <p className="text-emerald-500 text-[10px] font-black tracking-widest uppercase">Wave {qInfo.index + 1}/{qInfo.total}</p>
                <p className={`text-3xl font-black italic ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{timeLeft}s</p>
            </div>
            <div className="text-right">
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Squad Status</p>
                <p className="font-black text-xl text-emerald-500">{players.length}/{maxPlayers}</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <motion.div 
              key={qInfo.index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-2xl bg-[#0d0d0d] p-10 rounded-[48px] border border-white/5 relative"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 leading-tight" dangerouslySetInnerHTML={{ __html: currentQ.q }} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQ.options.map((opt, idx) => (
                  <button key={opt} 
                    disabled={hasAnswered} 
                    onClick={() => handleAnswer(opt)} 
                    className={`p-6 rounded-[24px] font-bold border-2 text-left transition-all ${
                      selectedOption === opt 
                      ? (opt === currentQ.ans ? 'border-emerald-500 bg-emerald-500/10' : 'border-red-500 bg-red-500/10 animate-shake') 
                      : (hasAnswered ? 'opacity-30 border-white/5 bg-zinc-900' : 'border-white/5 bg-zinc-900 hover:border-emerald-500/50')
                    }`}
                  >
                    <span className="opacity-20 mr-3 text-xs italic">0{idx+1}</span>
                    <span dangerouslySetInnerHTML={{ __html: opt }} />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Leaderboard */}
          <div className="p-4 flex gap-3 overflow-x-auto bg-black border-t border-white/5">
            {players.map((p, idx) => (
              <div key={p.userId} className={`min-w-[120px] p-4 rounded-2xl border ${p.userId === userId ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-[#0a0a0a]'}`}>
                <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">Rank #{idx+1}</p>
                <p className="text-xs font-black truncate uppercase">{p.name}</p>
                <p className="text-lg font-black text-emerald-500">{p.score} PT</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-emerald-500 font-black tracking-[10px] text-[10px] mb-4 uppercase animate-pulse">Establishing Connection</p>
          <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 mb-12">
             <h1 className="text-7xl font-black tracking-tighter italic text-white">{roomId}</h1>
             <p className="text-[10px] font-black text-zinc-500 mt-2 uppercase tracking-widest">Frequency ID</p>
          </div>
          
          <div className="w-full max-w-xs space-y-3 mb-12">
            {players.map(p => (
              <div key={p.userId} className="p-5 bg-[#0d0d0d] rounded-2xl border border-white/5 flex justify-between items-center">
                <span className="font-bold text-sm uppercase">{p.name} {p.userId === userId && "(YOU)"}</span>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
            ))}
          </div>

          {players[0]?.userId === userId ? (
            <button onClick={() => socket.emit("start_battle", roomId)} disabled={players.length < maxPlayers} className={`w-full max-w-xs py-6 rounded-full font-black text-[10px] tracking-[4px] ${players.length >= maxPlayers ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-700'}`}>
              {players.length >= maxPlayers ? "INITIALIZE BATTLE" : `WAITING FOR ${maxPlayers - players.length} AGENTS`}
            </button>
          ) : (
            <p className="text-zinc-600 font-black text-[10px] tracking-[4px] uppercase italic">Awaiting Host Authorization...</p>
          )}
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}} />
    </div>
  );
};

export default MultiplePlayer;