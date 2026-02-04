import React, { useState, useEffect, useRef } from 'react';
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

const ChatBox = ({ isChatOpen, setIsChatOpen, messages, userName, roomId }) => {
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isChatOpen]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && roomId) {
      socket.emit("send_message", { roomId, sender: userName || "Player", text: newMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
      setNewMessage("");
    }
  };

  return (
    <div className={`fixed bottom-24 right-6 w-80 h-[450px] bg-[#0f0f0f] border border-white/10 rounded-[32px] shadow-2xl flex flex-col z-50 transition-all duration-300 ${isChatOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#151515] rounded-t-[32px]">
        <div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div><span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live Battle Chat</span></div>
        <button onClick={() => setIsChatOpen(false)} className="text-zinc-500 hover:text-white">✕</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.sender === userName ? 'items-end' : m.sender === "System" ? 'items-center' : 'items-start'}`}>
            {m.sender !== "System" && <span className="text-[9px] text-zinc-600 mb-1 font-bold">{m.sender === userName ? "YOU" : m.sender} • {m.time}</span>}
            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[13px] ${m.sender === userName ? 'bg-emerald-500 text-black rounded-tr-none' : m.sender === "System" ? 'bg-white/5 text-emerald-400 text-[10px] italic border border-emerald-500/10' : 'bg-zinc-800 text-white rounded-tl-none'}`}>{m.text}</div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={sendMessage} className="p-4 bg-[#0a0a0a] rounded-b-[32px] border-t border-white/5 flex gap-2">
        <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type message..." className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-emerald-500/50" />
        <button type="submit" className="bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black">SEND</button>
      </form>
    </div>
  );
};

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
  const [messages, setMessages] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // --- NEW: Timer States ---
  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef(null);

  const [userId] = useState(() => {
    let id = sessionStorage.getItem('battle_uid') || 'U-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    sessionStorage.setItem('battle_uid', id);
    return id;
  });

  useEffect(() => {
    socket.on("update_players", (data) => setPlayers([...data.players].sort((a, b) => b.score - a.score)));
    socket.on("game_over", (list) => { setPlayers(list.sort((a, b) => b.score - a.score)); setGameOver(true); });
    socket.on("receive_message", (msg) => setMessages(prev => [...prev, msg]));
    
    socket.on("next_question", (data) => {
      setQInfo({ index: data.index, total: data.total });
      setCurrentQ(data.question);
      setHasAnswered(false);
      setSelectedOption(null);
      setTimeLeft(15); // Reset Timer
    });

    return () => { socket.off(); clearInterval(timerRef.current); };
  }, []);

  // --- Timer Logic ---
  useEffect(() => {
    if (currentQ && !hasAnswered && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !hasAnswered) {
      handleAnswer(null); // Auto-submit on timeout
    }
    return () => clearInterval(timerRef.current);
  }, [timeLeft, currentQ, hasAnswered]);

  const handleAnswer = (opt) => {
    if (hasAnswered) return;
    setHasAnswered(true);
    setSelectedOption(opt);
    clearInterval(timerRef.current);

    // Dynamic Scoring: Time left = Points (Max 15, Min 0)
    let points = 0;
    if (opt === currentQ.ans) {
      points = timeLeft > 0 ? timeLeft : 1; 
    }
    socket.emit("submit_answer", { roomId, userId, points });
  };

  if (gameOver) {
    return (
      <div className="h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <h2 className="text-6xl font-black italic mb-10 text-yellow-500 tracking-tighter">BATTLE OVER</h2>
        <div className="w-full max-w-md space-y-3">
          {players.map((p, i) => (
            <div key={p.userId} className={`flex justify-between p-6 rounded-[28px] border ${i === 0 ? 'border-yellow-500 bg-yellow-500/10 shadow-[0_0_30px_rgba(234,179,8,0.15)]' : 'border-white/5 bg-[#0a0a0a]'}`}>
              <span className="font-bold text-lg uppercase">{i === 0 ? '👑 ' : ''}{p.name}</span>
              <span className="font-black text-xl text-yellow-500">{p.score} PT</span>
            </div>
          ))}
        </div>
        <button onClick={() => window.location.reload()} className="mt-12 bg-white text-black px-12 py-4 rounded-2xl font-black uppercase text-xs tracking-widest">Rematch</button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black text-white flex flex-col relative font-sans overflow-hidden">
      <ChatBox isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} messages={messages} userName={userName} roomId={roomId} />
      
      {!roomId ? (
        <div className="flex-1 flex flex-col items-center justify-center p-10 space-y-4">
          <h1 className="text-5xl font-black italic mb-8 tracking-tighter">QUIZ<span className="text-emerald-500">BATTLE</span></h1>
          <input placeholder="ENTER NAME" value={userName} onChange={e => setUserName(e.target.value.toUpperCase())} className="w-full max-w-xs bg-[#0a0a0a] p-5 rounded-2xl text-center font-bold border border-white/5 outline-none focus:border-emerald-500" />
          <div className="w-full max-w-xs bg-[#0a0a0a] p-4 rounded-2xl border border-white/5">
            <p className="text-[10px] text-center mb-3 font-black text-zinc-700 uppercase">Player Limit</p>
            <div className="flex gap-2">
              {[2, 3, 4].map(n => <button key={n} onClick={() => setMaxPlayers(n)} className={`flex-1 py-2 rounded-xl font-bold transition-all ${maxPlayers === n ? 'bg-emerald-500 text-black' : 'bg-black text-zinc-600'}`}>{n}P</button>)}
            </div>
          </div>
          <button onClick={() => { if(!userName) return alert("Enter Name!"); const rid = Math.random().toString(36).substr(2, 5).toUpperCase(); setRoomId(rid); socket.emit("join_room", { roomId: rid, userName, userId, maxPlayers }); }} className="w-full max-w-xs bg-white text-black p-5 rounded-2xl font-black text-xs hover:bg-emerald-400 transition-all">CREATE BATTLE</button>
          <input placeholder="ROOM CODE" id="r_input" className="w-full max-w-xs bg-[#0a0a0a] p-5 rounded-2xl text-center font-bold border border-white/5 outline-none" />
          <button onClick={() => { const val = document.getElementById('r_input').value.toUpperCase(); if(!val || !userName) return alert("Fill all!"); setRoomId(val); socket.emit("join_room", { roomId: val, userName, userId }); }} className="w-full max-w-xs border border-white/10 p-5 rounded-2xl font-black text-xs text-zinc-500 hover:text-white">JOIN BATTLE</button>
        </div>
      ) : currentQ ? (
        <div className="flex-1 flex flex-col">
          {/* Animated Progress Bar */}
          <div className="w-full h-1.5 bg-zinc-900">
            <div 
              className={`h-full transition-all duration-1000 ease-linear ${timeLeft < 5 ? 'bg-red-500' : 'bg-emerald-500'}`}
              style={{ width: `${(timeLeft / 15) * 100}%` }}
            ></div>
          </div>

          <div className="p-6 flex justify-between items-center">
            <div className="flex flex-col">
               <span className="font-black text-zinc-500 uppercase text-[10px]">Question {qInfo.index + 1}/{qInfo.total}</span>
               <span className={`text-2xl font-black ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{timeLeft}s</span>
            </div>
            <button onClick={() => setIsChatOpen(!isChatOpen)} className="bg-[#0a0a0a] p-3 rounded-full relative border border-white/5 shadow-xl">💬</button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-2xl bg-[#0a0a0a] p-10 rounded-[40px] border border-white/5 shadow-2xl relative">
              <h2 className="text-2xl font-bold text-center mb-10 leading-snug" dangerouslySetInnerHTML={{ __html: currentQ.q }} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQ.options.map(opt => (
                  <button key={opt} disabled={hasAnswered} onClick={() => handleAnswer(opt)} 
                    className={`p-5 rounded-2xl font-bold border-2 transition-all ${selectedOption === opt ? (opt === currentQ.ans ? 'border-emerald-500 bg-emerald-500/10' : 'border-red-500 bg-red-500/10') : 'border-white/5 bg-zinc-900/50'}`} 
                    dangerouslySetInnerHTML={{ __html: opt }} />
                ))}
              </div>
            </div>
            {hasAnswered && <p className="mt-8 text-emerald-500 animate-pulse font-black text-[10px] tracking-[4px] uppercase">Waiting for others...</p>}
          </div>

          <div className="p-6 flex justify-center gap-3 overflow-x-auto bg-[#0a0a0a] border-t border-white/5">
            {players.map((p, idx) => (
              <div key={p.userId} className={`min-w-[100px] p-3 rounded-xl border ${p.userId === userId ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/5'}`}>
                <p className="text-[8px] font-bold text-zinc-600 uppercase">#{idx+1} {p.name}</p>
                <p className="text-sm font-black">{p.score} PT</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-emerald-500 font-black tracking-[10px] text-[10px] mb-4 uppercase">Battle Room</p>
          <h1 className="text-8xl font-black mb-12 tracking-tighter italic drop-shadow-2xl">{roomId}</h1>
          <div className="w-full max-w-xs space-y-3 mb-12">
            {players.map(p => (
              <div key={p.userId} className="p-5 bg-[#0a0a0a] rounded-3xl border border-white/5 flex justify-between items-center transition-all">
                <span className="font-bold text-sm uppercase tracking-tight">{p.name} {p.userId === userId && "(YOU)"}</span>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
              </div>
            ))}
          </div>
          {players[0]?.userId === userId ? (
            <button onClick={() => socket.emit("start_battle", roomId)} disabled={players.length < maxPlayers} className={`w-full max-w-xs py-5 rounded-[28px] font-black text-xs tracking-[3px] shadow-2xl transition-all ${players.length >= maxPlayers ? 'bg-white text-black hover:bg-emerald-400' : 'bg-zinc-900 text-zinc-700'}`}>
              {players.length >= maxPlayers ? "START BATTLE" : `WAITING FOR ${maxPlayers - players.length} MORE`}
            </button>
          ) : <p className="text-zinc-600 font-bold text-[10px] tracking-widest animate-pulse uppercase">Waiting for Host...</p>}
        </div>
      )}
    </div>
  );
};

export default MultiplePlayer;