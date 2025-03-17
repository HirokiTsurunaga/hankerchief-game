const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// グローバルエラーハンドリング
process.on('uncaughtException', (err) => {
  console.error('未捕捉の例外が発生しました:', err);
  // プロセスを終了せず、アプリを実行し続ける
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未処理のPromise拒否:', reason);
});

// 許可するオリジンの設定
const allowedOrigins = [];
// 開発環境用
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  allowedOrigins.push('http://localhost:5173');
}
// 本番環境用のクライアントURL
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}
// GitHub Pages URL
if (process.env.GITHUB_PAGES_URL) {
  allowedOrigins.push(process.env.GITHUB_PAGES_URL);
} else if (process.env.CLIENT_URL) {
  // CLIENT_URLがGitHub Pagesでない場合は、代替として使用
  allowedOrigins.push(process.env.CLIENT_URL);
}

// 許可されたオリジンがない場合のフォールバック
if (allowedOrigins.length === 0) {
  allowedOrigins.push('http://localhost:5173');
}

console.log('許可されたオリジン:', allowedOrigins);

const app = express();
app.use(cors({
  origin: (origin, callback) => {
    // undefined originはローカル開発環境からのリクエスト
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS ブロック:', origin);
      callback(new Error('CORS policy violation'));
    }
  },
  methods: ["GET", "POST"],
  credentials: true
}));

// ルートパスにシンプルなレスポンスを追加
app.get('/', (req, res) => {
  res.send('ハンカチ落としゲームサーバーが動作中です');
});

// テスト用APIエンドポイントを追加
app.get('/api/test', (req, res) => {
  res.json({ message: 'CORS is working!', timestamp: new Date().toISOString() });
});

// Keepaliveエンドポイント（Railway対策）
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// サーバー自身を定期的にpingするタイマー設定
setInterval(() => {
  try {
    console.log('Keeping server alive...');
    // 自己ping
    http.get(`http://localhost:${process.env.PORT || 3001}/ping`, (res) => {
      console.log('Ping status:', res.statusCode);
    }).on('error', (err) => {
      console.error('Ping error:', err.message);
    });
  } catch (err) {
    console.error('Keepalive error:', err);
  }
}, 60000); // 60秒ごと

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  transports: ['websocket', 'polling'] // 両方のトランスポート方式を明示的に許可
});

// ルームデータを保存するオブジェクト
const rooms = {};

// ゲームの状態
// roomId: {
//   players: [{ id, name, points, role }],
//   gameState: 'waiting' | 'playing' | 'finished',
//   currentRound: { 
//     dropTime: null,
//     checkTime: null,
//     roundEndTime: null,
//     points: 0,
//     timeLimit: 60000 // 60秒
//   }
// }

// Socket.ioイベントハンドラ
io.on('connection', (socket) => {
  console.log(`ユーザーが接続しました: ${socket.id}`);

  // ルーム作成
  socket.on('create_room', ({ playerName }) => {
    const roomId = generateRoomId();
    
    rooms[roomId] = {
      players: [{
        id: socket.id,
        name: playerName || `プレイヤー1`,
        points: 0,
        role: 'drop' // 最初はドロップ役
      }],
      gameState: 'waiting',
      currentRound: {
        dropTime: null, 
        checkTime: null,
        roundEndTime: null,
        points: 0,
        timeLimit: 60000 // 60秒
      }
    };

    socket.join(roomId);
    socket.emit('room_created', { roomId, role: 'drop' });
    console.log(`ルーム作成: ${roomId}, プレイヤー: ${playerName || 'プレイヤー1'}`);
  });

  // ルーム参加
  socket.on('join_room', ({ roomId, playerName }) => {
    // ランダムなルームに参加する処理
    if (roomId === 'random') {
      // 利用可能なルーム（1人のみ参加中でゲームが開始していないルーム、かつ自分自身が作成したルームではないもの）を検索
      const availableRooms = Object.entries(rooms)
        .filter(([_, room]) => {
          // 以下の条件をすべて満たすルームを選択:
          // 1. プレイヤーが1人のみ
          // 2. ゲームが開始していない（waiting状態）
          // 3. そのプレイヤーが自分自身ではない
          return room.players.length === 1 && 
                 room.gameState === 'waiting' && 
                 room.players[0].id !== socket.id;
        })
        .map(([id, _]) => id);
      
      console.log(`利用可能なルーム数: ${availableRooms.length}`);
      
      if (availableRooms.length > 0) {
        // ランダムにルームを選択
        const randomIndex = Math.floor(Math.random() * availableRooms.length);
        roomId = availableRooms[randomIndex];
        console.log(`ランダムに選択されたルーム: ${roomId}`);
      } else {
        // 利用可能なルームがない場合、新しいルームを作成
        roomId = generateRoomId();
        rooms[roomId] = {
          players: [{
            id: socket.id,
            name: playerName || `プレイヤー1`,
            points: 0,
            role: 'drop' // 最初はドロップ役
          }],
          gameState: 'waiting',
          currentRound: {
            dropTime: null, 
            checkTime: null,
            roundEndTime: null,
            points: 0,
            timeLimit: 60000 // 60秒
          }
        };

        socket.join(roomId);
        socket.emit('room_created', { roomId, role: 'drop' });
        console.log(`ランダムマッチング用の新規ルーム作成: ${roomId}, プレイヤー: ${playerName || 'プレイヤー1'}`);
        return;
      }
    }

    const room = rooms[roomId];
    
    if (!room) {
      socket.emit('error', { message: '指定されたルームが存在しません' });
      return;
    }

    if (room.players.length >= 2) {
      socket.emit('error', { message: 'ルームが満員です' });
      return;
    }

    room.players.push({
      id: socket.id,
      name: playerName || `プレイヤー2`,
      points: 0,
      role: 'check' // 2人目はチェック役
    });

    socket.join(roomId);
    socket.emit('room_joined', { roomId, role: 'check' });
    
    // 全プレイヤーにゲーム開始を通知
    io.to(roomId).emit('game_start', { players: room.players });
    room.gameState = 'playing';
    
    console.log(`プレイヤーが参加: ${roomId}, プレイヤー: ${playerName || 'プレイヤー2'}`);
  });

  // ハンカチドロップアクション
  socket.on('drop_handkerchief', ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;

    const now = Date.now();
    room.currentRound.dropTime = now;
    
    // チェック役には通知しない（相手がハンカチを落としたかどうかは分からない）
    socket.emit('handkerchief_dropped', { time: now });
    
    console.log(`ハンカチドロップ: ${roomId}, 時間: ${now}`);
  });

  // 振り向きアクション
  socket.on('check_handkerchief', ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;

    const now = Date.now();
    room.currentRound.checkTime = now;
    
    let dropTime = room.currentRound.dropTime;
    let points = 0;
    let dropped = false;
    
    // ドロップされていて、かつドロップからチェックまで1秒以上経過していたらポイント計算
    if (dropTime && (now - dropTime > 1000)) {
      // 経過秒数をポイントとして計算（最大60秒）
      points = Math.min(Math.floor((now - dropTime - 1000) / 1000), 60);
      dropped = true;
    } else if (!dropTime) {
      // ハンカチが落とされていなかった場合は最大ポイント
      points = 60;
      dropped = false;
    } else {
      // ドロップされているが1秒経過していない（床に落ちきっていない）
      dropped = true;
      points = 0;
    }
    
    room.currentRound.points = points;
    
    // ドロップ役のプレイヤーにポイントを加算
    const dropPlayer = room.players.find(p => p.role === 'drop');
    if (dropPlayer) {
      dropPlayer.points += points;
    }
    
    // 全員にラウンド結果を通知
    io.to(roomId).emit('round_result', {
      dropped,
      points,
      dropTime: dropTime || null,
      checkTime: now,
      playerPoints: room.players.map(p => ({ id: p.id, points: p.points }))
    });
    
    // 役割を交代してラウンドをリセット
    room.players.forEach(player => {
      player.role = player.role === 'drop' ? 'check' : 'drop';
    });
    
    // 10秒後に次のラウンドを開始（3秒から10秒に変更）
    setTimeout(() => {
      room.currentRound = {
        dropTime: null,
        checkTime: null,
        roundEndTime: null,
        points: 0,
        timeLimit: 60000
      };
      
      // 全員に次のラウンド情報を通知
      io.to(roomId).emit('next_round', {
        players: room.players
      });
      
      // 勝利判定（100ポイント以上で勝利）
      const winner = room.players.find(p => p.points >= 100);
      if (winner) {
        io.to(roomId).emit('game_over', { winner });
        room.gameState = 'finished';
      }
      
    }, 10000);
    
    console.log(`振り向きアクション: ${roomId}, 時間: ${now}, ポイント: ${points}`);
  });

  // タイムアウト（60秒経過）
  socket.on('round_timeout', ({ roomId }) => {
    const room = rooms[roomId];
    if (!room || room.gameState !== 'playing') return;
    
    // チェック役が時間内に振り向かなかった場合
    if (!room.currentRound.checkTime) {
      // ドロップ役に最大ポイント
      const dropPlayer = room.players.find(p => p.role === 'drop');
      if (dropPlayer) {
        dropPlayer.points += 60;
      }
      
      // 全員にラウンド結果を通知
      io.to(roomId).emit('round_result', {
        dropped: !!room.currentRound.dropTime,
        points: 60,
        dropTime: room.currentRound.dropTime || null,
        checkTime: null,
        timeout: true,
        playerPoints: room.players.map(p => ({ id: p.id, points: p.points }))
      });
      
      // 役割を交代してラウンドをリセット
      room.players.forEach(player => {
        player.role = player.role === 'drop' ? 'check' : 'drop';
      });
      
      // 次のラウンドを開始（3秒から10秒に変更）
      setTimeout(() => {
        room.currentRound = {
          dropTime: null,
          checkTime: null,
          roundEndTime: null,
          points: 0,
          timeLimit: 60000
        };
        
        // 全員に次のラウンド情報を通知
        io.to(roomId).emit('next_round', {
          players: room.players
        });
        
        // 勝利判定
        const winner = room.players.find(p => p.points >= 100);
        if (winner) {
          io.to(roomId).emit('game_over', { winner });
          room.gameState = 'finished';
        }
      }, 10000);
    }
  });

  // 切断処理
  socket.on('disconnect', () => {
    console.log(`ユーザーが切断しました: ${socket.id}`);
    
    // ユーザーが所属していたルームを見つけて、ゲーム終了処理
    Object.keys(rooms).forEach(roomId => {
      const room = rooms[roomId];
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      
      if (playerIndex !== -1) {
        // 残りのプレイヤーに通知
        socket.to(roomId).emit('player_disconnected');
        
        // 部屋を削除
        delete rooms[roomId];
        console.log(`ルーム削除: ${roomId}`);
      }
    });
  });

  // ルームからの明示的な退出処理
  socket.on('leave_room', ({ roomId }) => {
    console.log(`プレイヤーがルームから退出: ${socket.id}, ルーム: ${roomId}`);
    
    if (roomId && rooms[roomId]) {
      // ルームから退出
      socket.leave(roomId);
      
      // プレイヤーリストからユーザーを削除
      const playerIndex = rooms[roomId].players.findIndex(p => p.id === socket.id);
      
      if (playerIndex !== -1) {
        // 残りのプレイヤーに通知
        socket.to(roomId).emit('player_disconnected');
        
        // 部屋を削除（または状態をリセット）
        delete rooms[roomId];
        console.log(`ルーム削除: ${roomId}`);
      }
    }
  });
});

// ランダムなルームIDを生成
function generateRoomId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// サーバー起動
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
}); 