import React, { useState, useEffect } from 'react';
import { db, auth, fetchQuizData } from './Firebase';
import { doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';

const PvPGame = () => {
  const [roomId, setRoomId] = useState('');
  const [inputRoomId, setInputRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [gameData, setGameData] = useState(null);
  const [playerNum, setPlayerNum] = useState(null); 
  const [loading, setLoading] = useState(false);

  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswering, setIsAnswering] = useState(false);

  const createRoom = async () => {
    if (!playerName.trim()) return alert("Please enter your name first!");
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
    if (!playerName.trim()) return alert("Please enter your name first!");
    if (!inputRoomId) return alert("Enter Room ID");
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
    } else {
      alert("Room not found!");
    }
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
    const myData = gameData[myKey];
    const opponentData = gameData[opponentKey];
    const newScore = isCorrect ? myData.score + 10 : myData.score;

    
    setTimeout(async () => {
      if (opponentData.hasAnswered) {
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
    }, 1000);
  };

  // GAME OVER SCREEN 
  if (gameData?.currentQuestionIndex >= 10) {
    const p1 = gameData.player1;
    const p2 = gameData.player2;
    const winner = p1.score > p2.score ? `${p1.name} WON!` : (p2.score > p1.score ? `${p2.name} WON!` : "IT'S A TIE!");

    return (
      <div className="h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="relative p-1">
          <div className="absolute -inset-1 bg-yellow-500 rounded-3xl blur opacity-25"></div>
          <div className="relative bg-[#16181a] border border-gray-800 p-10 rounded-3xl shadow-2xl">
            <h1 className="text-5xl font-black text-yellow-500 mb-2 italic tracking-tighter">GAME OVER</h1>
            <h2 className="text-2xl font-bold text-cyan-400 mb-8 uppercase tracking-widest">{winner}</h2>
            <div className="grid grid-cols-2 gap-8 mb-10">
              <div className="bg-black/40 p-6 rounded-2xl border-t-2 border-cyan-500">
                <p className="text-gray-500 text-[10px] font-bold uppercase mb-2">{p1.name}</p>
                <p className="text-5xl font-black text-white">{p1.score}</p>
              </div>
              <div className="bg-black/40 p-6 rounded-2xl border-t-2 border-pink-500">
                <p className="text-gray-500 text-[10px] font-bold uppercase mb-2">{p2.name}</p>
                <p className="text-5xl font-black text-white">{p2.score}</p>
              </div>
            </div>
            <button onClick={() => window.location.reload()} className="w-full bg-white text-black py-4 rounded-xl font-black hover:bg-gray-200 uppercase tracking-widest">Play Again</button>
          </div>
        </div>
      </div>
    );
  }

  //START SCREEN 
  if (!roomId) {
    return (
      <div className="h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="text-center mb-8">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-gray-200 uppercase">Battle<span className="text-gray-500">Zone</span></h1>
          <p className="text-sm tracking-[0.5em] text-cyan-400 mt-2 uppercase font-bold">Online Multiplayer</p>
        </div>
        <div className="w-full max-w-md space-y-6">
          <input placeholder="ENTER YOUR NAME" value={playerName} onChange={(e) => setPlayerName(e.target.value.toUpperCase())} className="w-full bg-black border-2 border-gray-800 p-5 rounded-2xl text-center font-black text-xl text-cyan-400 focus:border-cyan-500 outline-none" />
          <button onClick={createRoom} className="w-full relative h-[100px] bg-[#16181a] border border-gray-800 hover:border-cyan-500/50 rounded-2xl flex flex-col items-center justify-center active:scale-95 transition-all">
            <span className="text-2xl font-black uppercase tracking-widest">{loading ? "Wait..." : "Create Room"}</span>
          </button>
          <div className="flex flex-col space-y-3">
            <input placeholder="ROOM ID" value={inputRoomId} onChange={(e) => setInputRoomId(e.target.value.toUpperCase())} className="w-full bg-black border-2 border-gray-800 p-5 rounded-2xl text-center font-black text-white outline-none" />
            <button onClick={joinRoom} className="w-full h-[70px] bg-emerald-600 rounded-2xl font-black text-xl hover:bg-emerald-500 active:scale-95 uppercase">Join game </button>
          </div>
        </div>
      </div>
    );
  }

  
  if (gameData?.status === "waiting") {
    return (
      <div className="h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center">
        <div className="bg-[#111] border border-gray-800 p-12 rounded-[40px] text-center">
          <p className="text-gray-400 mb-2 font-bold uppercase text-xs">Hi {playerName}!</p>
          <h1 className="text-7xl font-black text-cyan-400 tracking-[0.2em] animate-pulse">{roomId}</h1>
          <p className="mt-8 text-gray-400 font-bold uppercase text-[10px]">Waiting for opponent...</p>
        </div>
      </div>
    );
  }

  const myKey = playerNum === 1 ? 'player1' : 'player2';
  const isMyTurn = gameData?.turn === myKey;
  const currentQuestion = gameData?.questions?.[gameData.currentQuestionIndex];

  return (
    <div className="h-screen bg-[#0a0a0a] text-white p-4 flex flex-col font-sans overflow-hidden">
      <div className="flex-none flex justify-between items-center bg-[#111] border border-gray-800 p-4 rounded-2xl mb-4 shadow-xl">
        <div className="text-left">
          <p className="text-[10px] text-cyan-400 font-black uppercase">{gameData?.player1.name}</p>
          <p className="text-2xl font-black">{gameData?.player1.score}</p>
        </div>
        <div className="text-center font-bold">{(gameData?.currentQuestionIndex || 0) + 1}/10</div>
        <div className="text-right">
          <p className="text-[10px] text-pink-400 font-black uppercase">{gameData?.player2?.name || "Player 2"}</p>
          <p className="text-2xl font-black">{gameData?.player2?.score || 0}</p>
        </div>
      </div>

      <div className={`flex-none text-center py-2 rounded-xl font-black mb-4 border-b-2 ${
        isMyTurn ? 'bg-emerald-900/20 border-emerald-500 text-emerald-400' : 'bg-orange-900/20 border-orange-500 text-orange-400'
      }`}>
        {isMyTurn ? "⚡ YOUR TURN" : `⏳ WAITING FOR ${playerNum === 1 ? gameData?.player2?.name : gameData?.player1?.name}...`}
      </div>

      {currentQuestion && (
        <div className="flex-grow overflow-y-auto pb-6">
          <div className="max-w-2xl mx-auto w-full">
            <div className="relative bg-[#16181a] border border-gray-800 p-6 md:p-10 rounded-3xl shadow-2xl">
              <h3 className="text-xl md:text-3xl font-bold text-center mb-8 leading-tight text-gray-100" dangerouslySetInnerHTML={{__html: currentQuestion.question}}></h3>
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((opt, i) => {
                  const isSelected = selectedOption === opt;
                  const isCorrect = opt === currentQuestion.correctAnswer;
                  
                  
                  let btnClass = "bg-black/40 border-gray-800 hover:border-cyan-500";
                  if (isSelected) {
                    btnClass = isCorrect 
                      ? "bg-emerald-500/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-105" 
                      : "bg-red-500/20 border-red-500 animate-shake";
                  }

                  return (
                    <button 
                      key={i} 
                      disabled={!isMyTurn || isAnswering}
                      onClick={() => handleAnswer(opt)}
                      className={`w-full p-4 rounded-2xl text-left border-2 transition-all duration-300 flex items-center ${btnClass} ${!isMyTurn && !isSelected ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 text-xs font-bold ${isSelected ? (isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white') : 'bg-gray-800 text-cyan-400'}`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="flex-1 font-bold" dangerouslySetInnerHTML={{__html: opt}}></span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}} />
    </div>
  );
};

export default PvPGame;