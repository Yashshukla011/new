import React from 'react';

const StartScreen = ({ onStartPvP, onStartSolo, onStartMultiple }) => {
  return (
    <div className="min-h-screen w-full bg-[#050505] text-white font-sans flex flex-col items-center py-12 px-6 overflow-y-auto custom-scrollbar">
      
      {/* --- Header Section --- */}
      <div className="text-center mb-20 flex-none relative">
        {/* Soft Background Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 blur-[100px]"></div>
        
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white italic">
          Imagin<span className="text-emerald-500">XP</span>
        </h1>
        <p className="text-sm tracking-[0.8em] text-zinc-500 mt-4 uppercase font-bold">
          Ultimate Quiz Battle Arena
        </p>
        
        <div className="flex items-center justify-center mt-8 gap-6">
          <div className="h-[1px] w-20 bg-gradient-to-r from-transparent to-zinc-800"></div>
          <span className="text-[10px] font-black tracking-[0.4em] text-zinc-600 uppercase">Competitive Gaming</span>
          <div className="h-[1px] w-20 bg-gradient-to-l from-transparent to-zinc-800"></div>
        </div>
      </div>

      {/* --- Game Modes Row --- */}
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        
        {/* PvP Mode - Blue Theme */}
        <button 
          onClick={onStartPvP}
          className="relative group h-[400px] transition-all duration-500 active:scale-95"
        >
          <div className="absolute -inset-1 bg-cyan-500/10 rounded-[40px] blur-2xl group-hover:bg-cyan-500/20 transition duration-500"></div>
          <div className="h-full relative bg-[#0d0d0d] border border-white/5 group-hover:border-cyan-500/40 rounded-[35px] flex flex-col items-center justify-center p-8 transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="text-7xl mb-6 transform group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">⚔️</div>
            <h2 className="text-4xl font-black tracking-tighter uppercase mb-2 italic">P v P</h2>
            <p className="text-zinc-500 text-sm mb-8 text-center px-4 leading-relaxed">Battle 1v1 against elite players worldwide</p>
            <div className="px-6 py-2 rounded-full border border-white/5 bg-white/5 text-[10px] font-black tracking-widest text-cyan-400 uppercase">play game</div>
          </div>
        </button>

        {/* Offline Mode - Emerald Theme */}
        <button 
          onClick={onStartSolo}
          className="relative group h-[400px] transition-all duration-500 active:scale-95"
        >
          <div className="absolute -inset-1 bg-emerald-500/10 rounded-[40px] blur-2xl group-hover:bg-emerald-500/20 transition duration-500"></div>
          <div className="h-full relative bg-[#0d0d0d] border border-white/5 group-hover:border-emerald-500/40 rounded-[35px] flex flex-col items-center justify-center p-8 transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform duration-500">🎯</div>
            <h2 className="text-3xl font-black tracking-tighter uppercase mb-2 italic">Local Player</h2>
            <p className="text-zinc-500 text-sm mb-8 text-center px-4 leading-relaxed">Challenge a friend on a single device</p>
            <div className="px-6 py-2 rounded-full border border-white/5 bg-white/5 text-[10px] font-black tracking-widest text-emerald-400 uppercase">play game</div>
          </div>
        </button>

        {/* Online Multi Mode - Purple Theme */}
        <button 
          onClick={onStartMultiple} 
          className="relative group h-[400px] transition-all duration-500 active:scale-95"
        >
          <div className="absolute -inset-1 bg-purple-500/10 rounded-[40px] blur-2xl group-hover:bg-purple-500/20 transition duration-500"></div>
          <div className="h-full relative bg-[#0d0d0d] border border-white/5 group-hover:border-purple-500/40 rounded-[35px] flex flex-col items-center justify-center p-8 transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="text-7xl mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">🌐</div>
            <h2 className="text-3xl font-black tracking-tighter uppercase mb-2 italic">Global Lobby</h2>
            <p className="text-zinc-500 text-sm mb-8 text-center px-4 leading-relaxed">Multiplayer chaos with up to 4 friends</p>
            <div className="px-6 py-2 rounded-full border border-white/5 bg-white/5 text-[10px] font-black tracking-widest text-purple-400 uppercase">Join Party</div>
          </div>
        </button>

      </div>

      {/* --- Footer Stats Section --- */}
      <div className="grid grid-cols-3 gap-8 w-full max-w-4xl">
        <div className="relative group overflow-hidden bg-[#0d0d0d] border border-white/5 rounded-[30px] py-10 text-center transition-all hover:bg-zinc-900/50">
           <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <span className="relative block text-5xl font-black text-white tracking-tighter">100+</span>
           <span className="relative text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em] mt-3 block">Curated Questions</span>
        </div>
        
        <div className="relative group overflow-hidden bg-[#0d0d0d] border border-white/5 rounded-[30px] py-10 text-center transition-all hover:bg-zinc-900/50">
           <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <span className="relative block text-4xl font-black text-zinc-300 tracking-tighter uppercase italic">Live</span>
           <span className="relative text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em] mt-3 block">Real-time Sync</span>
        </div>

        <div className="relative group overflow-hidden bg-[#0d0d0d] border border-white/5 rounded-[30px] py-10 text-center transition-all hover:bg-zinc-900/50">
           <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <span className="relative block text-4xl font-black text-zinc-300 tracking-tighter uppercase italic text-zinc-600 group-hover:text-white transition-colors">Instant</span>
           <span className="relative text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em] mt-3 block">Leaderboards</span>
        </div>
      </div>

    </div>
  );
};

export default StartScreen;