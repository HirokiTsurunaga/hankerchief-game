import { SocketProvider } from './context/SocketContext';
import { GameProvider, useGame } from './context/GameContext';
import Lobby from './components/Lobby';
import WaitingRoom from './components/WaitingRoom';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';
import GameOver from './components/GameOver';

// ゲームコンテンツコンポーネント
function GameContent() {
  const { gameState, error } = useGame();

  // エラーメッセージがあれば表示
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-blue-200 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold text-center text-red-600 mb-6">エラーが発生しました</h1>
          <p className="text-center mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-200"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  // ゲームの状態に応じてコンポーネントを表示
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
      return <Lobby />;
  }
}

// メインアプリコンポーネント
function App() {
  return (
    <SocketProvider>
      <GameProvider>
        <GameContent />
      </GameProvider>
    </SocketProvider>
  );
}

export default App;
