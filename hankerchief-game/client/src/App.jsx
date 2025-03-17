import { useState, useEffect } from 'react';
import { useSocket } from './context/SocketContext';
import Lobby from './components/Lobby';
import GameScreen from './components/GameScreen';
import WaitingRoom from './components/WaitingRoom';
import ResultScreen from './components/ResultScreen';

function App() {
  const { socket, connected } = useSocket();
  const [screen, setScreen] = useState('home');
  const [roomId, setRoomId] = useState(null);
  const [playerRole, setPlayerRole] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!socket) return;

    // ルーム作成の応答
    socket.on('room_created', ({ roomId, role }) => {
      setRoomId(roomId);
      setPlayerRole(role);
      setScreen('loading');
    });

    // ルーム参加の応答
    socket.on('room_joined', ({ roomId, role }) => {
      setRoomId(roomId);
      setPlayerRole(role);
      setScreen('loading');
    });

    // ゲーム開始
    socket.on('game_start', ({ players }) => {
      setPlayers(players);
      setScreen('game');
    });

    // ラウンド結果
    socket.on('round_result', (result) => {
      setRoundResult(result);
      setScreen('result');
    });

    // 次のラウンド開始
    socket.on('next_round', ({ players }) => {
      setPlayers(players);
      setScreen('game');
    });

    // エラー処理
    socket.on('error', (error) => {
      alert(`エラー: ${error.message}`);
    });

    // プレイヤー切断
    socket.on('player_disconnected', () => {
      alert('相手が切断しました。ホーム画面に戻ります。');
      setScreen('home');
    });

    return () => {
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('game_start');
      socket.off('round_result');
      socket.off('next_round');
      socket.off('error');
      socket.off('player_disconnected');
    };
  }, [socket]);

  // ルーム作成処理
  const createRoom = (playerName) => {
    if (socket && connected) {
      socket.emit('create_room', { playerName });
    } else {
      alert('サーバーに接続できません。再度お試しください。');
    }
  };

  // ルーム参加処理
  const joinRoom = (roomId, playerName) => {
    if (socket && connected) {
      socket.emit('join_room', { roomId, playerName });
    } else {
      alert('サーバーに接続できません。再度お試しください。');
    }
  };

  // ランダムマッチング
  const joinRandomRoom = (playerName) => {
    if (socket && connected) {
      socket.emit('join_room', { roomId: 'random', playerName });
    } else {
      alert('サーバーに接続できません。再度お試しください。');
    }
  };

  // ルームから退出
  const leaveRoom = () => {
    if (socket && connected && roomId) {
      socket.emit('leave_room', { roomId });
      setRoomId(null);
      setPlayerRole(null);
      setScreen('home');
    }
  };

  // 画面の表示を切り替え
  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return <Lobby 
          onCreateRoom={createRoom} 
          onJoinRoom={joinRoom} 
          onJoinRandomRoom={joinRandomRoom}
          connected={connected} 
        />;
      case 'loading':
        return <WaitingRoom roomId={roomId} onLeave={leaveRoom} />;
      case 'game':
        return <GameScreen 
          socket={socket} 
          roomId={roomId} 
          playerRole={playerRole} 
          players={players}
        />;
      case 'result':
        return <ResultScreen 
          roundResult={roundResult} 
          playerRole={playerRole}
          players={players}
        />;
      default:
        return <div>エラー: 不明な画面です</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col">
      <header className="bg-blue-600 text-white py-4 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">ハンカチ落としゲーム</h1>
          <p className="text-sm">v1.0.1 - Render.comでホスティング</p>
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
