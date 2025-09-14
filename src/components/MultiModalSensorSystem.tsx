'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Progress, Badge, Timeline, Statistic, Alert } from 'antd';
import { 
  CloudOutlined, 
  EyeOutlined, 
  RadarChartOutlined, 
  SoundOutlined,
  WifiOutlined,
  ThunderboltOutlined,
  WarningOutlined
} from '@ant-design/icons';

interface SensorData {
  id: string;
  name: string;
  type: 'weather' | 'visual' | 'radar' | 'acoustic' | 'communication' | 'environmental';
  status: 'online' | 'offline' | 'warning';
  accuracy: number;
  lastUpdate: string;
  data: any;
}

interface MultiModalData {
  weather: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    visibility: number;
    precipitation: number;
  };
  visual: {
    objectDetection: number;
    obstacleCount: number;
    lightCondition: string;
    visibility: number;
  };
  radar: {
    aircraftCount: number;
    conflictZones: number;
    coverage: number;
    resolution: number;
  };
  acoustic: {
    noiseLevel: number;
    aircraftSounds: number;
    emergencySignals: number;
  };
  communication: {
    signalStrength: number;
    latency: number;
    packetLoss: number;
    bandwidth: number;
  };
  environmental: {
    airQuality: number;
    crowdDensity: number;
    trafficDensity: number;
    emergencyEvents: number;
  };
}

export const MultiModalSensorSystem: React.FC = () => {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [fusedData, setFusedData] = useState<MultiModalData | null>(null);
  const [systemHealth, setSystemHealth] = useState(95);
  const [alerts, setAlerts] = useState<string[]>([]);

  // 模拟传感器数据
  useEffect(() => {
    const generateSensorData = (): SensorData[] => {
      return [
        {
          id: 'weather-001',
          name: '气象雷达站',
          type: 'weather',
          status: Math.random() > 0.1 ? 'online' : 'warning',
          accuracy: 85 + Math.random() * 10,
          lastUpdate: new Date().toLocaleTimeString(),
          data: {
            temperature: 22 + Math.random() * 8,
            humidity: 45 + Math.random() * 30,
            windSpeed: Math.random() * 15,
            windDirection: Math.random() * 360,
            visibility: 8 + Math.random() * 7,
            precipitation: Math.random() * 5
          }
        },
        {
          id: 'visual-001',
          name: '视觉传感器网络',
          type: 'visual',
          status: Math.random() > 0.05 ? 'online' : 'offline',
          accuracy: 90 + Math.random() * 8,
          lastUpdate: new Date().toLocaleTimeString(),
          data: {
            objectDetection: 88 + Math.random() * 10,
            obstacleCount: Math.floor(Math.random() * 15),
            lightCondition: Math.random() > 0.3 ? '良好' : '较差',
            visibility: 85 + Math.random() * 10
          }
        },
        {
          id: 'radar-001',
          name: '空域监控雷达',
          type: 'radar',
          status: 'online',
          accuracy: 95 + Math.random() * 4,
          lastUpdate: new Date().toLocaleTimeString(),
          data: {
            aircraftCount: Math.floor(Math.random() * 25),
            conflictZones: Math.floor(Math.random() * 3),
            coverage: 92 + Math.random() * 6,
            resolution: 0.5 + Math.random() * 0.3
          }
        },
        {
          id: 'acoustic-001',
          name: '声学监测系统',
          type: 'acoustic',
          status: Math.random() > 0.15 ? 'online' : 'warning',
          accuracy: 75 + Math.random() * 15,
          lastUpdate: new Date().toLocaleTimeString(),
          data: {
            noiseLevel: 45 + Math.random() * 30,
            aircraftSounds: Math.floor(Math.random() * 8),
            emergencySignals: Math.floor(Math.random() * 2)
          }
        },
        {
          id: 'comm-001',
          name: '通信监控系统',
          type: 'communication',
          status: 'online',
          accuracy: 98 + Math.random() * 2,
          lastUpdate: new Date().toLocaleTimeString(),
          data: {
            signalStrength: -45 - Math.random() * 20,
            latency: 10 + Math.random() * 15,
            packetLoss: Math.random() * 2,
            bandwidth: 80 + Math.random() * 15
          }
        },
        {
          id: 'env-001',
          name: '环境感知系统',
          type: 'environmental',
          status: Math.random() > 0.1 ? 'online' : 'warning',
          accuracy: 80 + Math.random() * 15,
          lastUpdate: new Date().toLocaleTimeString(),
          data: {
            airQuality: 60 + Math.random() * 35,
            crowdDensity: Math.random() * 100,
            trafficDensity: Math.random() * 100,
            emergencyEvents: Math.floor(Math.random() * 3)
          }
        }
      ];
    };

    const updateData = () => {
      const sensors = generateSensorData();
      setSensorData(sensors);

      // 数据融合
      const weather = sensors.find(s => s.type === 'weather')?.data;
      const visual = sensors.find(s => s.type === 'visual')?.data;
      const radar = sensors.find(s => s.type === 'radar')?.data;
      const acoustic = sensors.find(s => s.type === 'acoustic')?.data;
      const communication = sensors.find(s => s.type === 'communication')?.data;
      const environmental = sensors.find(s => s.type === 'environmental')?.data;

      if (weather && visual && radar && acoustic && communication && environmental) {
        setFusedData({
          weather,
          visual,
          radar,
          acoustic,
          communication,
          environmental
        });
      }

      // 系统健康度计算
      const onlineSensors = sensors.filter(s => s.status === 'online').length;
      const health = (onlineSensors / sensors.length) * 100;
      setSystemHealth(health);

      // 生成告警
      const newAlerts: string[] = [];
      sensors.forEach(sensor => {
        if (sensor.status === 'offline') {
          newAlerts.push(`${sensor.name} 离线`);
        } else if (sensor.status === 'warning') {
          newAlerts.push(`${sensor.name} 异常`);
        }
      });
      setAlerts(newAlerts);
    };

    updateData();
    const interval = setInterval(updateData, 3000);
    return () => clearInterval(interval);
  }, []);

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'weather': return <CloudOutlined />;
      case 'visual': return <EyeOutlined />;
      case 'radar': return <RadarChartOutlined />;
      case 'acoustic': return <SoundOutlined />;
      case 'communication': return <WifiOutlined />;
      case 'environmental': return <ThunderboltOutlined />;
      default: return <ThunderboltOutlined />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'success';
      case 'warning': return 'warning';
      case 'offline': return 'error';
      default: return 'default';
    }
  };

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      {/* 系统概览 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col span={8}>
          <Card size="small" className="glass-panel">
            <Statistic
              title="系统健康度"
              value={systemHealth}
              precision={1}
              suffix="%"
              valueStyle={{ color: systemHealth > 90 ? '#3f8600' : systemHealth > 70 ? '#cf1322' : '#d4380d' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" className="glass-panel">
            <Statistic
              title="在线传感器"
              value={sensorData.filter(s => s.status === 'online').length}
              suffix={`/ ${sensorData.length}`}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" className="glass-panel">
            <Statistic
              title="数据融合率"
              value={fusedData ? 98.5 : 0}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 告警信息 */}
      {alerts.length > 0 && (
        <Alert
          message="系统告警"
          description={
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {alerts.map((alert, index) => (
                <li key={index}>{alert}</li>
              ))}
            </ul>
          }
          type="warning"
          icon={<WarningOutlined />}
          style={{ marginBottom: '16px' }}
        />
      )}

      {/* 传感器状态 */}
      <Row gutter={[16, 16]}>
        {sensorData.map((sensor) => (
          <Col span={12} key={sensor.id}>
            <Card
              size="small"
              className="glass-panel"
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getSensorIcon(sensor.type)}
                  <span>{sensor.name}</span>
                  <Badge status={getStatusColor(sensor.status) as any} />
                </div>
              }
            >
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>精度:</span>
                  <span>{sensor.accuracy.toFixed(1)}%</span>
                </div>
                <Progress 
                  percent={sensor.accuracy} 
                  size="small" 
                  strokeColor={sensor.accuracy > 90 ? '#52c41a' : sensor.accuracy > 70 ? '#faad14' : '#ff4d4f'}
                />
              </div>
              <div style={{ fontSize: '12px', color: '#8C8C8C' }}>
                最后更新: {sensor.lastUpdate}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 融合数据展示 */}
      {fusedData && (
        <Card
          title="🔗 多模态数据融合结果"
          className="glass-panel"
          style={{ marginTop: '16px' }}
        >
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Card size="small" title="气象数据">
                <div style={{ fontSize: '12px' }}>
                  <div>温度: {fusedData.weather.temperature.toFixed(1)}°C</div>
                  <div>湿度: {fusedData.weather.humidity.toFixed(1)}%</div>
                  <div>风速: {fusedData.weather.windSpeed.toFixed(1)} m/s</div>
                  <div>能见度: {fusedData.weather.visibility.toFixed(1)} km</div>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="视觉感知">
                <div style={{ fontSize: '12px' }}>
                  <div>目标检测: {fusedData.visual.objectDetection.toFixed(1)}%</div>
                  <div>障碍物: {fusedData.visual.obstacleCount} 个</div>
                  <div>光照条件: {fusedData.visual.lightCondition}</div>
                  <div>视觉清晰度: {fusedData.visual.visibility.toFixed(1)}%</div>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="雷达监控">
                <div style={{ fontSize: '12px' }}>
                  <div>飞行器: {fusedData.radar.aircraftCount} 架</div>
                  <div>冲突区域: {fusedData.radar.conflictZones} 个</div>
                  <div>覆盖率: {fusedData.radar.coverage.toFixed(1)}%</div>
                  <div>分辨率: {fusedData.radar.resolution.toFixed(2)} m</div>
                </div>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 数据融合时间线 */}
      <Card
        title="📊 数据融合处理流程"
        className="glass-panel"
        style={{ marginTop: '16px' }}
      >
        <Timeline
          items={[
            {
              color: 'green',
              children: '多源数据采集 - 6个传感器系统实时数据获取'
            },
            {
              color: 'blue',
              children: '数据预处理 - 噪声滤除、格式标准化、时间同步'
            },
            {
              color: 'orange',
              children: '特征提取 - 关键信息提取、维度降维、相关性分析'
            },
            {
              color: 'purple',
              children: '数据融合 - 卡尔曼滤波、贝叶斯推理、权重分配'
            },
            {
              color: 'red',
              children: '结果输出 - 统一态势图、风险评估、决策支持'
            }
          ]}
        />
      </Card>
    </div>
  );
};