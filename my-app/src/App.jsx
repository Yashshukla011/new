import React, { useState } from 'react';
import GameContainer from './Components/gamecontiner';
import Snack from './Components/snackgame';

function App() {
  const [screen, setScreen] = useState('menu');

  if (screen === 'game') return <GameContainer onBack={() => setScreen('menu')} />;
  if (screen === 'snack') return <Snack onBack={() => setScreen('menu')} />;

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-6 font-sans">
      
      {/* Top Branding Section */}
      <div className="text-center mb-16 animate-in fade-in slide-in-from-top duration-1000">
        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white">
          Imagin<span className="text-[#00ff9d]">XP</span>
        </h1>
        <p className="text-gray-500 tracking-[0.4em] text-[10px] md:text-xs font-bold mt-2 uppercase">
          Next-Gen Battle Interface
        </p>
      </div>

      {/* Main Mode Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        
        {/* Multi Mode Card */}
        <div 
          onClick={() => setScreen('game')}
          className="group relative bg-[#141416] border border-white/5 p-10 rounded-[2.5rem] cursor-pointer transition-all duration-500 hover:border-cyan-500/50 hover:bg-[#1c1c1f] hover:-translate-y-2 shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-[2.5rem]"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 mb-6 bg-cyan-500/10 rounded-3xl flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 transition-transform duration-500">
              <span className="text-5xl group-hover:drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">🌐</span>
            </div>
            <h2 className="text-3xl font-black text-white italic mb-3 tracking-tight">MULTI MODE</h2>
            <p className="text-gray-400 text-sm font-medium max-w-[200px]">Battle with players or play official challenges</p>
            
            <button className="mt-8 px-8 py-3 bg-cyan-600/10 text-cyan-400 border border-cyan-500/20 rounded-full text-[10px] font-black tracking-widest uppercase group-hover:bg-cyan-500 group-hover:text-black transition-all duration-300">
              Enter Arena ⚡
            </button>
          </div>
        </div>

        {/* Classic Snack Card */}
        <div 
          onClick={() => setScreen('snack')}
          className="group relative bg-[#141416] border border-white/5 p-10 rounded-[2.5rem] cursor-pointer transition-all duration-500 hover:border-[#00ff9d]/50 hover:bg-[#1c1c1f] hover:-translate-y-2 shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#00ff9d]/5 to-transparent rounded-[2.5rem]"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 mb-6 bg-[#00ff9d]/10 rounded-3xl flex items-center justify-center border border-[#00ff9d]/20 group-hover:scale-110 transition-transform duration-500">
              <span className="text-5xl group-hover:drop-shadow-[0_0_15px_rgba(0,255,157,0.5)]">🐍</span>
            </div>
            <h2 className="text-3xl font-black text-white italic mb-3 tracking-tight">CLASSIC SNACK</h2>
            <p className="text-gray-400 text-sm font-medium max-w-[200px]">The legendary snake experience you love</p>
            
            <button className="mt-8 px-8 py-3 bg-[#00ff9d]/10 text-[#00ff9d] border border-[#00ff9d]/20 rounded-full text-[10px] font-black tracking-widest uppercase group-hover:bg-[#00ff9d] group-hover:text-black transition-all duration-300">
              Start Feeding ⚡
            </button>
          </div>
        </div>

      </div>

      {/* Exit Button */}
      <button 
        onClick={() => window.confirm("Quit Game?") && window.close()}
        className="mt-16 text-gray-600 hover:text-red-500 text-[10px] font-black tracking-[0.3em] uppercase transition-all duration-300 hover:scale-110"
      >
        [ EXIT INTERFACE ]
      </button>

    </div>
  );
}

export default App;