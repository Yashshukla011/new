import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Trophy, User, ArrowLeft, RotateCcw, Zap } from 'lucide-react';

const fallbackQuestions = [
  { 
    question: "Which planet is known as the Red Planet?", 
    correct_answer: "Mars", 
    incorrect_answers: ["Venus", "Jupiter", "Saturn"] 
  },
  { 
    question: "What is the capital of France?", 
    correct_answer: "Paris", 
    incorrect_answers: ["London", "Berlin", "Madrid"] 
  }
];

const Local = ({ onBack, isDark = true }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [activePlayer, setActivePlayer] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [names, setNames] = useState({ p1: '', p2: '' });
  const [isStarted, setIsStarted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswering, setIsAnswering] = useState(false);

  // Theme Logic
  const theme = {
    bg: isDark ? 'bg-[#050505]' : 'bg-[#F3F4F6]',
    card: isDark ? 'bg-[#0d0d0d] border-white/5' : 'bg-white border-zinc-200 shadow-xl',
    input: isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-zinc-50 border-zinc-300 text-slate-900',
    text: isDark ? 'text-white' : 'text-slate-900',
    subText: isDark ? 'text-zinc-500' : 'text-slate-500'
  };

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
        const data = await response.json();
        setQuestions(data.results && data.results.length > 0 ? data.results : fallbackQuestions);
      } catch (error) {
        setQuestions(fallbackQuestions);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, []);

  const handleAnswer = (selected) => {
    if (isAnswering) return;
    const currentQ = questions[currentIndex];
    const isCorrect = selected === currentQ.correct_answer;
    setSelectedOption(selected);
    setIsAnswering(true);

    setTimeout(() => {
      if (isCorrect) {
        setScores(prev => ({
          ...prev,
          [activePlayer === 1 ? 'p1' : 'p2']: prev[activePlayer === 1 ? 'p1' : 'p2'] + 10
        }));
      }
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setActivePlayer(activePlayer === 1 ? 2 : 1);
        setSelectedOption(null);
        setIsAnswering(false);
      } else {
        setGameOver(true);
      }
    }, 1200);
  };

  // 1. NAME INPUT SCREEN
  if (!isStarted) return (
    <div className={`h-screen ${theme.bg} flex items-center justify-center p-6 transition-colors duration-500`}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`w-full max-w-md p-10 rounded-[3rem] border-2 ${theme.card}`}>
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-emerald-500/10 rounded-3xl text-emerald-500"><Swords size={32} /></div>
        </div>
        <h1 className={`text-4xl font-black text-center mb-10 italic tracking-tighter ${theme.text}`}>LOCAL <span className="text-emerald-500">BATTLE</span></h1>
        
        <div className="space-y-6 mb-10">
          <div className="relative">
            <label className="text-[10px] font-black text-cyan-500 uppercase ml-4 tracking-[0.2em]">Player 1 (Alpha)</label>
            <input type="text" value={names.p1} onChange={(e) => setNames({...names, p1: e.target.value.toUpperCase()})} className={`w-full p-5 rounded-2xl border-2 outline-none font-bold mt-1 ${theme.input} focus:border-cyan-500 transition-all`} placeholder="CALLSIGN" />
          </div>
          <div className="relative">
            <label className="text-[10px] font-black text-purple-500 uppercase ml-4 tracking-[0.2em]">Player 2 (Beta)</label>
            <input type="text" value={names.p2} onChange={(e) => setNames({...names, p2: e.target.value.toUpperCase()})} className={`w-full p-5 rounded-2xl border-2 outline-none font-bold mt-1 ${theme.input} focus:border-purple-500 transition-all`} placeholder="CALLSIGN" />
          </div>
        </div>

        <button disabled={!names.p1 || !names.p2} onClick={() => setIsStarted(true)} className="w-full py-5 bg-slate-900 dark:bg-emerald-500 text-white font-black rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20 uppercase tracking-[0.3em] text-xs">
         start Game
        </button>
      </motion.div>
    </div>
  );

  // 2. LOADING STATE
  if (loading) return (
    <div className={`h-screen ${theme.bg} flex flex-col items-center justify-center`}>
      <Zap size={48} className="text-emerald-500 animate-pulse mb-4" />
      <p className="text-[10px] font-black tracking-[0.5em] text-emerald-500">LOADING PROTOCOLS...</p>
    </div>
  );

  // 3. GAME OVER SCREEN
  if (gameOver) {
    const winnerName = scores.p1 > scores.p2 ? names.p1 : scores.p2 > scores.p1 ? names.p2 : "EQUAL";
    return (
      <div className={`h-screen ${theme.bg} flex items-center justify-center p-6`}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`w-full max-w-md p-12 rounded-[4rem] text-center border-2 ${theme.card}`}>
          <Trophy size={64} className="text-yellow-500 mx-auto mb-6" />
          <h1 className={`text-6xl font-black italic mb-2 tracking-tighter ${theme.text}`}>FINISH</h1>
          <p className="text-emerald-500 font-black tracking-widest mb-12 uppercase text-xs">{winnerName} DOMINATED THE FIELD</p>
          
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className={`p-8 rounded-[2.5rem] border-2 ${isDark ? 'bg-white/5 border-white/5' : 'bg-zinc-50 border-zinc-100'}`}>
              <p className="text-[10px] text-cyan-500 font-black mb-1 uppercase">{names.p1}</p>
              <p className={`text-5xl font-black italic ${theme.text}`}>{scores.p1}</p>
            </div>
            <div className={`p-8 rounded-[2.5rem] border-2 ${isDark ? 'bg-white/5 border-white/5' : 'bg-zinc-50 border-zinc-100'}`}>
              <p className="text-[10px] text-purple-500 font-black mb-1 uppercase">{names.p2}</p>
              <p className={`text-5xl font-black italic ${theme.text}`}>{scores.p2}</p>
            </div>
          </div>
          <button onClick={onBack} className="w-full py-6 bg-slate-900 dark:bg-white dark:text-black text-white font-black rounded-3xl uppercase tracking-widest text-xs">Main Menu</button>
        </motion.div>
      </div>
    );
  }

  // 4. MAIN GAME ARENA
  const currentQ = questions[currentIndex];
  const allOptions = [...currentQ.incorrect_answers, currentQ.correct_answer].sort();

  return (
    <div className={`h-screen ${theme.bg} ${theme.text} flex flex-col overflow-hidden transition-all`}>
      {/* Dynamic Top Bar */}
      <div className={`p-6 flex justify-between items-center border-b transition-colors ${isDark ? 'bg-black/50 border-white/5' : 'bg-white border-zinc-200'}`}>
        <div className={`transition-all duration-300 ${activePlayer === 1 ? 'scale-110' : 'opacity-20'}`}>
          <p className="text-[10px] font-black text-cyan-500 tracking-widest uppercase">{names.p1}</p>
          <p className="text-4xl font-black italic tracking-tighter">{scores.p1}</p>
        </div>
        <div className="px-5 py-2 rounded-full bg-zinc-500/10 text-[10px] font-black tracking-widest border border-zinc-500/20">
          ROUND {currentIndex + 1}
        </div>
        <div className={`text-right transition-all duration-300 ${activePlayer === 2 ? 'scale-110' : 'opacity-20'}`}>
          <p className="text-[10px] font-black text-purple-500 tracking-widest uppercase">{names.p2}</p>
          <p className="text-4xl font-black italic tracking-tighter">{scores.p2}</p>
        </div>
      </div>

      {/* Turn Indicator */}
      <div className={`py-3 text-center font-black text-[10px] tracking-[0.8em] transition-all uppercase ${activePlayer === 1 ? 'bg-cyan-500 text-white' : 'bg-purple-500 text-white'}`}>
        {activePlayer === 1 ? `${names.p1}'S TURN` : `${names.p2}'S TURN`}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <motion.div key={currentIndex} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className={`w-full max-w-2xl p-10 md:p-16 rounded-[4rem] border-2 relative overflow-hidden ${theme.card}`}>
          <div className={`absolute top-0 inset-x-0 h-2 ${activePlayer === 1 ? 'bg-cyan-500 shadow-[0_0_15px_cyan]' : 'bg-purple-500 shadow-[0_0_15px_purple]'}`} />
          
          <h2 className={`text-2xl md:text-4xl font-black text-center mb-16 leading-tight italic tracking-tight ${theme.text}`} dangerouslySetInnerHTML={{ __html: currentQ.question }} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allOptions.map((opt, i) => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt === currentQ.correct_answer;
              
              let stateStyle = isDark ? 'bg-white/5 border-white/5' : 'bg-zinc-50 border-zinc-100';
              if (isSelected) {
                stateStyle = isCorrect 
                  ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30" 
                  : "bg-red-500 border-red-500 text-white animate-shake";
              }

              return (
                <button key={i} disabled={isAnswering} onClick={() => handleAnswer(opt)}
                  className={`group p-6 rounded-[2.5rem] border-2 text-left font-black transition-all duration-300 active:scale-95 ${stateStyle} ${!isSelected && isAnswering ? 'opacity-20' : ''}`}>
                  <div className="flex items-center">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs mr-4 ${isSelected ? 'bg-white/20' : (isDark ? 'bg-white/10' : 'bg-zinc-200 text-zinc-600')}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1 text-sm md:text-base uppercase" dangerouslySetInnerHTML={{ __html: opt }} />
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake { 0%, 100% { x: 0; } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}} />
    </div>
  );
};

export default Local;