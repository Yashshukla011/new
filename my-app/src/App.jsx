import { useState } from 'react';
import StartScreen from './Components/StartScreen';
import OnlineMode from './Components/OnlineMode';
import Local from './Components/Local';
import MultiplePlayer from './Components/MultiplePlayer';
function App() {
  const [screen, setScreen] = useState('start');

  return (
    <div className="bg-black min-h-screen">
      {screen === 'start' && (
        <StartScreen
          onStartPvP={() => setScreen('online')}
          onStartSolo={() => setScreen('pvp')}
onStartMultiple={() => setScreen('multiplayer')}        />
      )}

      {screen === 'online' && <OnlineMode onBack={() => setScreen('start')} />}
      {screen === 'pvp' && <Local onBack={() => setScreen('start')} />}
{screen === 'multiplayer' && (
        <MultiplePlayer onBack={() => setScreen('start')} />
      )}
         </div>
  );
}

export default App;
