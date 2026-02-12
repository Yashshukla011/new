import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Volume2, VolumeX, ArrowLeft, RotateCcw, Play } from 'lucide-react'; // Icons ke liye

// Audio setup (Public folder mein file names check kar lein)
const foodAudio = new Audio('/background music.mp3');
const gameOverAudio = new Audio('/game-over-275058.mp3');
const moveAudio = new Audio('/direction.mp3');

const ProfessionalSnake = ({ onBack }) => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [dir, setDir] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [hiScore, setHiScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(150);
  const boardSize = 20;

  // Sound toggle helper
  const playSound = (audio) => {
    if (!isMuted) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("hiscore");
    if (saved) setHiScore(JSON.parse(saved));
  }, []);

  const generateFood = useCallback(() => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * boardSize) + 1,
        y: Math.floor(Math.random() * boardSize) + 1,
      };
      const collision = snake.some(s => s.x === newFood.x && s.y === newFood.y);
      if (!collision) break;
    }
    return newFood;
  }, [snake]);

  const moveSnake = useCallback(() => {
    if (dir.x === 0 && dir.y === 0 || isGameOver) return;

    const newSnake = [...snake];
    const head = { x: newSnake[0].x + dir.x, y: newSnake[0].y + dir.y };

    if (head.x <= 0 || head.x > boardSize || head.y <= 0 || head.y > boardSize || 
        newSnake.some(s => s.x === head.x && s.y === head.y)) {
      playSound(gameOverAudio);
      setIsGameOver(true);
      return;
    }

    newSnake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      playSound(foodAudio);
      setScore(s => {
        const ns = s + 1;
        if (ns > hiScore) {
          setHiScore(ns);
          localStorage.setItem("hiscore", JSON.stringify(ns));
        }
        // Speed badhana har 5 score par
        if (ns % 5 === 0) setGameSpeed(prev => Math.max(prev - 10, 60));
        return ns;
      });
      setFood(generateFood());
    } else {
      newSnake.pop();
    }
    setSnake(newSnake);
  }, [snake, dir, food, hiScore, isGameOver, isMuted]);

  useEffect(() => {
    const loop = setInterval(moveSnake, gameSpeed);
    return () => clearInterval(loop);
  }, [moveSnake, gameSpeed]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e) => {
      if (isGameOver) return;
      const keys = {
        ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }
      };
      if (keys[e.key]) {
        const newDir = keys[e.key];
        // Reverse direction block
        if (newDir.x !== -dir.x || newDir.y !== -dir.y) {
          setDir(newDir);
          playSound(moveAudio);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dir, isGameOver, isMuted]);

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 text-white font-sans selection:bg-cyan-500">
      
      {/* Top Bar */}
      <div className="w-full max-w-[450px] flex justify-between items-center mb-6 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-all">
          <ArrowLeft size={24} />
        </button>
        
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">Score</span>
          <span className="text-2xl font-black">{score}</span>
        </div>

        <button onClick={() => setIsMuted(!isMuted)} className="p-2 hover:bg-white/10 rounded-full transition-all">
          {isMuted ? <VolumeX size={24} className="text-red-400" /> : <Volume2 size={24} className="text-cyan-400" />}
        </button>
      </div>

      {/* Game Board Container */}
      <div className="relative group">
        {/* Glow Effect Background */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        
        <div 
          className="relative bg-[#1e293b] rounded-xl border-2 border-white/10 overflow-hidden shadow-2xl"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
            gridTemplateRows: `repeat(${boardSize}, 1fr)`,
            width: 'min(90vw, 420px)',
            height: 'min(90vw, 420px)'
          }}
        >
          {snake.map((s, i) => (
            <div
              key={i}
              className={`transition-all duration-150 ${i === 0 ? 'bg-cyan-400 shadow-[0_0_15px_#22d3ee] z-20 rounded-sm' : 'bg-cyan-600/60 rounded-sm'}`}
              style={{ gridColumnStart: s.x, gridRowStart: s.y }}
            />
          ))}

          <div
            className="bg-fuchsia-500 shadow-[0_0_20px_#d946ef] rounded-full scale-75 animate-bounce"
            style={{ gridColumnStart: food.x, gridRowStart: food.y }}
          />

          {isGameOver && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-in zoom-in duration-300">
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-2">CRASHED!</h2>
              <p className="text-slate-400 mb-6 font-medium">Best Score: {hiScore}</p>
              <button 
                onClick={() => { setSnake([{ x: 10, y: 10 }]); setDir({ x: 0, y: 0 }); setScore(0); setIsGameOver(false); }}
                className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 px-8 py-3 rounded-xl font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/40"
              >
                <RotateCcw size={20} /> RESTART
              </button>
            </div>
          )}

          {dir.x === 0 && dir.y === 0 && !isGameOver && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/10 px-6 py-3 rounded-full backdrop-blur-md border border-white/20 animate-pulse text-sm font-bold tracking-widest">
                PRESS ANY ARROW TO START
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Controls (Sirf chote screens par dikhenge) */}
      <div className="mt-8 grid grid-cols-3 gap-2 md:hidden">
        <div />
        <button onClick={() => dir.y !== 1 && setDir({ x: 0, y: -1 })} className="p-4 bg-white/5 rounded-xl border border-white/10 active:bg-cyan-500/20">▲</button>
        <div />
        <button onClick={() => dir.x !== 1 && setDir({ x: -1, y: 0 })} className="p-4 bg-white/5 rounded-xl border border-white/10 active:bg-cyan-500/20">◀</button>
        <button onClick={() => dir.y !== -1 && setDir({ x: 0, y: 1 })} className="p-4 bg-white/5 rounded-xl border border-white/10 active:bg-cyan-500/20">▼</button>
        <button onClick={() => dir.x !== -1 && setDir({ x: 1, y: 0 })} className="p-4 bg-white/5 rounded-xl border border-white/10 active:bg-cyan-500/20">▶</button>
      </div>

      <p className="mt-8 text-slate-500 text-xs tracking-[0.2em] font-bold">HI-SCORE: {hiScore}</p>
    </div>
  );
};

export default ProfessionalSnake;