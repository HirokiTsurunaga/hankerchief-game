import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // 環境変数からサーバーURLを取得する（デフォルトはローカル開発用）
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
    console.log('接続先サーバー:', serverUrl);
    
    const socketInstance = io(serverUrl);

    socketInstance.on('connect', () => {
      console.log('Socket.io接続成功');
      console.log('ソケットID:', socketInstance.id);
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket.io切断');
      setConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const value = {
    socket,
    connected,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 