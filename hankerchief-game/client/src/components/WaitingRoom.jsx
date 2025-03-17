import { useGame } from '../context/GameContext';

export default function WaitingRoom() {
  const { roomId, playerName, resetGame, isRandomMatching } = useGame();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-blue-200 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-blue-600 mb-6">
          {isRandomMatching 
            ? "ランダムマッチング中..." 
            : "対戦相手を待っています..."}
        </h1>
        
        <div className="flex justify-center mb-8">
          <div className="loader w-16 h-16 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-gray-700 mb-2">ルームID:</p>
          <p className="text-3xl font-mono font-extrabold text-black tracking-wider">{roomId}</p>
          {isRandomMatching ? (
            <p className="text-sm text-gray-500 mt-2">ランダムマッチングでルームを探しています</p>
          ) : (
            <p className="text-sm text-gray-500 mt-2">このIDを相手に教えて参加してもらいましょう</p>
          )}
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700">
            プレイヤー名: <span className="font-semibold">{playerName || "ゲスト"}</span>
          </p>
        </div>
        
        {isRandomMatching && (
          <div className="mb-6 p-4 bg-purple-50 rounded-lg">
            <p className="text-purple-700">
              他のプレイヤーを探しています。しばらくお待ちください...
            </p>
          </div>
        )}
        
        <button
          onClick={resetGame}
          className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-200"
        >
          ロビーに戻る
        </button>
      </div>
    </div>
  );
} 