import { useGame } from '../context/GameContext';

export default function ResultScreen() {
  const { roundResult, playerRole, players, mySocketId } = useGame();
  
  if (!roundResult) return null;

  const currentPlayer = players.find(p => p.role === playerRole);
  const opponentPlayer = players.find(p => p.role !== playerRole);

  // 役割に基づいてメッセージを変更
  let resultMessage = '';
  let resultClass = '';
  
  if (playerRole === 'drop') {
    // ドロップ役側の結果メッセージ
    if (roundResult.timeout) {
      resultMessage = '相手は振り向きませんでした！タイムアウト勝利！';
      resultClass = 'text-blue-600';
    } else if (!roundResult.dropped) {
      resultMessage = 'ハンカチを落とさずに済みました！最大ポイント獲得！';
      resultClass = 'text-blue-600';
    } else if (roundResult.points === 0) {
      resultMessage = 'ジャストチェックされました！';
      resultClass = 'text-red-600';
    } else {
      resultMessage = `ドロップ成功！${roundResult.points}ポイント獲得！`;
      resultClass = 'text-blue-600';
    }
  } else {
    // チェック役側の結果メッセージ
    if (roundResult.timeout) {
      resultMessage = '振り向くことができませんでした！';
      resultClass = 'text-red-600';
    } else if (!roundResult.dropped) {
      resultMessage = 'チェック失敗！相手の獲得ポイントは60ポイントです！';
      resultClass = 'text-red-600';
    } else if (roundResult.points === 0) {
      resultMessage = 'ジャストチェック成功！';
      resultClass = 'text-blue-600';
    } else {
      resultMessage = `ハンカチは落とされていました！相手は${roundResult.points}ポイント獲得`;
      resultClass = 'text-red-600';
    }
  }

  // このラウンドで獲得したポイントを計算
  const roundPoints = playerRole === 'drop' ? roundResult.points : 0;
  const opponentRoundPoints = playerRole === 'drop' ? 0 : roundResult.points;
  
  // サーバーから送られてきた最新のポイント情報を取得
  // この情報はすでに今回のラウンドのポイントが加算された状態
  let updatedMyPoints = currentPlayer?.points || 0;
  let updatedOpponentPoints = opponentPlayer?.points || 0;
  
  if (roundResult.playerPoints && roundResult.playerPoints.length === 2) {
    // roundResult.playerPointsから自分と相手の最新ポイントを取得
    const myPlayerPoint = roundResult.playerPoints.find(p => p.id === mySocketId);
    const opponentPlayerPoint = roundResult.playerPoints.find(p => p.id !== mySocketId);
    
    if (myPlayerPoint) {
      updatedMyPoints = myPlayerPoint.points;
    }
    
    if (opponentPlayerPoint) {
      updatedOpponentPoints = opponentPlayerPoint.points;
    }
  }
  
  return (
    <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-blue-200">
      <div className="w-full max-w-lg mx-auto p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full">
          <h1 className="text-2xl font-bold text-center mb-6">ラウンド結果</h1>
          
          <div className="text-center mb-6">
            <p className={`text-xl font-bold ${resultClass}`}>{resultMessage}</p>
          </div>
          
          {/* 今回のラウンドの獲得ポイント */}
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2 text-black text-center">今回のラウンド</h3>
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-black">あなた</p>
                <p className="text-xl font-bold text-black">{playerRole === 'drop' ? roundResult.points : 0}ポイント</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-black">相手</p>
                <p className="text-xl font-bold text-black">{playerRole === 'drop' ? 0 : roundResult.points}ポイント</p>
              </div>
            </div>
          </div>
          
          {/* 累積ポイント（最新の状態） */}
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2 text-black text-center">現在の合計</h3>
            <div className="flex justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-black">あなた</p>
                <p className="text-xl font-bold text-black">{updatedMyPoints}ポイント</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-black">相手</p>
                <p className="text-xl font-bold text-black">{updatedOpponentPoints}ポイント</p>
              </div>
            </div>
            
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600" 
                style={{ 
                  width: `${(updatedMyPoints / (updatedMyPoints + updatedOpponentPoints)) * 100 || 0}%`,
                  transition: 'width 1s ease-in-out' 
                }}
              ></div>
            </div>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2 text-black">詳細</h3>
            {roundResult.dropped ? (
              <div className="text-black">
                <p>ハンカチ落下: {roundResult.dropTime ? new Date(roundResult.dropTime).toLocaleTimeString() : 'なし'}</p>
                <p>振り向き時間: {roundResult.checkTime ? new Date(roundResult.checkTime).toLocaleTimeString() : 'タイムアウト'}</p>
                <p className="font-bold">獲得ポイント: {roundResult.points}</p>
              </div>
            ) : (
              <div className="text-black">
                <p>ハンカチは落とされませんでした</p>
                <p>振り向き時間: {roundResult.checkTime ? new Date(roundResult.checkTime).toLocaleTimeString() : 'タイムアウト'}</p>
                <p className="font-bold">獲得ポイント: {roundResult.points}</p>
              </div>
            )}
          </div>
          
          <div className="text-center text-gray-500">
            <p>次のラウンドが始まるまでお待ちください...</p>
            <div className="mt-4 loader w-10 h-10 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 