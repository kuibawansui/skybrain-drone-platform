'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Button, Space, Input, Select, Slider, Badge, Statistic, Timeline, Alert, Tooltip, Progress } from 'antd';
import { 
  SendOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  AimOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { IntelligentPathPlanning, Waypoint, FlightConstraints, PathPlanningResult } from '../algorithms/IntelligentPathPlanning';

const { Option } = Select;

interface PathPlanningPanelProps {
  onPathGenerated?: (result: PathPlanningResult) => void;
  currentDronePosition?: [number, number, number];
}

export const PathPlanningPanel: React.FC<PathPlanningPanelProps> = ({
  onPathGenerated,
  currentDronePosition = [0, 3, 0]
}) => {
  const [isPlanning, setIsPlanning] = useState(false);
  const [planningResult, setPlanningResult] = useState<PathPlanningResult | null>(null);
  const [startPoint, setStartPoint] = useState<[number, number, number]>(currentDronePosition);
  const [endPoint, setEndPoint] = useState<[number, number, number]>([5, 3, 2]);
  const [intermediatePoints, setIntermediatePoints] = useState<Waypoint[]>([]);
  const [flightMode, setFlightMode] = useState<'normal' | 'eco' | 'fast' | 'safe'>('normal');
  const [maxAltitude, setMaxAltitude] = useState(150);
  const [maxSpeed, setMaxSpeed] = useState(15);
  const [batteryLevel, setBatteryLevel] = useState(85);
  
  const pathPlannerRef = useRef<IntelligentPathPlanning | null>(null);

  // 初始化路径规划器
  useEffect(() => {
    pathPlannerRef.current = new IntelligentPathPlanning({
      minX: -10,
      maxX: 10,
      minY: 0,
      maxY: 8,
      minZ: 0,
      maxZ: 200
    });
  }, []);

  // 飞行模式配置
  const flightModeConfigs = {
    normal: {
      name: '标准模式',
      color: '#1890FF',
      icon: <RocketOutlined />,
      description: '平衡速度、能耗和安全性',
      speedMultiplier: 1.0,
      riskTolerance: 0.3,
      energyEfficiency: 1.0
    },
    eco: {
      name: '节能模式',
      color: '#52C41A',
      icon: <ThunderboltOutlined />,
      description: '最大化电池续航时间',
      speedMultiplier: 0.7,
      riskTolerance: 0.2,
      energyEfficiency: 1.4
    },
    fast: {
      name: '快速模式',
      color: '#FAAD14',
      icon: <SendOutlined />,
      description: '最短时间到达目标',
      speedMultiplier: 1.3,
      riskTolerance: 0.4,
      energyEfficiency: 0.8
    },
    safe: {
      name: '安全模式',
      color: '#722ED1',
      icon: <CheckCircleOutlined />,
      description: '最小化飞行风险',
      speedMultiplier: 0.8,
      riskTolerance: 0.1,
      energyEfficiency: 1.1
    }
  };

  // 生成飞行约束
  const generateFlightConstraints = (): FlightConstraints => {
    const modeConfig = flightModeConfigs[flightMode];
    
    return {
      maxAltitude,
      minAltitude: 10,
      maxSpeed: maxSpeed * modeConfig.speedMultiplier,
      batteryCapacity: batteryLevel,
      payloadWeight: 2.5,
      weatherLimits: {
        maxWindSpeed: 12,
        maxRainfall: 2,
        minVisibility: 1000
      },
      avoidanceZones: [
        {
          center: [2, 2, 50],
          radius: 1.5,
          type: 'no-fly'
        },
        {
          center: [-3, 4, 80],
          radius: 2,
          type: 'restricted'
        },
        {
          center: [1, 6, 30],
          radius: 1,
          type: 'temporary'
        }
      ]
    };
  };

  // 执行路径规划
  const handlePlanPath = async () => {
    if (!pathPlannerRef.current) return;

    setIsPlanning(true);
    
    try {
      const startWaypoint: Waypoint = {
        id: 'start',
        position: startPoint,
        type: 'start',
        timestamp: Date.now()
      };

      const endWaypoint: Waypoint = {
        id: 'end',
        position: endPoint,
        type: 'end',
        timestamp: Date.now()
      };

      const constraints = generateFlightConstraints();
      
      const result = await pathPlannerRef.current.planOptimalPath(
        startWaypoint,
        endWaypoint,
        constraints,
        intermediatePoints
      );

      setPlanningResult(result);
      onPathGenerated?.(result);
      
      console.log('✅ 路径规划完成:', result);
      
    } catch (error) {
      console.error('❌ 路径规划失败:', error);
    } finally {
      setIsPlanning(false);
    }
  };

  // 添加中间点
  const addIntermediatePoint = () => {
    const newPoint: Waypoint = {
      id: `intermediate_${intermediatePoints.length + 1}`,
      position: [
        Math.random() * 8 - 4,
        Math.random() * 5 + 2,
        Math.random() * 100 + 50
      ],
      type: 'checkpoint',
      timestamp: Date.now()
    };
    setIntermediatePoints([...intermediatePoints, newPoint]);
  };

  // 移除中间点
  const removeIntermediatePoint = (index: number) => {
    setIntermediatePoints(intermediatePoints.filter((_, i) => i !== index));
  };

  // 获取路径状态样式
  const getPathStatusStyle = () => {
    if (!planningResult) return { color: '#8C8C8C', text: '未规划' };
    
    if (planningResult.riskScore < 0.3) {
      return { color: '#52C41A', text: '安全路径' };
    } else if (planningResult.riskScore < 0.6) {
      return { color: '#FAAD14', text: '中等风险' };
    } else {
      return { color: '#FF4D4F', text: '高风险路径' };
    }
  };

  const pathStatus = getPathStatusStyle();
  const modeConfig = flightModeConfigs[flightMode];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'auto' }}>
      {/* 路径规划控制面板 */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AimOutlined style={{ color: '#1890FF' }} />
            <span style={{ color: '#1890FF', fontWeight: 'bold', fontSize: '14px' }}>
              智能航线规划
            </span>
          </div>
        }
        className="glass-panel glow-blue"
        size="small"
        bodyStyle={{ padding: '12px' }}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {/* 飞行模式选择 */}
          <div>
            <div style={{ color: 'white', fontSize: '12px', marginBottom: '6px' }}>飞行模式</div>
            <Select
              value={flightMode}
              onChange={setFlightMode}
              style={{ width: '100%' }}
              size="small"
            >
              {Object.entries(flightModeConfigs).map(([key, config]) => (
                <Option key={key} value={key}>
                  <Space size="small">
                    <span style={{ color: config.color }}>{config.icon}</span>
                    <span>{config.name}</span>
                  </Space>
                </Option>
              ))}
            </Select>
            <div style={{ 
              fontSize: '10px', 
              color: '#8C8C8C', 
              marginTop: '4px',
              padding: '4px 8px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '4px'
            }}>
              {modeConfig.description}
            </div>
          </div>

          {/* 起点和终点设置 */}
          <Row gutter={8}>
            <Col span={12}>
              <div style={{ color: 'white', fontSize: '12px', marginBottom: '4px' }}>起点坐标</div>
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  size="small"
                  value={startPoint[0].toFixed(1)}
                  onChange={(e) => setStartPoint([parseFloat(e.target.value) || 0, startPoint[1], startPoint[2]])}
                  placeholder="X"
                />
                <Input
                  size="small"
                  value={startPoint[1].toFixed(1)}
                  onChange={(e) => setStartPoint([startPoint[0], parseFloat(e.target.value) || 0, startPoint[2]])}
                  placeholder="Y"
                />
                <Input
                  size="small"
                  value={startPoint[2].toFixed(0)}
                  onChange={(e) => setStartPoint([startPoint[0], startPoint[1], parseFloat(e.target.value) || 0])}
                  placeholder="Z"
                />
              </Space.Compact>
            </Col>
            <Col span={12}>
              <div style={{ color: 'white', fontSize: '12px', marginBottom: '4px' }}>终点坐标</div>
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  size="small"
                  value={endPoint[0].toFixed(1)}
                  onChange={(e) => setEndPoint([parseFloat(e.target.value) || 0, endPoint[1], endPoint[2]])}
                  placeholder="X"
                />
                <Input
                  size="small"
                  value={endPoint[1].toFixed(1)}
                  onChange={(e) => setEndPoint([endPoint[0], parseFloat(e.target.value) || 0, endPoint[2]])}
                  placeholder="Y"
                />
                <Input
                  size="small"
                  value={endPoint[2].toFixed(0)}
                  onChange={(e) => setEndPoint([endPoint[0], endPoint[1], parseFloat(e.target.value) || 0])}
                  placeholder="Z"
                />
              </Space.Compact>
            </Col>
          </Row>

          {/* 飞行参数 */}
          <Row gutter={8}>
            <Col span={8}>
              <div style={{ color: 'white', fontSize: '12px', marginBottom: '4px' }}>
                最大高度: {maxAltitude}m
              </div>
              <Slider
                min={50}
                max={200}
                value={maxAltitude}
                onChange={setMaxAltitude}
              />
            </Col>
            <Col span={8}>
              <div style={{ color: 'white', fontSize: '12px', marginBottom: '4px' }}>
                最大速度: {maxSpeed}m/s
              </div>
              <Slider
                min={5}
                max={25}
                value={maxSpeed}
                onChange={setMaxSpeed}
              />
            </Col>
            <Col span={8}>
              <div style={{ color: 'white', fontSize: '12px', marginBottom: '4px' }}>
                电池电量: {batteryLevel}%
              </div>
              <Slider
                min={20}
                max={100}
                value={batteryLevel}
                onChange={setBatteryLevel}
              />
            </Col>
          </Row>

          {/* 中间点管理 */}
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '6px'
            }}>
              <span style={{ color: 'white', fontSize: '12px' }}>
                中间点 ({intermediatePoints.length})
              </span>
              <Button 
                size="small" 
                type="dashed" 
                onClick={addIntermediatePoint}
                disabled={intermediatePoints.length >= 3}
              >
                添加
              </Button>
            </div>
            {intermediatePoints.map((point, index) => (
              <div key={point.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                marginBottom: '4px',
                padding: '4px 8px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '4px'
              }}>
                <EnvironmentOutlined style={{ color: '#FAAD14' }} />
                <span style={{ fontSize: '10px', color: 'white', flex: 1 }}>
                  ({point.position[0].toFixed(1)}, {point.position[1].toFixed(1)}, {point.position[2].toFixed(0)})
                </span>
                <Button 
                  size="small" 
                  type="text" 
                  danger 
                  onClick={() => removeIntermediatePoint(index)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>

          {/* 规划按钮 */}
          <Button
            type="primary"
            icon={<AimOutlined />}
            loading={isPlanning}
            onClick={handlePlanPath}
            block
            style={{ 
              background: modeConfig.color,
              borderColor: modeConfig.color,
              height: '36px'
            }}
          >
            {isPlanning ? '规划中...' : '开始规划航线'}
          </Button>
        </Space>
      </Card>

      {/* 规划结果展示 */}
      {planningResult && (
        <Card 
          title="📊 规划结果" 
          className="glass-panel glow-green"
          size="small"
          bodyStyle={{ padding: '12px' }}
        >
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            {/* 路径状态 */}
            <div style={{ 
              textAlign: 'center',
              padding: '12px',
              background: `${pathStatus.color}20`,
              borderRadius: '6px',
              border: `1px solid ${pathStatus.color}`
            }}>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: pathStatus.color,
                marginBottom: '4px'
              }}>
                {pathStatus.text}
              </div>
              <div style={{ fontSize: '10px', color: '#8C8C8C' }}>
                路径质量评分: {Math.round((1 - planningResult.riskScore) * 100)}/100
              </div>
            </div>

            {/* 关键指标 */}
            <Row gutter={8}>
              <Col span={6}>
                <Statistic
                  title="总距离"
                  value={planningResult.totalDistance.toFixed(1)}
                  suffix="m"
                  valueStyle={{ fontSize: '14px', color: '#1890FF' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="预计时间"
                  value={planningResult.estimatedTime.toFixed(1)}
                  suffix="min"
                  valueStyle={{ fontSize: '14px', color: '#52C41A' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="能耗预估"
                  value={planningResult.energyConsumption.toFixed(1)}
                  suffix="%"
                  valueStyle={{ fontSize: '14px', color: '#FAAD14' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="航点数量"
                  value={planningResult.path.length}
                  valueStyle={{ fontSize: '14px', color: '#722ED1' }}
                />
              </Col>
            </Row>

            {/* 优化指标 */}
            <div>
              <div style={{ color: 'white', fontSize: '12px', marginBottom: '6px' }}>优化指标</div>
              <Row gutter={4}>
                {Object.entries(planningResult.optimizationMetrics).map(([key, value]) => (
                  <Col span={6} key={key}>
                    <Badge 
                      status={value ? 'success' : 'default'} 
                      text={
                        <span style={{ fontSize: '10px', color: value ? '#52C41A' : '#8C8C8C' }}>
                          {key === 'distanceOptimized' ? '距离' :
                           key === 'timeOptimized' ? '时间' :
                           key === 'energyOptimized' ? '能耗' : '风险'}
                        </span>
                      }
                    />
                  </Col>
                ))}
              </Row>
            </div>

            {/* 备选路径 */}
            {planningResult.alternativePaths.length > 0 && (
              <div>
                <div style={{ color: 'white', fontSize: '12px', marginBottom: '6px' }}>
                  备选路径 ({planningResult.alternativePaths.length})
                </div>
                <div style={{ 
                  padding: '6px 8px',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '4px',
                  fontSize: '10px',
                  color: '#8C8C8C'
                }}>
                  系统已生成 {planningResult.alternativePaths.length} 条备选路径，可在3D视图中切换查看
                </div>
              </div>
            )}

            {/* 风险警告 */}
            {planningResult.riskScore > 0.6 && (
              <Alert
                message="高风险路径警告"
                description="当前规划路径存在较高风险，建议调整飞行参数或选择备选路径。"
                type="warning"
                showIcon
              />
            )}
          </Space>
        </Card>
      )}

      {/* 快速操作 */}
      <Card 
        title="⚡ 快速操作" 
        className="glass-panel glow-orange"
        size="small"
        bodyStyle={{ padding: '12px' }}
      >
        <Space wrap>
          <Button 
            size="small" 
            icon={<EnvironmentOutlined />}
            onClick={() => {
              setStartPoint(currentDronePosition);
              setEndPoint([Math.random() * 8 - 4, Math.random() * 5 + 2, Math.random() * 100 + 50]);
            }}
          >
            随机目标
          </Button>
          <Button 
            size="small" 
            icon={<ReloadOutlined />}
            onClick={() => {
              setPlanningResult(null);
              setIntermediatePoints([]);
            }}
          >
            重置
          </Button>
          <Button 
            size="small" 
            icon={<SettingOutlined />}
            onClick={() => {
              setMaxAltitude(150);
              setMaxSpeed(15);
              setBatteryLevel(85);
              setFlightMode('normal');
            }}
          >
            默认设置
          </Button>
        </Space>
      </Card>
    </div>
  );
};