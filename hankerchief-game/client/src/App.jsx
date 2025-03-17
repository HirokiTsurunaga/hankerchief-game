import { useGame } from './context/GameContext';
import Lobby from './components/Lobby';
import GameScreen from './components/GameScreen';
import WaitingRoom from './components/WaitingRoom';
import ResultScreen from './components/ResultScreen';
import GameOver from './components/GameOver';

function App() {
  const { gameState } = useGame();

  // 画面の表示を切り替え
  const renderScreen = () => {
    switch (gameState) {
      case 'lobby':
        return <Lobby />;
      case 'waiting':
        return <WaitingRoom />;
      case 'playing':
        return <GameScreen />;
      case 'result':
        return <ResultScreen />;
      case 'gameover':
        return <GameOver />;
      default:
        return <div>エラー: 不明な画面です</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col">
      <header className="bg-blue-600 text-white py-4 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">ハンカチ落としゲーム</h1>
          <p className="text-sm">v1.0.2</p>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {renderScreen()}
      </main>
      
      <footer className="bg-gray-800 text-white py-3 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm">
          &copy; 2024 ハンカチ落としゲーム
        </div>
      </footer>
    </div>
  );
}

export default App;
