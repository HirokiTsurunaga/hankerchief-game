import { createContext, useContext, useReducer, useEffect } from 'react';
import { useSocket } from './SocketContext';

// ゲームの状態管理のためのコンテキスト
const GameContext = createContext();

// 初期状態
const initialState = {
  gameState: 'lobby', // lobby, waiting, playing, result, gameover
  roomId: null,
  playerName: '',
  playerRole: null, // drop or check
  players: [],
  currentRound: {
    dropTime: null,
    checkTime: null,
    points: 0,
    timeRemaining: 60,
  },
  roundResult: null,
  winner: null,
  error: null,
  mySocketId: null, // 追加：自分のソケットID
  isRandomMatching: false, // 追加：ランダムマッチング中かどうか
};

// アクションタイプ
const actions = {
  SET_PLAYER_NAME: 'SET_PLAYER_NAME',
  CREATE_ROOM: 'CREATE_ROOM',
  JOIN_ROOM: 'JOIN_ROOM',
  SET_GAME_STATE: 'SET_GAME_STATE',
  SET_PLAYER_ROLE: 'SET_PLAYER_ROLE',
  SET_PLAYERS: 'SET_PLAYERS',
  DROP_HANDKERCHIEF: 'DROP_HANDKERCHIEF',
  CHECK_HANDKERCHIEF: 'CHECK_HANDKERCHIEF',
  SET_ROUND_RESULT: 'SET_ROUND_RESULT',
  NEXT_ROUND: 'NEXT_ROUND',
  SET_WINNER: 'SET_WINNER',
  SET_ERROR: 'SET_ERROR',
  RESET_GAME: 'RESET_GAME',
  UPDATE_TIME_REMAINING: 'UPDATE_TIME_REMAINING',
  SET_MY_SOCKET_ID: 'SET_MY_SOCKET_ID', // 追加：自分のソケットIDを設定するアクション
  SET_RANDOM_MATCHING: 'SET_RANDOM_MATCHING', // 追加：ランダムマッチング状態を設定
};

// リデューサー
function gameReducer(state, action) {
  switch (action.type) {
    case actions.SET_PLAYER_NAME:
      return { ...state, playerName: action.payload };
    case actions.CREATE_ROOM:
      return { 
        ...state, 
        roomId: action.payload.roomId,
        playerRole: action.payload.role,
        gameState: 'waiting',
      };
    case actions.JOIN_ROOM:
      return {
        ...state,
        roomId: action.payload.roomId,
        playerRole: action.payload.role,
        gameState: 'waiting',
        isRandomMatching: false, // ルームに参加したらランダムマッチング状態をリセット
      };
    case actions.SET_GAME_STATE:
      return { ...state, gameState: action.payload };
    case actions.SET_PLAYER_ROLE:
      return { ...state, playerRole: action.payload };
    case actions.SET_PLAYERS:
      return { ...state, players: action.payload };
    case actions.DROP_HANDKERCHIEF:
      return { 
        ...state, 
        currentRound: { 
          ...state.currentRound, 
          dropTime: action.payload 
        } 
      };
    case actions.CHECK_HANDKERCHIEF:
      return { 
        ...state, 
        currentRound: { 
          ...state.currentRound, 
          checkTime: action.payload 
        } 
      };
    case actions.SET_ROUND_RESULT:
      return { 
        ...state, 
        roundResult: action.payload,
        gameState: 'result',
      };
    case actions.NEXT_ROUND:
      return {
        ...state,
        playerRole: state.playerRole === 'drop' ? 'check' : 'drop',
        players: action.payload.players,
        currentRound: {
          dropTime: null,
          checkTime: null,
          points: 0,
          timeRemaining: 60,
        },
        roundResult: null,
        gameState: 'playing',
      };
    case actions.SET_WINNER:
      return {
        ...state,
        winner: action.payload,
        gameState: 'gameover',
      };
    case actions.SET_ERROR:
      return { ...state, error: action.payload };
    case actions.RESET_GAME:
      return { 
        ...initialState,
        playerName: state.playerName,
        mySocketId: state.mySocketId,
      };
    case actions.UPDATE_TIME_REMAINING:
      return {
        ...state,
        currentRound: {
          ...state.currentRound,
          timeRemaining: action.payload,
        },
      };
    case actions.SET_MY_SOCKET_ID: // 追加：自分のソケットIDを設定
      console.log("ソケットID設定:", action.payload); // デバッグ用
      return { ...state, mySocketId: action.payload };
    case actions.SET_RANDOM_MATCHING:
      return { ...state, isRandomMatching: action.payload };
    default:
      return state;
  }
}

// プロバイダーコンポーネント
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { socket } = useSocket();

  // ソケットID設定のための副作用
  useEffect(() => {
    if (!socket) return;
    
    // ソケットIDを設定
    console.log("ソケットID設定を試みます:", socket.id); // デバッグ用
    if (socket.id) {
      dispatch({ type: actions.SET_MY_SOCKET_ID, payload: socket.id });
    }

    // 再接続時にソケットIDを更新
    const handleConnect = () => {
      console.log("再接続時のソケットID:", socket.id); // デバッグ用
      dispatch({ type: actions.SET_MY_SOCKET_ID, payload: socket.id });
    };

    socket.on('connect', handleConnect);
    
    return () => {
      socket.off('connect', handleConnect);
    };
  }, [socket]);

  // ソケットイベントリスナーの設定
  useEffect(() => {
    if (!socket) return;

    // ルーム作成成功
    socket.on('room_created', ({ roomId, role }) => {
      dispatch({ type: actions.CREATE_ROOM, payload: { roomId, role } });
    });

    // ルーム参加成功
    socket.on('room_joined', ({ roomId, role }) => {
      dispatch({ type: actions.JOIN_ROOM, payload: { roomId, role } });
    });

    // ゲーム開始
    socket.on('game_start', ({ players }) => {
      dispatch({ type: actions.SET_PLAYERS, payload: players });
      dispatch({ type: actions.SET_GAME_STATE, payload: 'playing' });
    });

    // ハンカチドロップ通知（ドロップした側のみ受信）
    socket.on('handkerchief_dropped', ({ time }) => {
      dispatch({ type: actions.DROP_HANDKERCHIEF, payload: time });
    });

    // ラウンド結果
    socket.on('round_result', (result) => {
      dispatch({ type: actions.SET_ROUND_RESULT, payload: result });
    });

    // 次のラウンド
    socket.on('next_round', (data) => {
      dispatch({ type: actions.NEXT_ROUND, payload: data });
    });

    // ゲーム終了
    socket.on('game_over', ({ winner }) => {
      dispatch({ type: actions.SET_WINNER, payload: winner });
    });

    // プレイヤー切断
    socket.on('player_disconnected', () => {
      dispatch({ type: actions.SET_ERROR, payload: '相手プレイヤーが切断しました' });
      dispatch({ type: actions.SET_GAME_STATE, payload: 'lobby' });
    });

    // エラー
    socket.on('error', ({ message }) => {
      dispatch({ type: actions.SET_ERROR, payload: message });
    });

    return () => {
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('game_start');
      socket.off('handkerchief_dropped');
      socket.off('round_result');
      socket.off('next_round');
      socket.off('game_over');
      socket.off('player_disconnected');
      socket.off('error');
    };
  }, [socket]);

  // アクション関数
  const createRoom = (playerName) => {
    if (socket) {
      socket.emit('create_room', { playerName });
    }
  };

  const joinRoom = (roomId, playerName) => {
    if (socket) {
      // ランダムマッチングかどうかを設定
      if (roomId === 'random') {
        dispatch({ type: actions.SET_RANDOM_MATCHING, payload: true });
      }
      socket.emit('join_room', { roomId, playerName });
    }
  };

  const dropHandkerchief = () => {
    if (socket && state.roomId) {
      socket.emit('drop_handkerchief', { roomId: state.roomId });
    }
  };

  const checkHandkerchief = () => {
    if (socket && state.roomId) {
      socket.emit('check_handkerchief', { roomId: state.roomId });
    }
  };

  const reportTimeout = () => {
    if (socket && state.roomId) {
      socket.emit('round_timeout', { roomId: state.roomId });
    }
  };

  const resetGame = () => {
    // サーバーに退出を通知（現在ルームに所属している場合のみ）
    if (socket && state.roomId) {
      // 退出前に現在のルームIDを保存
      const currentRoomId = state.roomId;
      socket.emit('leave_room', { roomId: currentRoomId });
      console.log(`ルームから退出: ${currentRoomId}`);
    }
    
    // 状態をリセット
    dispatch({ type: actions.RESET_GAME });
  };

  const setPlayerName = (name) => {
    dispatch({ type: actions.SET_PLAYER_NAME, payload: name });
  };

  const updateTimeRemaining = (time) => {
    dispatch({ type: actions.UPDATE_TIME_REMAINING, payload: time });
  };

  // コンテキスト値
  const value = {
    ...state,
    createRoom,
    joinRoom,
    dropHandkerchief,
    checkHandkerchief,
    reportTimeout,
    resetGame,
    setPlayerName,
    updateTimeRemaining,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

// フックを作成
export const useGame = () => {
  return useContext(GameContext);
}; 