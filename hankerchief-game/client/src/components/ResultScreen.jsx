import { useGame } from '../context/GameContext';
import { useState, useEffect, useRef } from 'react';

export default function ResultScreen() {
  const { roundResult, playerRole, players, mySocketId } = useGame();
  
  // ポイント表示用の状態
  const [basePoints, setBasePoints] = useState(0);           // 前回までの累積ポイント
  const [baseOpponentPoints, setBaseOpponentPoints] = useState(0); // 相手の前回までの累積ポイント
  const [animatedRoundPoints, setAnimatedRoundPoints] = useState(0); // 今回の獲得ポイントのアニメーション用
  
  // アニメーションフレームIDを管理するためのref
  const animationFrameRef = useRef(null);
  const animationStartTimeRef = useRef(null);
  
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
  
  // ポイント計算とアニメーションを制御するエフェクト
  useEffect(() => {
    if (!roundResult) return;
    
    // 現在のアニメーションがあれば停止
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // このラウンドで獲得したポイントを計算
    const roundPoints = playerRole === 'drop' ? roundResult.points : 0;
    const opponentRoundPoints = playerRole === 'drop' ? 0 : roundResult.points;
    
    // サーバーから送られてきた最新のポイント情報を取得
    let totalMyPoints = currentPlayer?.points || 0;
    let totalOpponentPoints = opponentPlayer?.points || 0;
    
    if (roundResult.playerPoints && roundResult.playerPoints.length === 2) {
      const myPlayerPoint = roundResult.playerPoints.find(p => p.id === mySocketId);
      const opponentPlayerPoint = roundResult.playerPoints.find(p => p.id !== mySocketId);
      
      if (myPlayerPoint) {
        totalMyPoints = myPlayerPoint.points;
      }
      
      if (opponentPlayerPoint) {
        totalOpponentPoints = opponentPlayerPoint.points;
      }
    }

    // 前回までの累積ポイントを計算
    const previousMyPoints = totalMyPoints - roundPoints;
    const previousOpponentPoints = totalOpponentPoints - opponentRoundPoints;
    
    // 前回までのポイントをすぐに表示
    setBasePoints(previousMyPoints);
    setBaseOpponentPoints(previousOpponentPoints);
    setAnimatedRoundPoints(0); // アニメーション開始時は0から
    
    // アニメーションの設定
    const duration = 1500; // アニメーション期間（ミリ秒）
    animationStartTimeRef.current = null;
    
    // 少し遅延させてからアニメーション開始
    const animationStartTimeout = setTimeout(() => {
      const animate = (timestamp) => {
        if (!animationStartTimeRef.current) {
          animationStartTimeRef.current = timestamp;
        }
        
        const elapsed = timestamp - animationStartTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        
        // 線形アニメーション（シンプルに）
        setAnimatedRoundPoints(progress);
        
        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          // アニメーション完了時
          setAnimatedRoundPoints(1); // 100%まで表示
          animationFrameRef.current = null;
        }
      };
      
      animationFrameRef.current = requestAnimationFrame(animate);
    }, 500);
    
    // クリーンアップ関数
    return () => {
      clearTimeout(animationStartTimeout);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [roundResult, players, playerRole, mySocketId]);
  
  // プレイヤーの獲得ポイント
  const myRoundPoints = playerRole === 'drop' ? roundResult.points : 0;
  // 相手の獲得ポイント
  const opponentRoundPoints = playerRole === 'drop' ? 0 : roundResult.points;
  
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
                <p className="text-xl font-bold text-black">{myRoundPoints}ポイント</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-black">相手</p>
                <p className="text-xl font-bold text-black">{opponentRoundPoints}ポイント</p>
              </div>
            </div>
          </div>
          
          {/* 縦型プログレスバーを使った累積ポイント表示 */}
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2 text-black text-center">現在の合計</h3>
            
            <div className="flex justify-around items-end h-60 mt-4 mb-2">
              {/* プレイヤーのプログレスバー */}
              <div className="flex flex-col items-center w-1/3">
                <div className="text-center mb-2">
                  <p className="text-sm font-medium text-black">あなた</p>
                  <p className="text-xl font-bold text-black">{basePoints + Math.round(myRoundPoints * animatedRoundPoints)}ポイント</p>
                </div>
                <div className="relative w-16 h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                  {/* 前回までの累積ポイント */}
                  <div 
                    className="absolute bottom-0 w-full bg-blue-600 rounded-t-lg"
                    style={{ 
                      height: `${Math.min(basePoints, 100) / 100 * 100}%`
                    }}
                  ></div>
                  
                  {/* 今回獲得した分のポイント（アニメーション） */}
                  {myRoundPoints > 0 && (
                    <div 
                      className="absolute w-full bg-blue-600 rounded-t-lg"
                      style={{ 
                        height: `${Math.min(myRoundPoints, 100) / 100 * 100 * animatedRoundPoints}%`,
                        bottom: `${Math.min(basePoints, 100) / 100 * 100}%`
                      }}
                    ></div>
                  )}
                  
                  {/* 目盛り */}
                  <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-between pointer-events-none">
                    <div className="flex w-full items-center">
                      <div className="border-t border-gray-400 w-3 h-0"></div>
                      <span className="text-xs text-gray-600 ml-1">100</span>
                    </div>
                    <div className="flex w-full items-center">
                      <div className="border-t border-gray-400 w-3 h-0"></div>
                      <span className="text-xs text-gray-600 ml-1">75</span>
                    </div>
                    <div className="flex w-full items-center">
                      <div className="border-t border-gray-400 w-3 h-0"></div>
                      <span className="text-xs text-gray-600 ml-1">50</span>
                    </div>
                    <div className="flex w-full items-center">
                      <div className="border-t border-gray-400 w-3 h-0"></div>
                      <span className="text-xs text-gray-600 ml-1">25</span>
                    </div>
                    <div className="flex w-full items-center">
                      <div className="border-t border-gray-400 w-3 h-0"></div>
                      <span className="text-xs text-gray-600 ml-1">0</span>
                    </div>
                  </div>
                </div>
                <div className="text-xs mt-1 text-gray-600">100ポイントで勝利</div>
              </div>
              
              {/* 相手プレイヤーのプログレスバー */}
              <div className="flex flex-col items-center w-1/3">
                <div className="text-center mb-2">
                  <p className="text-sm font-medium text-black">相手</p>
                  <p className="text-xl font-bold text-black">{baseOpponentPoints + Math.round(opponentRoundPoints * animatedRoundPoints)}ポイント</p>
                </div>
                <div className="relative w-16 h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                  {/* 前回までの累積ポイント */}
                  <div 
                    className="absolute bottom-0 w-full bg-red-500 rounded-t-lg"
                    style={{ 
                      height: `${Math.min(baseOpponentPoints, 100) / 100 * 100}%`
                    }}
                  ></div>
                  
                  {/* 今回獲得した分のポイント（アニメーション） */}
                  {opponentRoundPoints > 0 && (
                    <div 
                      className="absolute w-full bg-red-500 rounded-t-lg"
                      style={{ 
                        height: `${Math.min(opponentRoundPoints, 100) / 100 * 100 * animatedRoundPoints}%`,
                        bottom: `${Math.min(baseOpponentPoints, 100) / 100 * 100}%`
                      }}
                    ></div>
                  )}
                  
                  {/* 目盛り */}
                  <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-between pointer-events-none">
                    <div className="flex w-full items-center">
                      <div className="border-t border-gray-400 w-3 h-0"></div>
                      <span className="text-xs text-gray-600 ml-1">100</span>
                    </div>
                    <div className="flex w-full items-center">
                      <div className="border-t border-gray-400 w-3 h-0"></div>
                      <span className="text-xs text-gray-600 ml-1">75</span>
                    </div>
                    <div className="flex w-full items-center">
                      <div className="border-t border-gray-400 w-3 h-0"></div>
                      <span className="text-xs text-gray-600 ml-1">50</span>
                    </div>
                    <div className="flex w-full items-center">
                      <div className="border-t border-gray-400 w-3 h-0"></div>
                      <span className="text-xs text-gray-600 ml-1">25</span>
                    </div>
                    <div className="flex w-full items-center">
                      <div className="border-t border-gray-400 w-3 h-0"></div>
                      <span className="text-xs text-gray-600 ml-1">0</span>
                    </div>
                  </div>
                </div>
                <div className="text-xs mt-1 text-gray-600">100ポイントで勝利</div>
              </div>
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