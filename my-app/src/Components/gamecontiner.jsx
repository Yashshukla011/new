import React, { useState } from 'react';
import StartScreen from './StartScreen';
import OnlineMode from './OnlineMode';
import Local from './Local';
import MultiplePlayer from './MultiplePlayer';
import Multi from './user_wale_question';

const GameContainer = () => {
  const [screen, setScreen] = useState('start');

  const renderScreen = () => {
    switch (screen) {
      case 'online':
        return <OnlineMode onBack={() => setScreen('start')} />;
      case 'pvp':
        return <Local onBack={() => setScreen('start')} />;
      case 'multiplayer':
        return <MultiplePlayer onBack={() => setScreen('start')} />;
      case 'Multi':
        return <Multi onBack={() => setScreen('start')} />;
      default:
        return (
          <StartScreen
            onStartPvP={() => setScreen('online')}
            onStartSolo={() => setScreen('pvp')}
            onStartMultiple={() => setScreen('multiplayer')}
            onStartMultipl={() => setScreen('Multi')}
          />
        );
    }
  };

  return (
    <div className="bg-black min-h-screen">
      {renderScreen()}
    </div>
  );
};

export default GameContainer;