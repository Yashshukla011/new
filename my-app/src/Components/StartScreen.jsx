import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Swords, Target, Globe, Zap, Trophy, Activity, Crown } from 'lucide-react';

const StartScreen = ({ onStartPvP, onStartSolo, onStartMultiple,onStartMultipl }) => {
  const [isDark, setIsDark] = useState(true);

  const theme = {
    bg: isDark ? 'bg-[#050505]' : 'bg-[#F0F2F5]',
    cardBg: isDark ? 'bg-[#0d0d0d]' : 'bg-white',
    textMain: isDark ? 'text-white' : 'text-[#1A1A1A]',
    textSub: isDark ? 'text-zinc-500' : 'text-zinc-400',
    border: isDark ? 'border-white/5' : 'border-zinc-200',
    glow: isDark ? 'bg-emerald-500/10' : 'bg-emerald-500/20',
  };

  return (
    <div className={`min-h-screen w-full ${theme.bg} ${theme.textMain} font-sans flex flex-col items-center py-12 px-6 transition-all duration-500 overflow-y-auto relative`}>
      
      {/* --- Theme Toggle --- */}
      <button 
        onClick={() => setIsDark(!isDark)}
        className={`fixed top-6 right-6 p-3 rounded-2xl border ${theme.border} ${theme.cardBg} shadow-2xl z-50 hover:scale-110 transition-all`}
      >
        {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-indigo-600" />}
      </button>

      {/* --- Header Section --- */}
      <header className="text-center mb-12 relative">
        <div className={`absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-64 ${theme.glow} blur-[100px] rounded-full opacity-50`}></div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic relative leading-none">
          Imagin<span className="text-emerald-500">XP</span>
        </h1>
        <p className={`text-[10px] tracking-[0.6em] ${theme.textSub} mt-4 uppercase font-black relative`}>
          Next-Gen Battle Interface
        </p>
      </header>

      {/* --- Game Modes Grid (Now 4 Columns on Desktop) --- */}
      <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16 z-10">
        
        {/* PvP Mode */}
        <ModeCard 
          title="PvP Duel" 
          desc="1v1 Ranked" 
          icon={<Swords size={32} />} 
          color="cyan" 
          theme={theme} 
          onClick={onStartPvP} 
        />

        {/* Local Mode */}
        <ModeCard 
          title="Local" 
          desc="Same Device" 
          icon={<Target size={32} />} 
          color="emerald" 
          theme={theme} 
          onClick={onStartSolo} 
        />

        {/* Global Mode */}
        <ModeCard 
          title="Lobby" 
          desc="Global Party" 
          icon={<Globe size={32} />} 
          color="purple" 
          theme={theme} 
          onClick={onStartMultiple} 
        />

        {/* NEW: Daily Challenge Mode */}
        <ModeCard 
          title=" host question" 
          desc="kuch bhi" 
          icon={<Crown size={32} />} 
          color="orange" 
          theme={theme} 
          onClick={onStartMultipl} 
        />

      </div>

      {/* --- Minimal Stats Footer --- */}
  
    </div>
  );
};

// --- Sub-Component: Stylish Mode Card ---
const ModeCard = ({ title, desc, icon, color, theme, onClick }) => {
  const colorMap = {
    cyan: 'text-cyan-400 border-cyan-500/20 group-hover:border-cyan-500/60 shadow-cyan-500/5',
    emerald: 'text-emerald-400 border-emerald-500/20 group-hover:border-emerald-500/60 shadow-emerald-500/5',
    purple: 'text-purple-400 border-purple-500/20 group-hover:border-purple-500/60 shadow-purple-500/5',
    orange: 'text-orange-400 border-orange-500/20 group-hover:border-orange-500/60 shadow-orange-500/5',
  };

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`relative group cursor-pointer ${theme.cardBg} border ${theme.border} ${colorMap[color].split(' ')[1]} rounded-[30px] p-6 transition-all duration-300 shadow-xl overflow-hidden`}
    >
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-current opacity-[0.03] rounded-full group-hover:scale-150 transition-transform duration-700 ${colorMap[color].split(' ')[0]}`}></div>
      
      <div className={`mb-4 p-3 w-fit rounded-2xl bg-white/5 border border-white/5 ${colorMap[color].split(' ')[0]}`}>
        {icon}
      </div>

      <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-1">{title}</h3>
      <p className={`${theme.textSub} text-xs font-medium mb-6`}>{desc}</p>

      <div className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${colorMap[color].split(' ')[0]}`}>
        Enter in game <Zap size={10} />
      </div>
    </motion.div>
  );
};

const StatTab = ({ icon, val, label, theme }) => (
  <div className={`${theme.cardBg} border ${theme.border} px-6 py-3 rounded-2xl flex items-center gap-3`}>
    <div className="text-emerald-500">{icon}</div>
    <div className="flex flex-col">
      <span className="text-sm font-black leading-none">{val}</span>
      <span className={`text-[8px] uppercase tracking-widest font-bold opacity-50`}>{label}</span>
    </div>
  </div>
);

export default StartScreen;