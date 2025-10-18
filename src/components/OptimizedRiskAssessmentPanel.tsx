'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, Progress, Alert, Badge, Button, Space, Statistic, Timeline, Tooltip, Spin } from 'antd';
import { 
  WarningOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  ReloadOutlined,
  WifiOutlined,
  DisconnectOutlined,
  CloudOutlined,
  BuildOutlined,
  TeamOutlined,
  ToolOutlined,
  GlobalOutlined,
  RiseOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { useWebSocket, WebSocketMessage } from '../hooks/useWebSocket';

interface RiskData {
  overallRisk: number;
  riskBreakdown: {
    weather: number;
    obstacle: number;
    population: number;
    equipment: number;
    airspace: number;
  };
  recommendations: string[];
  confidence: number;
  timestamp: number;
}

interface OptimizedRiskAssessmentPanelProps {
  droneId?: string;
  location?: {
    lat: number;
    lng: number;
    altitude: number;
  };
  onRiskUpdate?: (riskData: RiskData) => void;
}

export const OptimizedRiskAssessmentPanel: React.FC<OptimizedRiskAssessmentPanelProps> = ({ 
  droneId = 'UAV-001',
  location = { lat: 39.9042, lng: 116.4074, altitude: 120 },
  onRiskUpdate
}) => {
  const [riskData, setRiskData] = useState<RiskData>({
    overallRisk: 0,
    riskBreakdown: {
      weather: 0,
      obstacle: 0,
      population: 0,
      equipment: 0,
      airspace: 0
    },
    recommendations: [],
    confidence: 0.8,
    timestamp: Date.now()
  });

  const [riskTrend, setRiskTrend] = useState<Array<{ timestamp: number; risk: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [useSimulatedData, setUseSimulatedData] = useState(false);

  // WebSocket连接
  const { sendMessage, lastMessage, isConnected, connectionAttempts } = useWebSocket({
    onMessage: (message: WebSocketMessage) => {
      if (message.type === 'risk_update') {
        const newRiskData = message.data as RiskData;
        setRiskData(newRiskData);
        setLastUpdateTime(new Date());
        setIsLoading(false);
        
        // 更新趋势数据
        setRiskTrend(prev => {
          const newTrend = [...prev, { 
            timestamp: newRiskData.timestamp, 
            risk: newRiskData.overallRisk 
          }];
          // 只保留最近20个数据点
          return newTrend.slice(-20);
        });

        // 通知父组件
        onRiskUpdate?.(newRiskData);
      }
    },
    onOpen: () => {
      console.log('🔗 风险评估WebSocket已连接');
      // 请求初始数据
      sendMessage({
        type: 'subscribe_risk',
        droneId,
        location
      });
    },
    onError: (error) => {
      console.error('❌ 风险评估WebSocket错误:', error);
      setIsLoading(false);
      // WebSocket连接失败，启用模拟数据
      setUseSimulatedData(true);
    }
  });

  // 初始化数据和定时更新
  useEffect(() => {
    console.log('🚀 初始化优化风险评估面板');
    
    // 延迟3秒后如果还没有连接成功，就使用模拟数据
    const fallbackTimer = setTimeout(() => {
      if (!isConnected) {
        console.log('⚠️ WebSocket连接超时，切换到模拟数据模式');
        setUseSimulatedData(true);
        handleRefresh();
      }
    }, 3000);

    // 立即尝试获取数据
    handleRefresh();

    // 设置定时更新（每15秒）
    const interval = setInterval(() => {
      handleRefresh();
    }, 15000);

    return () => {
      clearTimeout(fallbackTimer);
      clearInterval(interval);
    };
  }, [isConnected]);

  // 生成模拟风险数据
  const generateSimulatedRiskData = (): RiskData => {
    const now = Date.now();
    const timeOfDay = new Date().getHours();
    
    // 基于时间和随机因素生成风险数据
    const weatherRisk = Math.min(0.1 + Math.random() * 0.3 + (timeOfDay > 18 ? 0.2 : 0), 1);
    const obstacleRisk = Math.min(0.05 + Math.random() * 0.25, 1);
    const populationRisk = Math.min(0.1 + Math.random() * 0.4 + (timeOfDay >= 8 && timeOfDay <= 18 ? 0.3 : 0), 1);
    const equipmentRisk = Math.min(0.05 + Math.random() * 0.2, 1);
    const airspaceRisk = Math.min(0.02 + Math.random() * 0.15, 1);
    
    // 计算综合风险
    const overallRisk = (weatherRisk * 0.25 + obstacleRisk * 0.2 + populationRisk * 0.15 + equipmentRisk * 0.3 + airspaceRisk * 0.1);
    
    // 生成建议
    const recommendations: string[] = [];
    if (weatherRisk > 0.4) recommendations.push('天气条件不佳，建议谨慎飞行');
    if (equipmentRisk > 0.3) recommendations.push('设备状态需要检查');
    if (populationRisk > 0.5) recommendations.push('避开人群密集区域');
    if (overallRisk < 0.3) recommendations.push('飞行条件良好，可以正常执行任务');
    
    return {
      overallRisk,
      riskBreakdown: {
        weather: weatherRisk,
        obstacle: obstacleRisk,
        population: populationRisk,
        equipment: equipmentRisk,
        airspace: airspaceRisk
      },
      recommendations,
      confidence: 0.75 + Math.random() * 0.2,
      timestamp: now
    };
  };

  // 手动刷新数据
  const handleRefresh = () => {
    setIsLoading(true);
    
    if (useSimulatedData || !isConnected) {
      // 使用模拟数据
      console.log('🎲 生成模拟风险数据');
      const simulatedData = generateSimulatedRiskData();
      setRiskData(simulatedData);
      setLastUpdateTime(new Date());
      setIsLoading(false);
      
      // 更新趋势数据
      setRiskTrend(prev => {
        const newTrend = [...prev, { 
          timestamp: simulatedData.timestamp, 
          risk: simulatedData.overallRisk 
        }];
        return newTrend.slice(-20);
      });
      
      onRiskUpdate?.(simulatedData);
    } else {
      // 尝试通过WebSocket获取数据
      sendMessage({
        type: 'request_risk_update',
        droneId,
        location,
        timestamp: Date.now()
      });
    }
  };

  // 获取风险等级信息
  const getRiskLevel = (risk: number) => {
    if (risk >= 0.7) return { 
      level: 'high', 
      color: '#FF4D4F', 
      text: '高风险', 
      icon: <ExclamationCircleOutlined />,
      bgColor: 'rgba(255, 77, 79, 0.1)'
    };
    if (risk >= 0.4) return { 
      level: 'medium', 
      color: '#FAAD14', 
      text: '中风险', 
      icon: <WarningOutlined />,
      bgColor: 'rgba(250, 173, 20, 0.1)'
    };
    if (risk >= 0.2) return { 
      level: 'low', 
      color: '#1890FF', 
      text: '低风险', 
      icon: <WarningOutlined />,
      bgColor: 'rgba(24, 144, 255, 0.1)'
    };
    return { 
      level: 'safe', 
      color: '#52C41A', 
      text: '安全', 
      icon: <CheckCircleOutlined />,
      bgColor: 'rgba(82, 196, 26, 0.1)'
    };
  };

  const overallRiskInfo = getRiskLevel(riskData.overallRisk);

  // 风险类型配置
  const riskConfig = {
    weather: { icon: <CloudOutlined />, name: '天气风险', unit: '%' },
    obstacle: { icon: <BuildOutlined />, name: '障碍物风险', unit: '%' },
    population: { icon: <TeamOutlined />, name: '人群密度风险', unit: '%' },
    equipment: { icon: <ToolOutlined />, name: '设备状态风险', unit: '%' },
    airspace: { icon: <GlobalOutlined />, name: '空域管制风险', unit: '%' }
  };

  // 连接状态指示器
  const ConnectionStatus = () => (
    <Tooltip title={isConnected ? '实时连接正常' : `连接中断 (重试: ${connectionAttempts})`}>
      <Badge 
        status={isConnected ? 'processing' : 'error'} 
        text={
          <Space size="small">
            {isConnected ? <WifiOutlined /> : <DisconnectOutlined />}
            <span style={{ fontSize: '11px' }}>
              {isConnected ? '实时' : '离线'}
            </span>
          </Space>
        }
      />
    </Tooltip>
  );

  // 趋势图组件
  const TrendChart = useMemo(() => {
    if (riskTrend.length < 2) return null;

    const maxRisk = Math.max(...riskTrend.map(t => t.risk));
    const minRisk = Math.min(...riskTrend.map(t => t.risk));
    const riskRange = maxRisk - minRisk || 0.1;

    return (
      <div style={{ height: '120px', position: 'relative' }}>
        <svg width="100%" height="100%" style={{ 
          background: 'rgba(0,0,0,0.3)', 
          borderRadius: '6px', 
          border: '1px solid rgba(24,144,255,0.3)' 
        }}>
          {/* 背景网格 */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(24,144,255,0.1)" strokeWidth="0.5"/>
            </pattern>
            <linearGradient id="riskGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={overallRiskInfo.color} stopOpacity="0.3"/>
              <stop offset="100%" stopColor={overallRiskInfo.color} stopOpacity="0.1"/>
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* 趋势线和填充 */}
          {riskTrend.length > 1 && (
            <>
              <polygon
                fill="url(#riskGradient)"
                points={`0,100 ${riskTrend.map((point, index) => {
                  const x = (index / (riskTrend.length - 1)) * 100;
                  const y = 100 - ((point.risk - minRisk) / riskRange) * 80;
                  return `${x},${y}`;
                }).join(' ')} 100,100`}
              />
              
              <polyline
                fill="none"
                stroke={overallRiskInfo.color}
                strokeWidth="2"
                strokeLinecap="round"
                points={riskTrend.map((point, index) => {
                  const x = (index / (riskTrend.length - 1)) * 100;
                  const y = 100 - ((point.risk - minRisk) / riskRange) * 80;
                  return `${x},${y}`;
                }).join(' ')}
              />
            </>
          )}
          
          {/* 数据点 */}
          {riskTrend.map((point, index) => {
            const x = (index / (riskTrend.length - 1)) * 100;
            const y = 100 - ((point.risk - minRisk) / riskRange) * 80;
            const pointRiskInfo = getRiskLevel(point.risk);
            
            return (
              <g key={index}>
                <circle
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="3"
                  fill={pointRiskInfo.color}
                  stroke="white"
                  strokeWidth="1"
                />
              </g>
            );
          })}
        </svg>
        
        {/* 当前值显示 */}
        <div style={{ 
          position: 'absolute', 
          top: '8px', 
          right: '8px', 
          background: overallRiskInfo.bgColor,
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          color: overallRiskInfo.color,
          fontWeight: 'bold',
          border: `1px solid ${overallRiskInfo.color}`
        }}>
          {Math.round(riskData.overallRisk * 100)}%
        </div>
      </div>
    );
  }, [riskTrend, riskData.overallRisk, overallRiskInfo]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'auto' }}>
      {/* 主要风险评估卡片 */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Space size="small">
              <ThunderboltOutlined style={{ color: '#1890FF' }} />
              <span style={{ color: '#1890FF', fontWeight: 'bold', fontSize: '14px' }}>
                实时风险评估 - {droneId}
              </span>
            </Space>
            <Space size="small">
              <ConnectionStatus />
              <Button 
                icon={<ReloadOutlined />} 
                size="small" 
                loading={isLoading}
                onClick={handleRefresh}
              >
                刷新
              </Button>
              <Button 
                type={useSimulatedData ? "primary" : "default"}
                size="small" 
                onClick={() => {
                  setUseSimulatedData(!useSimulatedData);
                  if (!useSimulatedData) {
                    console.log('🎲 手动启用模拟数据模式');
                    handleRefresh();
                  }
                }}
              >
                {useSimulatedData ? '模拟模式' : '启用模拟'}
              </Button>
            </Space>
          </div>
        }
        className="glass-panel glow-blue"
        size="small"
        bodyStyle={{ padding: '12px' }}
      >
        <Spin spinning={isLoading} tip="获取风险数据中...">
          <Row gutter={[12, 12]}>
            {/* 综合风险显示 */}
            <Col span={24}>
              <div style={{ 
                textAlign: 'center', 
                marginBottom: '12px',
                padding: '16px',
                background: overallRiskInfo.bgColor,
                borderRadius: '8px',
                border: `1px solid ${overallRiskInfo.color}`
              }}>
                <div style={{ 
                  fontSize: '42px', 
                  fontWeight: 'bold', 
                  color: overallRiskInfo.color,
                  textShadow: `0 0 15px ${overallRiskInfo.color}`,
                  marginBottom: '8px',
                  fontFamily: 'monospace'
                }}>
                  {Math.round(riskData.overallRisk * 100)}%
                </div>
                <Badge 
                  color={overallRiskInfo.color} 
                  text={
                    <span style={{ 
                      color: overallRiskInfo.color, 
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}>
                      {overallRiskInfo.icon} {overallRiskInfo.text}
                    </span>
                  } 
                />
              </div>
            </Col>

            {/* 统计信息 */}
            <Col span={8}>
              <Statistic
                title="置信度"
                value={Math.round(riskData.confidence * 100)}
                suffix="%"
                valueStyle={{ 
                  color: riskData.confidence > 0.8 ? '#52C41A' : '#FAAD14', 
                  fontSize: '16px' 
                }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="飞行高度"
                value={location.altitude}
                suffix="m"
                valueStyle={{ fontSize: '16px', color: '#1890FF' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="更新时间"
                value={lastUpdateTime.toLocaleTimeString()}
                valueStyle={{ fontSize: '12px', color: '#8C8C8C' }}
              />
            </Col>
          </Row>
        </Spin>

        {/* 高风险警报 */}
        {riskData.overallRisk >= 0.4 && (
          <Alert
            message={`${overallRiskInfo.text}警告`}
            description={`当前区域风险等级为${overallRiskInfo.text}，建议立即采取相应措施或调整飞行计划。`}
            type={riskData.overallRisk >= 0.7 ? 'error' : 'warning'}
            showIcon
            style={{ marginTop: '16px' }}
            action={
              <Button size="small" type="text">
                查看详情
              </Button>
            }
          />
        )}
      </Card>

      {/* 详细风险分析 */}
      <Card 
        title="📊 风险因子分析" 
        className="glass-panel glow-blue"
        size="small"
        bodyStyle={{ padding: '12px' }}
      >
        <Row gutter={[8, 8]}>
          {Object.entries(riskData.riskBreakdown).map(([type, risk]) => {
            const riskInfo = getRiskLevel(risk);
            const config = riskConfig[type as keyof typeof riskConfig];
            
            return (
              <Col span={24} key={type}>
                <div style={{ 
                  padding: '8px 12px',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '6px',
                  border: `1px solid ${riskInfo.color}20`
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginBottom: '6px'
                  }}>
                    <Space size="small">
                      <span style={{ color: riskInfo.color }}>{config.icon}</span>
                      <span style={{ fontSize: '12px', color: 'white' }}>
                        {config.name}
                      </span>
                    </Space>
                    <span style={{ 
                      fontSize: '12px', 
                      color: riskInfo.color, 
                      fontWeight: 'bold',
                      fontFamily: 'monospace'
                    }}>
                      {Math.round(risk * 100)}{config.unit}
                    </span>
                  </div>
                  <Progress
                    percent={Math.round(risk * 100)}
                    strokeColor={riskInfo.color}
                    trailColor="rgba(255,255,255,0.1)"
                    size="small"
                    showInfo={false}
                  />
                </div>
              </Col>
            );
          })}
        </Row>
      </Card>

      {/* 智能建议 */}
      {riskData.recommendations.length > 0 && (
        <Card 
          title="💡 智能建议" 
          className="glass-panel glow-orange"
          size="small"
          bodyStyle={{ padding: '12px' }}
        >
          <Timeline
            items={riskData.recommendations.slice(0, 4).map((rec, index) => ({
              color: index === 0 ? '#FF4D4F' : index === 1 ? '#FAAD14' : '#1890FF',
              children: (
                <div style={{ 
                  fontSize: '11px', 
                  color: 'white', 
                  lineHeight: '1.4',
                  padding: '4px 0'
                }}>
                  {rec}
                </div>
              )
            }))}
          />
        </Card>
      )}

      {/* 实时趋势图 */}
      <Card 
        title={
          <Space size="small">
            <RiseOutlined />
            <span style={{ fontSize: '12px' }}>实时风险趋势</span>
            {isConnected && (
              <Badge status="processing" text="实时更新" />
            )}
          </Space>
        }
        className="glass-panel glow-blue"
        size="small"
        bodyStyle={{ padding: '12px' }}
      >
        {TrendChart || (
          <div style={{ 
            height: '120px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#8C8C8C',
            fontSize: '12px'
          }}>
            等待数据中...
          </div>
        )}
        
        {/* 趋势摘要 */}
        {riskTrend.length > 1 && (
          <div style={{ 
            marginTop: '8px', 
            padding: '6px 8px', 
            background: 'rgba(24,144,255,0.1)', 
            borderRadius: '4px',
            fontSize: '10px',
            color: '#8C8C8C'
          }}>
            <Space split={<span>|</span>}>
              <span>
                数据点: <span style={{ color: '#1890FF' }}>{riskTrend.length}</span>
              </span>
              <span>
                最高: <span style={{ color: '#FF4D4F' }}>
                  {Math.round(Math.max(...riskTrend.map(t => t.risk)) * 100)}%
                </span>
              </span>
              <span>
                最低: <span style={{ color: '#52C41A' }}>
                  {Math.round(Math.min(...riskTrend.map(t => t.risk)) * 100)}%
                </span>
              </span>
            </Space>
          </div>
        )}
      </Card>
    </div>
  );
};