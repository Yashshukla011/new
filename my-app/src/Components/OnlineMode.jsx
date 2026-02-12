import React, { useState, useEffect } from 'react';
import { db, auth, fetchQuizData } from './Firebase';
import { doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Trophy, Copy, Check, Zap, ArrowLeft, User, Swords } from 'lucide-react';

const PvPGame = ({ onBack, isDark = true }) => {
  const [roomId, setRoomId] = useState('');
  const [inputRoomId, setInputRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [gameData, setGameData] = useState(null);
  const [playerNum, setPlayerNum] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswering, setIsAnswering] = useState(false);

  // Theme Config for Light/Dark visibility
  const theme = {
    bg: isDark ? 'bg-[#050505]' : 'bg-[#F3F4F6]',
    card: isDark ? 'bg-[#0d0d0d]/80 backdrop-blur-xl border-white/5 shadow-2xl' : 'bg-white border-zinc-200 shadow-xl',
    input: isDark ? 'bg-black/50 border-white/10 text-cyan-400' : 'bg-white border-zinc-300 text-slate-900',
    text: isDark ? 'text-white' : 'text-slate-900',
    sub: isDark ? 'text-zinc-500' : 'text-slate-500'
  };

  // --- Logic Parts (Retained from your original code) ---
  const createRoom = async () => {
    if (!playerName.trim()) return alert("Enter your name first!");
    setLoading(true);
    const id = Math.random().toString(36).substring(2, 7).toUpperCase();
    const questions = await fetchQuizData();
    const roomRef = doc(db, "rooms", id);
    const initialData = {
      questions,
      player1: { id: auth.currentUser?.uid || 'anon1', name: playerName, score: 0, hasAnswered: false },
      player2: null,
      status: "waiting",
      currentQuestionIndex: 0,
      turn: "player1" 
    };
    await setDoc(roomRef, initialData);
    setRoomId(id);
    setPlayerNum(1);
    setLoading(false);
  };

  const joinRoom = async () => {
    if (!playerName.trim() || !inputRoomId) return alert("Missing details!");
    setLoading(true);
    const roomRef = doc(db, "rooms", inputRoomId);
    const roomSnap = await getDoc(roomRef);
    if (roomSnap.exists()) {
      await updateDoc(roomRef, {
        player2: { id: auth.currentUser?.uid || 'anon2', name: playerName, score: 0, hasAnswered: false },
        status: "playing"
      });
      setRoomId(inputRoomId);
      setPlayerNum(2);
    } else { alert("Room not found!"); }
    setLoading(false);
  };

  useEffect(() => {
    if (!roomId) return;
    const unsub = onSnapshot(doc(db, "rooms", roomId), (doc) => {
      const data = doc.data();
      setGameData(data);
      setSelectedOption(null);
      setIsAnswering(false);
    });
    return () => unsub();
  }, [roomId]);

  const handleAnswer = async (selected) => {
    const myKey = playerNum === 1 ? 'player1' : 'player2';
    const opponentKey = playerNum === 1 ? 'player2' : 'player1';
    if (gameData.turn !== myKey || gameData[myKey].hasAnswered || isAnswering) return;

    const currentIdx = gameData.currentQuestionIndex;
    const currentQ = gameData.questions[currentIdx];
    const isCorrect = selected === currentQ.correctAnswer;
    
    setSelectedOption(selected);
    setIsAnswering(true);

    const roomRef = doc(db, "rooms", roomId);
    const newScore = isCorrect ? gameData[myKey].score + 10 : gameData[myKey].score;

    setTimeout(async () => {
      if (gameData[opponentKey].hasAnswered) {
        await updateDoc(roomRef, {
          [`${myKey}.score`]: newScore,
          [`${myKey}.hasAnswered`]: false, 
          [`${opponentKey}.hasAnswered`]: false,
          currentQuestionIndex: currentIdx + 1,
          turn: "player1" 
        });
      } else {
        await updateDoc(roomRef, {
          [`${myKey}.score`]: newScore,
          [`${myKey}.hasAnswered`]: true,
          turn: opponentKey 
        });
      }
    }, 1200);
  };

  // --- UI: START SCREEN ---
  if (!roomId) return (
    <div className={`h-screen ${theme.bg} flex items-center justify-center p-6 transition-colors duration-500`}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`w-full max-w-md p-10 rounded-[3.5rem] border-2 ${theme.card}`}>
        <div className="flex justify-center mb-6"><div className="p-4 bg-purple-500/10 rounded-3xl text-purple-500"><Globe size={32} /></div></div>
        <h1 className={`text-5xl font-black text-center mb-10 italic tracking-tighter ${theme.text}`}>ARENA<span className="text-purple-500">.XP</span></h1>
        
        <div className="space-y-6">
          <input placeholder="ENTER CALLSIGN" value={playerName} onChange={(e) => setPlayerName(e.target.value.toUpperCase())} className={`w-full p-5 rounded-2xl border-2 font-black text-center outline-none focus:border-purple-500 transition-all ${theme.input}`} />
          <button onClick={createRoom} className="w-full py-5 bg-purple-600 text-white font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs">
            {loading ? "INITIALIZING..." : "Create Battle Room"}
          </button>
          <div className="flex items-center gap-4 py-2"><div className="h-[1px] flex-1 bg-zinc-500/20"></div><span className="text-[10px] font-black opacity-30">OR JOIN</span><div className="h-[1px] flex-1 bg-zinc-500/20"></div></div>
          <input placeholder="ROOM ID" value={inputRoomId} onChange={(e) => setInputRoomId(e.target.value.toUpperCase())} className={`w-full p-5 rounded-2xl border-2 font-black text-center outline-none ${theme.input}`} />
          <button onClick={joinRoom} className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-emerald-400 shadow-lg shadow-emerald-500/20">Connect to Frequency</button>
        </div>
        <button onClick={onBack} className="w-full mt-8 text-[10px] font-black uppercase opacity-30 hover:opacity-100 transition-opacity tracking-widest">Abort Mission</button>
      </motion.div>
    </div>
  );

  // --- UI: WAITING ROOM ---
  if (gameData?.status === "waiting") return (
    <div className={`h-screen ${theme.bg} flex items-center justify-center p-6`}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className={`w-full max-w-sm p-12 rounded-[4rem] text-center border-2 ${theme.card}`}>
        <p className={`${theme.sub} text-[10px] font-black uppercase tracking-widest mb-4`}>Room Access Key</p>
        <div className="bg-black/20 p-6 rounded-3xl border border-white/5 mb-8">
            <h1 className="text-6xl font-black text-purple-500 tracking-tighter">{roomId}</h1>
        </div>
        <p className={`text-xs font-bold animate-pulse uppercase ${theme.sub}`}>Waiting for challenger...</p>
      </motion.div>
    </div>
  );

  // --- UI: GAME OVER ---
  if (gameData?.currentQuestionIndex >= 10) {
    const p1 = gameData.player1;
    const p2 = gameData.player2;
    const winner = p1.score > p2.score ? p1.name : (p2.score > p1.score ? p2.name : "TIE");

    return (
      <div className={`h-screen ${theme.bg} flex items-center justify-center p-6 text-white`}>
        <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className={`w-full max-w-md p-12 rounded-[4rem] text-center border-2 ${theme.card}`}>
          <Trophy size={64} className="text-yellow-500 mx-auto mb-6" />
          <h1 className={`text-5xl font-black italic mb-2 tracking-tighter ${theme.text}`}>FINISH</h1>
          <p className="text-purple-500 font-black tracking-widest mb-10 uppercase text-xs">{winner} DOMINATED</p>
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-purple-500/10 p-8 rounded-[2.5rem] border-2 border-purple-500/20">
              <p className="text-[10px] text-purple-500 font-black mb-1 uppercase">{p1.name}</p>
              <p className={`text-5xl font-black italic ${theme.text}`}>{p1.score}</p>
            </div>
            <div className="bg-emerald-500/10 p-8 rounded-[2.5rem] border-2 border-emerald-500/20">
              <p className="text-[10px] text-emerald-500 font-black mb-1 uppercase">{p2?.name}</p>
              <p className={`text-5xl font-black italic ${theme.text}`}>{p2?.score}</p>
            </div>
          </div>
          <button onClick={() => window.location.reload()} className="w-full py-6 bg-slate-900 dark:bg-white dark:text-black text-white font-black rounded-3xl uppercase tracking-widest text-xs shadow-2xl">Re-Deploy</button>
        </motion.div>
      </div>
    );
  }

  // --- UI: GAME ARENA ---
  const myKey = playerNum === 1 ? 'player1' : 'player2';
  const isMyTurn = gameData?.turn === myKey;
  const currentQ = gameData?.questions?.[gameData.currentQuestionIndex];

  return (
    <div className={`h-screen ${theme.bg} ${theme.text} flex flex-col overflow-hidden transition-all duration-500`}>
      {/* Dynamic HUD Bar */}
      <div className={`p-6 flex justify-between items-center border-b ${isDark ? 'bg-black/50 border-white/5' : 'bg-white border-zinc-200 shadow-sm'}`}>
        <div className={playerNum === 1 ? 'scale-110' : 'opacity-20'}>
          <p className="text-[10px] font-black text-purple-500 tracking-widest uppercase">{gameData?.player1.name}</p>
          <p className="text-4xl font-black italic tracking-tighter">{gameData?.player1.score}</p>
        </div>
        <div className="px-5 py-2 rounded-2xl bg-zinc-500/10 text-[10px] font-black tracking-widest border border-zinc-500/20">
          WAVE {(gameData?.currentQuestionIndex || 0) + 1}/10
        </div>
        <div className={`text-right ${playerNum === 2 ? 'scale-110' : 'opacity-20'}`}>
          <p className="text-[10px] font-black text-emerald-500 tracking-widest uppercase">{gameData?.player2?.name || "???"}</p>
          <p className="text-4xl font-black italic tracking-tighter">{gameData?.player2?.score || 0}</p>
        </div>
      </div>

      {/* Modern Status Bar */}
      <div className={`py-3 text-center font-black text-[10px] tracking-[0.8em] transition-all uppercase ${isMyTurn ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-purple-600 text-white'}`}>
        {isMyTurn ? "⚡ YOUR TURN TO STRIKE" : `⏳ WAITING FOR ${playerNum === 1 ? gameData?.player2?.name : gameData?.player1?.name}...`}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {currentQ && (
            <motion.div key={gameData.currentQuestionIndex} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className={`w-full max-w-2xl p-10 md:p-16 rounded-[4rem] border-2 relative overflow-hidden ${theme.card}`}>
              <div className={`absolute top-0 inset-x-0 h-2 ${isMyTurn ? 'bg-emerald-500 shadow-[0_0_15px_emerald]' : 'bg-purple-500 opacity-20'}`} />
              
              <h2 className="text-2xl md:text-4xl font-black text-center mb-16 leading-tight italic tracking-tight" dangerouslySetInnerHTML={{ __html: currentQ.question }} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQ.options.map((opt, i) => {
                  const isSelected = selectedOption === opt;
                  const isCorrect = opt === currentQ.correctAnswer;
                  let stateStyle = isDark ? 'bg-white/5 border-white/5' : 'bg-zinc-50 border-zinc-100';
                  
                  if (isSelected) {
                    stateStyle = isCorrect 
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105" 
                      : "bg-red-500 border-red-500 text-white animate-shake";
                  }

                  return (
                    <button key={i} disabled={!isMyTurn || isAnswering} onClick={() => handleAnswer(opt)} className={`p-6 rounded-[2.5rem] border-2 text-left font-black transition-all active:scale-95 ${stateStyle} ${!isMyTurn && !isSelected ? 'opacity-20 grayscale cursor-not-allowed' : ''}`}>
                      <span className="opacity-30 mr-4">0{i+1}</span> <span className="uppercase text-sm" dangerouslySetInnerHTML={{ __html: opt }} />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}} />
    </div>
  );
};

export default PvPGame;