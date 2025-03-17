import { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';

export default function GameScreen() {
  const { 
    playerRole, 
    players, 
    currentRound,
    dropHandkerchief, 
    checkHandkerchief,
    reportTimeout,
    updateTimeRemaining,
  } = useGame();

  const [timeLeft, setTimeLeft] = useState(60);
  const [dropState, setDropState] = useState('ready'); // ready, dropping, dropped
  const [countdown, setCountdown] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(true);

  // 対戦相手のプレイヤー情報を取得
  const currentPlayer = players.find(p => p.role === playerRole);
  const opponentPlayer = players.find(p => p.role !== playerRole);

  // カウントダウン処理
  useEffect(() => {
    if (!isCountingDown) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsCountingDown(false);
      // カウントダウン終了後にタイマー開始
      setTimeLeft(60);
    }
  }, [countdown, isCountingDown]);

  // 60秒タイマー処理
  useEffect(() => {
    if (isCountingDown || timeLeft <= 0) return;

    const timer = setTimeout(() => {
      const newTime = timeLeft - 1;
      setTimeLeft(newTime);
      updateTimeRemaining(newTime);
      
      if (newTime <= 0) {
        // タイムアウト通知
        reportTimeout();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isCountingDown, reportTimeout, updateTimeRemaining]);

  // ハンカチを落とす処理
  const handleDrop = () => {
    if (dropState !== 'ready') return;
    
    setDropState('dropping');
    // アニメーション用の一時的な状態
    setTimeout(() => {
      setDropState('dropped');
      dropHandkerchief();
    }, 1000); // ハンカチが落ちるアニメーション時間（1秒）
  };

  // 振り向き処理
  const handleCheck = () => {
    checkHandkerchief();
  };

  // カウントダウン表示
  if (isCountingDown) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-blue-200">
        <div className="text-6xl font-bold text-blue-600">
          {countdown === 0 ? "スタート！" : countdown}
        </div>
        <div className="mt-4 text-xl text-gray-700">
          {playerRole === 'drop' ? (
            <span className="bg-blue-700 text-white px-4 py-2 rounded-md font-bold">あなたはドロップ役です</span>
          ) : (
            <span className="bg-red-700 text-white px-4 py-2 rounded-md font-bold">あなたはチェック役です</span>
          )}
        </div>
      </div>
    );
  }

  // ドロップ役の画面
  if (playerRole === 'drop') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-100 to-blue-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="bg-white py-2 px-4 rounded-md shadow">
            <span className="font-semibold text-blue-600">あなた:</span> {currentPlayer?.name || 'ゲスト'} 
            <span className="ml-2 px-2 py-1 bg-blue-700 text-white text-xs rounded font-bold">ドロップ役</span>
          </div>
          <div className="bg-white py-2 px-4 rounded-md shadow">
            <span className="font-semibold text-red-600">相手:</span> {opponentPlayer?.name || 'ゲスト'} 
            <span className="ml-2 px-2 py-1 bg-red-700 text-white text-xs rounded font-bold">チェック役</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 flex-grow flex flex-col items-center justify-between">
          {/* スコア表示 */}
          <div className="bg-gray-100 w-full py-3 px-6 rounded-lg flex justify-between mb-8">
            <div>
              <span className="text-sm font-medium text-black">あなたのポイント</span>
              <p className="text-2xl font-bold text-black">{currentPlayer?.points || 0}</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-black">相手のポイント</span>
              <p className="text-2xl font-bold text-black">{opponentPlayer?.points || 0}</p>
            </div>
          </div>
          
          {/* タイマー表示 */}
          <div className="mb-4 text-center">
            <div className="text-5xl font-bold mb-2 text-blue-600">{timeLeft}</div>
            <p className="text-gray-500">残り時間</p>
          </div>
          
          {/* ハンカチエリア */}
          <div className="flex-grow flex flex-col items-center justify-center w-full relative">
            {dropState === 'ready' && (
              <div className="absolute top-0 w-full flex justify-center">
                <div className="bg-yellow-100 border-2 border-yellow-300 w-20 h-20 rounded-md shadow-md transform rotate-45 flex items-center justify-center">
                  <div className="transform -rotate-45 text-yellow-800">ハンカチ</div>
                </div>
              </div>
            )}
            
            {dropState === 'dropping' && (
              <div className="absolute animate-fall w-full flex justify-center">
                <div className="bg-yellow-100 border-2 border-yellow-300 w-20 h-20 rounded-md shadow-md transform rotate-45 flex items-center justify-center">
                  <div className="transform -rotate-45 text-yellow-800">ハンカチ</div>
                </div>
              </div>
            )}
            
            {dropState === 'dropped' && (
              <div className="absolute bottom-0 w-full flex justify-center">
                <div className="bg-yellow-100 border-2 border-yellow-300 w-20 h-20 rounded-md shadow-md transform rotate-12 flex items-center justify-center">
                  <div className="transform -rotate-12 text-yellow-800">ハンカチ</div>
                </div>
              </div>
            )}
          </div>
          
          {/* ボタンエリア */}
          <div className="w-full py-6">
            <button
              onClick={handleDrop}
              disabled={dropState !== 'ready'}
              className={`w-full py-4 rounded-lg font-bold text-xl transition duration-200 
                ${dropState === 'ready' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              {dropState === 'ready' 
                ? 'ハンカチを落とす' 
                : dropState === 'dropping' 
                  ? '落下中...' 
                  : '落としました'}
            </button>
            <p className="mt-2 text-center text-sm text-gray-500">
              {dropState === 'ready' 
                ? 'いつハンカチを落とすか決めましょう。相手にタイミングを見破られないようにしましょう！' 
                : '相手が振り向くのを待ちましょう。'}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // チェック役の画面
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-red-100 to-red-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="bg-white py-2 px-4 rounded-md shadow">
          <span className="font-semibold text-red-600">あなた:</span> {currentPlayer?.name || 'ゲスト'} 
          <span className="ml-2 px-2 py-1 bg-red-700 text-white text-xs rounded font-bold">チェック役</span>
        </div>
        <div className="bg-white py-2 px-4 rounded-md shadow">
          <span className="font-semibold text-blue-600">相手:</span> {opponentPlayer?.name || 'ゲスト'} 
          <span className="ml-2 px-2 py-1 bg-blue-700 text-white text-xs rounded font-bold">ドロップ役</span>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-6 flex-grow flex flex-col items-center justify-between">
        {/* スコア表示 */}
        <div className="bg-gray-100 w-full py-3 px-6 rounded-lg flex justify-between mb-8">
          <div>
            <span className="text-sm font-medium text-black">あなたのポイント</span>
            <p className="text-2xl font-bold text-black">{currentPlayer?.points || 0}</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-black">相手のポイント</span>
            <p className="text-2xl font-bold text-black">{opponentPlayer?.points || 0}</p>
          </div>
        </div>
        
        {/* タイマー表示 */}
        <div className="mb-4 text-center">
          <div className="text-5xl font-bold mb-2 text-red-600">{timeLeft}</div>
          <p className="text-gray-500">残り時間</p>
        </div>
        
        {/* ビジュアルエリア */}
        <div className="flex-grow flex flex-col items-center justify-center w-full">
          <div className="relative mb-6">
            <div className="w-32 h-32 bg-gray-300 rounded-full overflow-hidden border-4 border-gray-400">
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">背中</span>
              </div>
            </div>
          </div>
          <p className="text-gray-600 text-center mb-8">
            相手はハンカチを落としましたか？<br />
            振り向くタイミングを見計らいましょう！
          </p>
        </div>
        
        {/* ボタンエリア */}
        <div className="w-full py-6">
          <button
            onClick={handleCheck}
            className="w-full py-4 rounded-lg font-bold text-xl bg-red-600 hover:bg-red-700 text-white transition duration-200"
          >
            振り向く
          </button>
          <p className="mt-2 text-center text-sm text-gray-500">
            一度しか振り向けません。タイミングを見計らいましょう！
          </p>
        </div>
      </div>
    </div>
  );
} 