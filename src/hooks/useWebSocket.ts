'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface UseWebSocketOptions {
  url?: string;
  protocols?: string | string[];
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const {
    url = process.env.NODE_ENV === 'production' 
      ? 'wss://skybrain-api.vercel.app/ws' 
      : 'ws://localhost:3007/ws',
    protocols,
    onOpen,
    onClose,
    onError,
    onMessage,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    heartbeatInterval = 30000
  } = options;

  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutId = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutId = useRef<NodeJS.Timeout | null>(null);
  const messageQueue = useRef<string[]>([]);

  // 发送心跳包
  const sendHeartbeat = useCallback(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'heartbeat',
        timestamp: Date.now()
      }));
    }
  }, []);

  // 启动心跳
  const startHeartbeat = useCallback(() => {
    if (heartbeatTimeoutId.current) {
      clearInterval(heartbeatTimeoutId.current);
    }
    heartbeatTimeoutId.current = setInterval(sendHeartbeat, heartbeatInterval);
  }, [sendHeartbeat, heartbeatInterval]);

  // 停止心跳
  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimeoutId.current) {
      clearInterval(heartbeatTimeoutId.current);
      heartbeatTimeoutId.current = null;
    }
  }, []);

  // 发送消息
  const sendMessage = useCallback((message: any) => {
    const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
    
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(messageStr);
    } else {
      // 如果连接未就绪，将消息加入队列
      messageQueue.current.push(messageStr);
    }
  }, []);

  // 发送队列中的消息
  const sendQueuedMessages = useCallback(() => {
    while (messageQueue.current.length > 0 && ws.current?.readyState === WebSocket.OPEN) {
      const message = messageQueue.current.shift();
      if (message) {
        ws.current.send(message);
      }
    }
  }, []);

  // 连接WebSocket
  const connect = useCallback(() => {
    try {
      // 如果在生产环境且没有真实WebSocket服务，使用模拟连接
      if (process.env.NODE_ENV === 'production' && !url.includes('vercel.app')) {
        // 模拟WebSocket连接
        console.log('🔄 模拟WebSocket连接 (生产环境)');
        setReadyState(WebSocket.OPEN);
        setIsConnected(true);
        setConnectionAttempts(0);
        
        // 模拟定期接收数据
        const simulateData = () => {
          const mockMessage: WebSocketMessage = {
            type: 'risk_update',
            data: {
              overallRisk: Math.random() * 0.8,
              riskBreakdown: {
                weather: Math.random() * 0.6,
                obstacle: Math.random() * 0.4,
                population: Math.random() * 0.7,
                equipment: Math.random() * 0.3,
                airspace: Math.random() * 0.5
              },
              recommendations: [
                '建议降低飞行高度至80米以下',
                '注意东南方向的强风影响',
                '避开人群密集区域'
              ],
              confidence: 0.85 + Math.random() * 0.15,
              timestamp: Date.now()
            },
            timestamp: Date.now()
          };
          
          setLastMessage(mockMessage);
          onMessage?.(mockMessage);
        };

        // 立即发送一次数据
        simulateData();
        
        // 每5秒发送一次模拟数据
        const interval = setInterval(simulateData, 5000);
        
        // 清理函数
        return () => clearInterval(interval);
      } else {
        // 真实WebSocket连接
        ws.current = new WebSocket(url, protocols);
        
        ws.current.onopen = (event) => {
          console.log('✅ WebSocket连接已建立');
          setReadyState(WebSocket.OPEN);
          setIsConnected(true);
          setConnectionAttempts(0);
          startHeartbeat();
          sendQueuedMessages();
          onOpen?.(event);
        };

        ws.current.onclose = (event) => {
          console.log('❌ WebSocket连接已关闭', event.code, event.reason);
          setReadyState(WebSocket.CLOSED);
          setIsConnected(false);
          stopHeartbeat();
          onClose?.(event);

          // 自动重连
          if (connectionAttempts < reconnectAttempts) {
            setConnectionAttempts(prev => prev + 1);
            reconnectTimeoutId.current = setTimeout(() => {
              console.log(`🔄 尝试重连... (${connectionAttempts + 1}/${reconnectAttempts})`);
              connect();
            }, reconnectInterval);
          }
        };

        ws.current.onerror = (event) => {
          console.error('❌ WebSocket连接错误:', event);
          setReadyState(WebSocket.CLOSED);
          setIsConnected(false);
          onError?.(event);
        };

        ws.current.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            setLastMessage(message);
            onMessage?.(message);
          } catch (error) {
            console.error('❌ 解析WebSocket消息失败:', error);
          }
        };
      }
    } catch (error) {
      console.error('❌ 创建WebSocket连接失败:', error);
      setReadyState(WebSocket.CLOSED);
      setIsConnected(false);
    }
  }, [url, protocols, onOpen, onClose, onError, onMessage, connectionAttempts, reconnectAttempts, reconnectInterval, startHeartbeat, sendQueuedMessages]);

  // 断开连接
  const disconnect = useCallback(() => {
    if (reconnectTimeoutId.current) {
      clearTimeout(reconnectTimeoutId.current);
      reconnectTimeoutId.current = null;
    }
    
    stopHeartbeat();
    
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    
    setReadyState(WebSocket.CLOSED);
    setIsConnected(false);
  }, [stopHeartbeat]);

  // 初始化连接
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, []);

  // 清理
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    sendMessage,
    lastMessage,
    readyState,
    isConnected,
    connectionAttempts,
    connect,
    disconnect
  };
};

// WebSocket状态常量
export const WEBSOCKET_STATE = {
  CONNECTING: WebSocket.CONNECTING,
  OPEN: WebSocket.OPEN,
  CLOSING: WebSocket.CLOSING,
  CLOSED: WebSocket.CLOSED
} as const;