'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Button, Select, Slider, Tag, Progress, Statistic, Timeline } from 'antd';
import { 
  AimOutlined, 
  RocketOutlined, 
  WarningOutlined, 
  CheckCircleOutlined,
  SyncOutlined,
  ThunderboltOutlined,
  EnvironmentOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import { PathPlanningEngine, Waypoint, FlightConstraints, NoFlyZone } from '@/algorithms/PathPlanningEngine';

const { Option } = Select;

interface PathVisualization {
  id: string;
  agentId: string;
  waypoints: Waypoint[];
  color: string;
  status: 'planning' | 'optimizing' | 'executing' | 'completed' | 'failed';
  totalDistance: number;
  estimatedTime: number;
  riskLevel: number;
}

interface PlanningMetrics {
  totalPaths: number;
  activePaths: number;
  averageOptimizationTime: number;
  successRate: number;
  conflictResolutions: number;
  energyEfficiency: number;
}

export const PathPlanningVisualization: React.FC = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'rrt_star' | 'multi_objective' | 'cooperative'>('rrt_star');
  const [planningActive, setPlanningActive] = useState(false);
  const [optimizationLevel, setOptimizationLevel] = useState(75);
  const [paths, setPaths] = useState<PathVisualization[]>([]);
  const [noFlyZones, setNoFlyZones] = useState<NoFlyZone[]>([]);
  const [planningMetrics, setPlanningMetrics] = useState<PlanningMetrics>({
    totalPaths: 0,
    activePaths: 0,
    averageOptimizationTime: 0,
    successRate: 0,
    conflictResolutions: 0,
    energyEfficiency: 0
  });
  const [planningEvents, setPlanningEvents] = useState<any[]>([]);
  
  const pathPlanningEngine = useRef<PathPlanningEngine>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    pathPlanningEngine.current = new PathPlanningEngine();
    initializeSimulationData();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (planningActive) {
      startPathPlanning();
    } else {
      stopPathPlanning();
    }
  }, [planningActive]);

  useEffect(() => {
    drawPaths();
  }, [paths, noFlyZones]);

  const initializeSimulationData = () => {
    // 创建禁飞区
    const zones: NoFlyZone[] = [
      {
        id: 'NFZ-001',
        type: 'permanent',
        geometry: {
          type: 'circle',
          coordinates: [[300, 300, 50]],
          radius: 80,
          height: 100
        },
        severity: 'prohibited'
      },
      {
        id: 'NFZ-002',
        type: 'temporary',
        geometry: {
          type: 'circle',
          coordinates: [[600, 200, 30]],
          radius: 60,
          height: 80
        },
        startTime: Date.now(),
        endTime: Date.now() + 3600000,
        severity: 'restricted'
      },
      {
        id: 'NFZ-003',
        type: 'dynamic',
        geometry: {
          type: 'circle',
          coordinates: [[150, 600, 40]],
          radius: 50,
          height: 70
        },
        severity: 'caution'
      }
    ];

    // 创建初始路径
    const initialPaths: PathVisualization[] = Array.from({ length: 6 }, (_, i) => {
      const startX = 50 + Math.random() * 200;
      const startY = 50 + Math.random() * 200;
      const endX = 600 + Math.random() * 200;
      const endY = 600 + Math.random() * 200;
      
      return {
        id: `PATH-${String(i + 1).padStart(3, '0')}`,
        agentId: `UAV-${String(i + 1).padStart(3, '0')}`,
        waypoints: generateRandomPath(startX, startY, endX, endY),
        color: getRandomColor(),
        status: ['planning', 'optimizing', 'executing'][Math.floor(Math.random() * 3)] as any,
        totalDistance: 0,
        estimatedTime: 0,
        riskLevel: Math.random() * 10
      };
    });

    // 计算路径指标
    initialPaths.forEach(path => {
      path.totalDistance = calculatePathDistance(path.waypoints);
      path.estimatedTime = path.totalDistance / 15; // 假设15m/s速度
    });

    setNoFlyZones(zones);
    setPaths(initialPaths);
    updatePlanningMetrics(initialPaths);
  };

  const generateRandomPath = (startX: number, startY: number, endX: number, endY: number): Waypoint[] => {
    const waypoints: Waypoint[] = [];
    const numWaypoints = 5 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i <= numWaypoints; i++) {
      const t = i / numWaypoints;
      const x = startX + (endX - startX) * t + (Math.random() - 0.5) * 100;
      const y = startY + (endY - startY) * t + (Math.random() - 0.5) * 100;
      const z = 50 + Math.random() * 50;
      
      waypoints.push({
        x: Math.max(0, Math.min(1000, x)),
        y: Math.max(0, Math.min(1000, y)),
        z: Math.max(30, Math.min(150, z)),
        timestamp: Date.now() + i * 1000,
        speed: 10 + Math.random() * 10,
        heading: Math.atan2(endY - startY, endX - startX)
      });
    }
    
    return waypoints;
  };

  const calculatePathDistance = (waypoints: Waypoint[]): number => {
    let distance = 0;
    for (let i = 1; i < waypoints.length; i++) {
      const prev = waypoints[i - 1];
      const curr = waypoints[i];
      distance += Math.sqrt(
        Math.pow(curr.x - prev.x, 2) + 
        Math.pow(curr.y - prev.y, 2) + 
        Math.pow(curr.z - prev.z, 2)
      );
    }
    return distance;
  };

  const getRandomColor = (): string => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const startPathPlanning = () => {
    const planningLoop = () => {
      // 模拟路径规划过程
      setPaths(prevPaths => prevPaths.map(path => {
        if (path.status === 'planning' && Math.random() > 0.9) {
          // 完成规划，开始优化
          addPlanningEvent('path_planned', `路径 ${path.id} 规划完成，开始优化`);
          return { ...path, status: 'optimizing' as any };
        } else if (path.status === 'optimizing' && Math.random() > 0.95) {
          // 完成优化，开始执行
          const optimizedPath = optimizePath(path);
          addPlanningEvent('path_optimized', `路径 ${path.id} 优化完成，效率提升 ${Math.floor(Math.random() * 20 + 10)}%`);
          return { ...optimizedPath, status: 'executing' as any };
        } else if (path.status === 'executing' && Math.random() > 0.98) {
          // 执行完成
          addPlanningEvent('path_completed', `路径 ${path.id} 执行完成`);
          return { ...path, status: 'completed' as any };
        }
        return path;
      }));

      // 随机添加新路径
      if (Math.random() > 0.97) {
        addNewPath();
      }

      // 动态调整禁飞区
      if (Math.random() > 0.99) {
        updateNoFlyZones();
      }

      animationRef.current = requestAnimationFrame(planningLoop);
    };

    planningLoop();
  };

  const stopPathPlanning = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const optimizePath = (path: PathVisualization): PathVisualization => {
    // 模拟路径优化
    const optimizedWaypoints = path.waypoints.map(waypoint => ({
      ...waypoint,
      x: waypoint.x + (Math.random() - 0.5) * 20,
      y: waypoint.y + (Math.random() - 0.5) * 20,
      speed: waypoint.speed * (1 + (optimizationLevel / 100) * 0.3)
    }));

    const newDistance = calculatePathDistance(optimizedWaypoints);
    
    return {
      ...path,
      waypoints: optimizedWaypoints,
      totalDistance: newDistance,
      estimatedTime: newDistance / 18, // 优化后速度更快
      riskLevel: Math.max(0, path.riskLevel - Math.random() * 2)
    };
  };

  const addNewPath = () => {
    const newPath: PathVisualization = {
      id: `PATH-${String(Date.now()).slice(-3)}`,
      agentId: `UAV-${String(Date.now()).slice(-3)}`,
      waypoints: generateRandomPath(
        Math.random() * 200,
        Math.random() * 200,
        600 + Math.random() * 200,
        600 + Math.random() * 200
      ),
      color: getRandomColor(),
      status: 'planning',
      totalDistance: 0,
      estimatedTime: 0,
      riskLevel: Math.random() * 10
    };

    newPath.totalDistance = calculatePathDistance(newPath.waypoints);
    newPath.estimatedTime = newPath.totalDistance / 15;

    setPaths(prev => [...prev, newPath]);
    addPlanningEvent('new_path', `新路径 ${newPath.id} 开始规划`);
  };

  const updateNoFlyZones = () => {
    setNoFlyZones(prev => prev.map(zone => {
      if (zone.type === 'dynamic') {
        return {
          ...zone,
          geometry: {
            ...zone.geometry,
            coordinates: [[
              zone.geometry.coordinates[0][0] + (Math.random() - 0.5) * 50,
              zone.geometry.coordinates[0][1] + (Math.random() - 0.5) * 50,
              zone.geometry.coordinates[0][2]
            ]]
          }
        };
      }
      return zone;
    }));
    
    addPlanningEvent('nfz_updated', '动态禁飞区位置已更新');
  };

  const addPlanningEvent = (type: string, message: string) => {
    const colors = {
      path_planned: 'blue',
      path_optimized: 'green',
      path_completed: 'purple',
      new_path: 'cyan',
      nfz_updated: 'orange',
      conflict_resolved: 'red'
    };

    const newEvent = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date().toLocaleTimeString(),
      color: colors[type as keyof typeof colors] || 'default'
    };

    setPlanningEvents(prev => [newEvent, ...prev.slice(0, 9)]);
  };

  const updatePlanningMetrics = (currentPaths: PathVisualization[]) => {
    const activePaths = currentPaths.filter(p => p.status === 'executing').length;
    const completedPaths = currentPaths.filter(p => p.status === 'completed').length;
    
    setPlanningMetrics({
      totalPaths: currentPaths.length,
      activePaths,
      averageOptimizationTime: 2.5 + Math.random() * 2,
      successRate: completedPaths > 0 ? (completedPaths / currentPaths.length) * 100 : 95 + Math.random() * 5,
      conflictResolutions: Math.floor(Math.random() * 10),
      energyEfficiency: 75 + optimizationLevel * 0.2 + Math.random() * 10
    });
  };

  const drawPaths = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制网格
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 20; i++) {
      const x = (i / 20) * canvas.width;
      const y = (i / 20) * canvas.height;
      
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // 绘制禁飞区
    noFlyZones.forEach(zone => {
      const x = (zone.geometry.coordinates[0][0] / 1000) * canvas.width;
      const y = (zone.geometry.coordinates[0][1] / 1000) * canvas.height;
      const radius = ((zone.geometry.radius || 50) / 1000) * canvas.width;

      ctx.fillStyle = zone.severity === 'prohibited' ? 'rgba(239, 68, 68, 0.3)' : 
                      zone.severity === 'restricted' ? 'rgba(245, 158, 11, 0.3)' : 
                      'rgba(156, 163, 175, 0.2)';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();

      ctx.strokeStyle = zone.severity === 'prohibited' ? '#ef4444' : 
                        zone.severity === 'restricted' ? '#f59e0b' : '#9ca3af';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // 绘制路径
    paths.forEach(path => {
      if (path.waypoints.length < 2) return;

      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.status === 'executing' ? 3 : 2;
      ctx.setLineDash(path.status === 'planning' ? [5, 5] : []);

      ctx.beginPath();
      const firstPoint = path.waypoints[0];
      ctx.moveTo(
        (firstPoint.x / 1000) * canvas.width,
        (firstPoint.y / 1000) * canvas.height
      );

      for (let i = 1; i < path.waypoints.length; i++) {
        const point = path.waypoints[i];
        ctx.lineTo(
          (point.x / 1000) * canvas.width,
          (point.y / 1000) * canvas.height
        );
      }
      ctx.stroke();

      // 绘制航点
      path.waypoints.forEach((waypoint, index) => {
        const x = (waypoint.x / 1000) * canvas.width;
        const y = (waypoint.y / 1000) * canvas.height;

        ctx.fillStyle = path.color;
        ctx.beginPath();
        ctx.arc(x, y, index === 0 || index === path.waypoints.length - 1 ? 6 : 3, 0, 2 * Math.PI);
        ctx.fill();
      });
    });

    ctx.setLineDash([]);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      planning: 'blue',
      optimizing: 'orange',
      executing: 'green',
      completed: 'purple',
      failed: 'red'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const executePathPlanning = () => {
    const algorithm = selectedAlgorithm;
    addPlanningEvent('algorithm_started', `启动 ${algorithm.toUpperCase()} 算法进行路径规划`);
    
    // 模拟算法执行
    setTimeout(() => {
      addPlanningEvent('algorithm_completed', `${algorithm.toUpperCase()} 算法执行完成`);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* 控制面板 */}
      <Card 
        title={
          <div className="flex items-center space-x-2">
            <AimOutlined className="text-blue-400" />
            <span className="text-white">智能路径规划系统</span>
          </div>
        }
        className="bg-gray-900 border-gray-700"
        headStyle={{ backgroundColor: '#1f2937', borderBottom: '1px solid #374151' }}
        bodyStyle={{ backgroundColor: '#111827' }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col span={6}>
            <div className="space-y-2">
              <span className="text-gray-300">规划算法:</span>
              <Select
                value={selectedAlgorithm}
                onChange={setSelectedAlgorithm}
                className="w-full"
                dropdownStyle={{ backgroundColor: '#1f2937' }}
              >
                <Option value="rrt_star">RRT* 算法</Option>
                <Option value="multi_objective">多目标优化</Option>
                <Option value="cooperative">协同规划</Option>
              </Select>
            </div>
          </Col>
          <Col span={8}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">优化等级:</span>
                <span className="text-blue-400 font-medium">{optimizationLevel}%</span>
              </div>
              <Slider
                value={optimizationLevel}
                onChange={setOptimizationLevel}
                min={0}
                max={100}
                className="optimization-slider"
              />
            </div>
          </Col>
          <Col span={5}>
            <Button 
              type="primary" 
              icon={<RocketOutlined />}
              onClick={executePathPlanning}
              className="w-full bg-blue-600 hover:bg-blue-700 border-blue-600"
            >
              执行规划
            </Button>
          </Col>
          <Col span={5}>
            <Button 
              type={planningActive ? 'default' : 'primary'}
              icon={<SyncOutlined spin={planningActive} />}
              onClick={() => setPlanningActive(!planningActive)}
              className="w-full"
            >
              {planningActive ? '停止仿真' : '开始仿真'}
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 系统指标 */}
      <Row gutter={[16, 16]}>
        <Col span={4}>
          <Card className="bg-gray-900 border-gray-700" bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={<span className="text-gray-400">总路径数</span>}
              value={planningMetrics.totalPaths}
              prefix={<LineChartOutlined className="text-blue-400" />}
              valueStyle={{ color: '#60a5fa' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className="bg-gray-900 border-gray-700" bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={<span className="text-gray-400">执行中</span>}
              value={planningMetrics.activePaths}
              prefix={<RocketOutlined className="text-green-400" />}
              valueStyle={{ color: '#34d399' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className="bg-gray-900 border-gray-700" bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={<span className="text-gray-400">优化时间</span>}
              value={planningMetrics.averageOptimizationTime}
              precision={1}
              suffix="s"
              prefix={<ThunderboltOutlined className="text-yellow-400" />}
              valueStyle={{ color: '#fbbf24' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className="bg-gray-900 border-gray-700" bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={<span className="text-gray-400">成功率</span>}
              value={planningMetrics.successRate}
              precision={1}
              suffix="%"
              prefix={<CheckCircleOutlined className="text-purple-400" />}
              valueStyle={{ color: '#a78bfa' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className="bg-gray-900 border-gray-700" bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={<span className="text-gray-400">冲突解决</span>}
              value={planningMetrics.conflictResolutions}
              prefix={<WarningOutlined className="text-orange-400" />}
              valueStyle={{ color: '#fb923c' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className="bg-gray-900 border-gray-700" bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={<span className="text-gray-400">能效比</span>}
              value={planningMetrics.energyEfficiency}
              precision={1}
              suffix="%"
              prefix={<EnvironmentOutlined className="text-green-400" />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 路径可视化 */}
        <Col span={16}>
          <Card 
            title={
              <div className="flex items-center space-x-2">
                <EnvironmentOutlined className="text-green-400" />
                <span className="text-white">路径规划可视化</span>
                <Tag color="green" className="ml-2">实时更新</Tag>
              </div>
            }
            className="bg-gray-900 border-gray-700"
            headStyle={{ backgroundColor: '#1f2937', borderBottom: '1px solid #374151' }}
            bodyStyle={{ backgroundColor: '#111827', padding: '16px' }}
          >
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              className="w-full border border-gray-600 rounded"
              style={{ backgroundColor: '#0f172a' }}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <Tag color="red">禁飞区 (禁止)</Tag>
              <Tag color="orange">禁飞区 (限制)</Tag>
              <Tag color="gray">禁飞区 (注意)</Tag>
              <Tag color="blue">规划中</Tag>
              <Tag color="green">执行中</Tag>
              <Tag color="purple">已完成</Tag>
            </div>
          </Card>
        </Col>

        {/* 实时事件和路径状态 */}
        <Col span={8}>
          <div className="space-y-4">
            {/* 实时事件 */}
            <Card 
              title={
                <div className="flex items-center space-x-2">
                  <SyncOutlined className="text-green-400" spin={planningActive} />
                  <span className="text-white">规划事件</span>
                </div>
              }
              className="bg-gray-900 border-gray-700"
              headStyle={{ backgroundColor: '#1f2937', borderBottom: '1px solid #374151' }}
              bodyStyle={{ backgroundColor: '#111827', maxHeight: '200px', overflowY: 'auto' }}
            >
              <Timeline
                items={planningEvents.map(event => ({
                  color: event.color,
                  children: (
                    <div className="space-y-1">
                      <div className="text-gray-300 text-sm">{event.message}</div>
                      <div className="text-gray-500 text-xs">{event.timestamp}</div>
                    </div>
                  )
                }))}
              />
            </Card>

            {/* 路径状态统计 */}
            <Card 
              title={
                <div className="flex items-center space-x-2">
                  <LineChartOutlined className="text-blue-400" />
                  <span className="text-white">路径状态</span>
                </div>
              }
              className="bg-gray-900 border-gray-700"
              headStyle={{ backgroundColor: '#1f2937', borderBottom: '1px solid #374151' }}
              bodyStyle={{ backgroundColor: '#111827' }}
            >
              <div className="space-y-3">
                {['planning', 'optimizing', 'executing', 'completed'].map(status => {
                  const count = paths.filter(p => p.status === status).length;
                  const percentage = paths.length > 0 ? (count / paths.length) * 100 : 0;
                  
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Tag color={getStatusColor(status)} className="min-w-[80px]">
                          {status.toUpperCase()}
                        </Tag>
                        <span className="text-gray-300 text-sm">{count}</span>
                      </div>
                      <Progress 
                        percent={percentage} 
                        size="small" 
                        showInfo={false}
                        strokeColor={getStatusColor(status)}
                        className="flex-1 ml-4"
                      />
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </Col>
      </Row>

      <style jsx global>{`
        .optimization-slider .ant-slider-rail {
          background: #374151;
        }
        .optimization-slider .ant-slider-track {
          background: linear-gradient(90deg, #10b981, #3b82f6);
        }
        .optimization-slider .ant-slider-handle {
          border-color: #10b981;
        }
      `}</style>
    </div>
  );
};