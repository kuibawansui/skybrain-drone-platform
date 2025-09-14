'use client';

import React, { useState, useEffect } from 'react';
import { ClientOnly } from './ClientOnly';
import { Card, Statistic, Progress, List, Badge, Space, Row, Col, Tooltip } from 'antd';
import { 
  RocketOutlined, 
  ThunderboltOutlined, 
  SignalFilled,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  CloudOutlined,
  EyeOutlined
} from '@ant-design/icons';

const RealTimeDataPanelContent: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [animatedStats, setAnimatedStats] = useState({
    totalDrones: 0,
    activeDrones: 0,
    completedMissions: 0,
    successRate: 0,
  });

  // 实时时间更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 数字动画效果
  useEffect(() => {
    const targetStats = {
      totalDrones: 20,
      activeDrones: 18,
      completedMissions: 156,
      successRate: 98.5,
    };

    const animateValue = (start: number, end: number, duration: number, callback: (value: number) => void) => {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = start + (end - start) * easeOutQuart;
        callback(current);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    };

    // 延迟启动动画
    setTimeout(() => {
      animateValue(0, targetStats.totalDrones, 2000, (value) => {
        setAnimatedStats(prev => ({ ...prev, totalDrones: Math.round(value) }));
      });
      
      setTimeout(() => {
        animateValue(0, targetStats.activeDrones, 1500, (value) => {
          setAnimatedStats(prev => ({ ...prev, activeDrones: Math.round(value) }));
        });
      }, 300);
      
      setTimeout(() => {
        animateValue(0, targetStats.completedMissions, 2500, (value) => {
          setAnimatedStats(prev => ({ ...prev, completedMissions: Math.round(value) }));
        });
      }, 600);
      
      setTimeout(() => {
        animateValue(0, targetStats.successRate, 2000, (value) => {
          setAnimatedStats(prev => ({ ...prev, successRate: Math.round(value * 10) / 10 }));
        });
      }, 900);
    }, 500);
  }, []);

  // 模拟实时数据
  const [realTimeData, setRealTimeData] = useState({
    weather: { condition: '晴朗', temperature: 24, windSpeed: 8 },
    airTraffic: { density: 'medium', conflicts: 0 },
    systemStatus: { cpu: 45, memory: 62, network: 98 }
  });

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'info',
      priority: 'normal',
      message: 'UAV-003 已完成配送任务',
      time: '14:23:15',
      icon: <CheckCircleOutlined />
    },
    {
      id: 2,
      type: 'warning',
      priority: 'high',
      message: '检测到强风区域，建议调整航线',
      time: '14:22:48',
      icon: <WarningOutlined />
    },
    {
      id: 3,
      type: 'success',
      priority: 'normal',
      message: '集群协同算法优化完成',
      time: '14:21:32',
      icon: <ThunderboltOutlined />
    },
    {
      id: 4,
      type: 'info',
      priority: 'normal',
      message: '新的配送任务已分配',
      time: '14:20:15',
      icon: <RocketOutlined />
    }
  ]);

  // 实时数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        weather: {
          ...prev.weather,
          temperature: 20 + Math.random() * 10,
          windSpeed: 5 + Math.random() * 10
        },
        airTraffic: {
          ...prev.airTraffic,
          conflicts: Math.floor(Math.random() * 3)
        },
        systemStatus: {
          cpu: 40 + Math.random() * 20,
          memory: 50 + Math.random() * 30,
          network: 90 + Math.random() * 10
        }
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      {/* 系统时间 */}
      <Card 
        size="small" 
        className="glass-panel"
        style={{ marginBottom: '16px' }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890FF' }}>
            {currentTime.toLocaleTimeString()}
          </div>
          <div style={{ fontSize: '12px', color: '#8C8C8C', marginTop: '4px' }}>
            {currentTime.toLocaleDateString()} | 系统运行正常
          </div>
        </div>
      </Card>

      {/* 核心统计数据 */}
      <Row gutter={[8, 8]} style={{ marginBottom: '16px' }}>
        <Col span={12}>
          <Card size="small" className="glass-panel">
            <Statistic
              title="无人机总数"
              value={animatedStats.totalDrones}
              prefix={<RocketOutlined style={{ color: '#1890FF' }} />}
              valueStyle={{ color: '#1890FF', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" className="glass-panel">
            <Statistic
              title="活跃数量"
              value={animatedStats.activeDrones}
              prefix={<ThunderboltOutlined style={{ color: '#52C41A' }} />}
              valueStyle={{ color: '#52C41A', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" className="glass-panel">
            <Statistic
              title="完成任务"
              value={animatedStats.completedMissions}
              prefix={<CheckCircleOutlined style={{ color: '#722ED1' }} />}
              valueStyle={{ color: '#722ED1', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" className="glass-panel">
            <Statistic
              title="成功率"
              value={animatedStats.successRate}
              suffix="%"
              prefix={<SignalFilled style={{ color: '#FA8C16' }} />}
              valueStyle={{ color: '#FA8C16', fontSize: '20px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 环境监控 */}
      <Card 
        title={
          <span>
            <CloudOutlined style={{ marginRight: '8px', color: '#1890FF' }} />
            环境监控
          </span>
        }
        size="small" 
        className="glass-panel"
        style={{ marginBottom: '16px' }}
      >
        <Row gutter={[16, 8]}>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#FA8C16' }}>
                {realTimeData.weather.temperature.toFixed(1)}°C
              </div>
              <div style={{ fontSize: '10px', color: '#8C8C8C' }}>温度</div>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#13C2C2' }}>
                {realTimeData.weather.windSpeed.toFixed(1)} m/s
              </div>
              <div style={{ fontSize: '10px', color: '#8C8C8C' }}>风速</div>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#52C41A' }}>
                {realTimeData.weather.condition}
              </div>
              <div style={{ fontSize: '10px', color: '#8C8C8C' }}>天气</div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 系统性能 */}
      <Card 
        title={
          <span>
            <EyeOutlined style={{ marginRight: '8px', color: '#1890FF' }} />
            系统性能
          </span>
        }
        size="small" 
        className="glass-panel"
        style={{ marginBottom: '16px' }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px' }}>CPU使用率</span>
              <span style={{ fontSize: '12px', color: '#1890FF' }}>{realTimeData.systemStatus.cpu.toFixed(1)}%</span>
            </div>
            <Progress 
              percent={realTimeData.systemStatus.cpu} 
              size="small" 
              strokeColor="#1890FF"
              showInfo={false}
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px' }}>内存使用率</span>
              <span style={{ fontSize: '12px', color: '#52C41A' }}>{realTimeData.systemStatus.memory.toFixed(1)}%</span>
            </div>
            <Progress 
              percent={realTimeData.systemStatus.memory} 
              size="small" 
              strokeColor="#52C41A"
              showInfo={false}
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px' }}>网络质量</span>
              <span style={{ fontSize: '12px', color: '#722ED1' }}>{realTimeData.systemStatus.network.toFixed(1)}%</span>
            </div>
            <Progress 
              percent={realTimeData.systemStatus.network} 
              size="small" 
              strokeColor="#722ED1"
              showInfo={false}
            />
          </div>
        </Space>
      </Card>

      {/* 实时告警 */}
      <Card 
        title={
          <span>
            <FireOutlined style={{ marginRight: '8px', color: '#FF4D4F' }} />
            实时告警
          </span>
        }
        size="small" 
        className="glass-panel"
      >
        <List
          size="small"
          dataSource={alerts}
          renderItem={(item) => (
            <List.Item style={{ padding: '8px 0', borderBottom: '1px solid #303030' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                  <div style={{ color: item.type === 'warning' ? '#FA8C16' : item.type === 'success' ? '#52C41A' : '#1890FF' }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '11px', 
                      color: 'white',
                      fontWeight: item.priority === 'high' ? 'bold' : 'normal'
                    }}>
                      {item.message}
                    </div>
                    <div style={{ fontSize: '10px', color: '#8C8C8C', marginTop: '2px' }}>
                      <ClockCircleOutlined style={{ marginRight: '4px' }} />
                      {item.time}
                    </div>
                  </div>
                  {item.priority === 'high' && (
                    <div style={{ 
                      background: 'rgba(255, 77, 79, 0.2)', 
                      color: '#FF4D4F',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontSize: '9px',
                      fontWeight: 'bold'
                    }}>
                      紧急
                    </div>
                  )}
                </div>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export const EnhancedRealTimeDataPanel: React.FC = () => {
  return (
    <ClientOnly fallback={
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '200px', 
        color: 'white' 
      }}>
        加载实时数据中...
      </div>
    }>
      <RealTimeDataPanelContent />
    </ClientOnly>
  );
};