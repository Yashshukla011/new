import React, { useState, useEffect } from 'react';

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
  },
  { 
    question: "Which language is used for web development?", 
    correct_answer: "JavaScript", 
    incorrect_answers: ["C++", "Python", "Java"] 
  }
];

const Local = ({ onBack }) => {
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

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
        if (response.status === 429) throw new Error("Rate Limit");
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
    }, 1000); // 1 second delay for visual feedback
  };

  //  NAME INPUT SCREEN
  if (!isStarted) {
    return (
      <div className="h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-white font-sans">
        <div className="w-full max-w-md bg-[#111] border border-gray-800 p-8 rounded-[2.5rem] shadow-2xl">
          <h1 className="text-4xl font-black text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">LOCAL BATTLE</h1>
          
          <div className="space-y-4 mb-8">
            <div>
              <label className="text-[10px] font-bold text-cyan-500 uppercase ml-2">Player 1 Name</label>
              <input 
                type="text" value={names.p1} 
                onChange={(e) => setNames({...names, p1: e.target.value.toUpperCase()})}
                className="w-full bg-black border border-gray-800 p-4 rounded-xl mt-1 outline-none focus:border-cyan-500 text-cyan-400 font-bold"
                placeholder="PLAYER 1"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-purple-500 uppercase ml-2">Player 2 Name</label>
              <input 
                type="text" value={names.p2} 
                onChange={(e) => setNames({...names, p2: e.target.value.toUpperCase()})}
                className="w-full bg-black border border-gray-800 p-4 rounded-xl mt-1 outline-none focus:border-purple-500 text-purple-400 font-bold"
                placeholder="PLAYER 2"
              />
            </div>
          </div>

          <button 
            disabled={!names.p1 || !names.p2}
            onClick={() => setIsStarted(true)}
            className="w-full py-4 bg-white text-black font-black rounded-xl hover:scale-105 transition disabled:opacity-50 uppercase tracking-widest"
          >
            Start Battle
          </button>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="h-screen bg-black flex items-center justify-center text-cyan-400 font-black animate-pulse">
      INITIALIZING BATTLE...
    </div>
  );

  if (gameOver) {
    const winnerName = scores.p1 > scores.p2 ? names.p1 : scores.p2 > scores.p1 ? names.p2 : "BOTH";
    return (
      <div className="h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-white">
        <div className="w-full max-w-md bg-[#111] border border-gray-800 p-10 rounded-[2.5rem] text-center shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-purple-500"></div>
          <h1 className="text-5xl font-black italic mb-2 text-yellow-500 tracking-tighter">GAME OVER</h1>
          <p className="text-cyan-400 font-bold tracking-widest mb-10 uppercase">{winnerName} DOMINATED</p>
          
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-black/40 p-6 rounded-2xl border-t-2 border-cyan-500">
              <p className="text-[10px] text-gray-500 font-bold mb-1 uppercase">{names.p1}</p>
              <p className="text-5xl font-black">{scores.p1}</p>
            </div>
            <div className="bg-black/40 p-6 rounded-2xl border-t-2 border-purple-500">
              <p className="text-[10px] text-gray-500 font-bold mb-1 uppercase">{names.p2}</p>
              <p className="text-5xl font-black">{scores.p2}</p>
            </div>
          </div>
          <button onClick={onBack} className="w-full py-4 bg-white text-black font-black rounded-xl uppercase tracking-widest">Main Menu</button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const allOptions = [...currentQ.incorrect_answers, currentQ.correct_answer].sort();

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="flex-none flex justify-between items-center bg-[#111] p-6 border-b border-gray-900 shadow-xl">
        <div className="text-left">
          <p className={`text-[10px] font-black uppercase ${activePlayer === 1 ? 'text-cyan-400' : 'text-gray-700'}`}>{names.p1}</p>
          <p className="text-2xl font-black">{scores.p1}</p>
        </div>
        <div className="bg-gray-900 px-4 py-1 rounded-full text-xs font-bold text-gray-400">
          Q {currentIndex + 1}/10
        </div>
        <div className="text-right">
          <p className={`text-[10px] font-black uppercase ${activePlayer === 2 ? 'text-purple-400' : 'text-gray-700'}`}>{names.p2}</p>
          <p className="text-2xl font-black">{scores.p2}</p>
        </div>
      </div>

      <div className={`flex-none text-center py-2 font-black text-[10px] tracking-[0.5em] transition-colors ${activePlayer === 1 ? 'bg-cyan-500/10 text-cyan-400 border-b border-cyan-500/20' : 'bg-purple-500/10 text-purple-400 border-b border-purple-500/20'}`}>
        {activePlayer === 1 ? `${names.p1}'S TURN` : `${names.p2}'S TURN`}
      </div>

      <div className="flex-grow overflow-y-auto p-4 pt-10">
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-[#16181a] border border-gray-800 rounded-[2.5rem] p-8 md:p-12 relative shadow-2xl">
            <div className={`absolute top-0 left-10 right-10 h-1 rounded-full ${activePlayer === 1 ? 'bg-cyan-500 shadow-[0_0_10px_cyan]' : 'bg-purple-500 shadow-[0_0_10px_purple]'}`}></div>
            <h2 className="text-xl md:text-3xl font-bold mb-12 leading-snug text-center" dangerouslySetInnerHTML={{ __html: currentQ.question }} />
            
            <div className="grid grid-cols-1 gap-4">
              {allOptions.map((opt, i) => {
                const isSelected = selectedOption === opt;
                const isCorrect = opt === currentQ.correct_answer;
                
                let btnStyle = "border-gray-800 bg-black/40";
                if (isSelected) {
                  btnStyle = isCorrect 
                    ? "border-emerald-500 bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105" 
                    : "border-red-500 bg-red-500/20 animate-shake";
                }

                return (
                  <button
                    key={i}
                    disabled={isAnswering}
                    onClick={() => handleAnswer(opt)}
                    className={`group flex items-center p-5 text-left border rounded-2xl transition-all duration-300 ${btnStyle} ${!isSelected && isAnswering ? 'opacity-30' : ''}`}
                  >
                    <span className={`w-10 h-10 flex-none flex items-center justify-center rounded-lg mr-4 font-black text-xs ${isSelected ? 'bg-white text-black' : (activePlayer === 1 ? 'bg-cyan-900/30 text-cyan-400' : 'bg-purple-900/30 text-purple-400')}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1 font-bold" dangerouslySetInnerHTML={{ __html: opt }} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}} />
    </div>
  );
};

export default Local;