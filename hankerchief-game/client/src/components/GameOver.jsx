import { useGame } from '../context/GameContext';
import { useEffect } from 'react';

export default function GameOver() {
  const { winner, players, resetGame, mySocketId } = useGame();
  
  // デバッグ情報をコンポーネントマウント時にも表示
  useEffect(() => {
    console.log("GameOver マウント");
    console.log("勝者情報:", winner);
    console.log("自分のID:", mySocketId);
    console.log("全プレイヤー:", players);
  }, [winner, mySocketId, players]);
  
  // mySocketIdを使用して勝者判定を行う
  const isWinner = winner ? winner.id === mySocketId : false;
  
  console.log("勝者判定:", isWinner, "勝者ID:", winner?.id, "自分のID:", mySocketId); // デバッグ用
  
  // ロビーに戻る処理
  const handleBackToLobby = () => {
    console.log("ロビーに戻る前のソケットID:", mySocketId);
    resetGame();
    // 注: App.jsxはルーターを使用していないため、navigate('/')は不要です
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-blue-200 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-6">ゲーム終了</h1>
        
        {isWinner ? (
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-yellow-400 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">あなたの勝利！</h2>
            <p className="text-gray-600">おめでとうございます！素晴らしいゲームでした！</p>
          </div>
        ) : (
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-blue-600 mb-2">相手の勝利</h2>
            <p className="text-gray-600">惜しかった！次回に期待しましょう！</p>
            <p className="text-xs text-gray-400 mt-2">デバッグ: あなたのID: {mySocketId || 'なし'}, 勝者ID: {winner?.id || 'なし'}</p>
          </div>
        )}
        
        <div className="bg-gray-100 p-4 rounded-lg mb-8">
          <h3 className="font-semibold mb-4 text-left">最終スコア</h3>
          <div className="flex justify-between">
            {players.map((player, index) => (
              <div key={index} className={`${player.id === winner?.id ? 'text-green-600 font-bold' : 'text-gray-700'}`}>
                <p>{player.name || `プレイヤー${index + 1}`}</p>
                <p className="text-2xl">{player.points} ポイント</p>
                <p className="text-xs text-gray-400">{player.id === mySocketId ? '(あなた)' : ''}</p>
              </div>
            ))}
          </div>
        </div>
        
        <button
          onClick={handleBackToLobby}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-200"
        >
          ロビーに戻る
        </button>
      </div>
    </div>
  );
} 