import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import GameRules from './GameRules';

export default function Lobby() {
  const { createRoom, joinRoom, setPlayerName, playerName, error, mySocketId } = useGame();
  const [roomId, setRoomId] = useState('');
  const [view, setView] = useState('menu'); // menu, join のみに変更

  // ロビー画面マウント時にURLパラメータを確認し、ソケットIDをチェック
  useEffect(() => {
    console.log("ロビー画面表示時のソケットID:", mySocketId);
    
    // URLからroomIdを取得（QRコードからのアクセス対応）
    const urlParams = new URLSearchParams(window.location.search);
    const roomIdFromUrl = urlParams.get('roomId');
    
    if (roomIdFromUrl) {
      // URLにルームIDが含まれている場合は自動的にJOIN画面に切り替え
      setRoomId(roomIdFromUrl);
      setView('join');
      
      // URLパラメータをクリア（履歴に残さないため）
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [mySocketId]);

  // 直接ルームを作成する処理
  const handleCreateRoom = () => {
    console.log("ルーム作成時のソケットID:", mySocketId);
    createRoom(playerName);
  };

  // 特定のルームに参加する処理
  const handleJoinRoom = (e) => {
    e.preventDefault();
    console.log("ルーム参加時のソケットID:", mySocketId);
    joinRoom(roomId, playerName);
  };

  // ランダムにルームに参加する処理
  const handleJoinRandomRoom = () => {
    console.log("ランダムなルームに参加:", mySocketId);
    joinRoom('random', playerName); // 'random'キーワードを使用して、サーバー側でランダムルームを探す
  };

  // メニュー画面
  if (view === 'menu') {
    return (
      <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-blue-200">
        <div className="w-full max-w-lg mx-auto p-4">
          <div className="bg-white p-8 rounded-xl shadow-lg w-full">
            <h1 className="text-3xl font-bold text-center text-blue-600 mb-8">ハンカチ落としゲーム</h1>
            
            <div className="mb-6">
              <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-2">プレイヤー名</label>
              <input
                type="text"
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="名前を入力（任意）"
              />
            </div>
            
            <div className="space-y-4">
              <button
                onClick={handleCreateRoom}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-200"
              >
                ルームを作成する
              </button>
              
              <button
                onClick={() => setView('join')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition duration-200"
              >
                ルームに参加する
              </button>
              
              <button
                onClick={handleJoinRandomRoom}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-md transition duration-200"
              >
                ランダムなルームに参加
              </button>
            </div>
            
            <div className="mt-6">
              <GameRules />
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            {/* デバッグ情報 */}
            <div className="mt-4 text-xs text-gray-400 text-center">
              接続ID: {mySocketId || 'なし'}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // ルーム参加画面
  return (
    <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-blue-200">
      <div className="w-full max-w-lg mx-auto p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full">
          <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">ルームに参加</h1>
          
          <form onSubmit={handleJoinRoom} className="space-y-6">
            <div>
              <label htmlFor="joinPlayerName" className="block text-sm font-medium text-gray-700 mb-2">プレイヤー名</label>
              <input
                type="text"
                id="joinPlayerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="名前を入力（任意）"
              />
            </div>
            
            <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-2">ルームID</label>
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ルームIDを入力"
                maxLength={6}
                required
              />
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition duration-200"
              >
                ルームに参加する
              </button>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => setView('menu')}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                メインメニューに戻る
              </button>
            </div>
          </form>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 