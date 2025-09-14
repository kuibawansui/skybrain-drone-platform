'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Statistic, Button, Table, Tag, Progress, Timeline, Switch, Slider } from 'antd';
import { 
  RobotOutlined, 
  ThunderboltOutlined, 
  WarningOutlined, 
  CheckCircleOutlined,
  SyncOutlined,
  FireOutlined,
  TeamOutlined,
  ControlOutlined
} from '@ant-design/icons';
import { MultiAgentDecisionEngine, DroneAgent, CollaborativeTask } from '@/algorithms/MultiAgentSystem';
import { PathPlanningEngine, FlightConstraints } from '@/algorithms/PathPlanningEngine';

interface AgentStatus {
  id: string;
  status: 'idle' | 'flying' | 'delivering' | 'returning' | 'emergency';
  position: { x: number; y: number; z: number };
  batteryLevel: number;
  currentTask?: string;
  efficiency: number;
  riskLevel: number;
}

interface SystemMetrics {
  totalAgents: number;
  activeAgents: number;
  completedTasks: number;
  averageEfficiency: number;
  conflictResolutions: number;
  systemLoad: number;
}

export const MultiAgentControlPanel: React.FC = () => {
  const [isSystemActive, setIsSystemActive] = useState(false);
  const [cooperationLevel, setCooperationLevel] = useState(80);
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [tasks, setTasks] = useState<CollaborativeTask[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    totalAgents: 0,
    activeAgents: 0,
    completedTasks: 0,
    averageEfficiency: 0,
    conflictResolutions: 0,
    systemLoad: 0
  });
  const [realtimeEvents, setRealtimeEvents] = useState<any[]>([]);
  
  const multiAgentEngine = useRef<MultiAgentDecisionEngine>();
  const pathPlanningEngine = useRef<PathPlanningEngine>();
  const animationRef = useRef<number>();

  useEffect(() => {
    // 初始化多智能体系统
    multiAgentEngine.current = new MultiAgentDecisionEngine();
    pathPlanningEngine.current = new PathPlanningEngine();
    
    // 初始化模拟数据
    initializeSimulationData();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isSystemActive) {
      startSimulation();
    } else {
      stopSimulation();
    }
  }, [isSystemActive]);

  const initializeSimulationData = () => {
    // 创建模拟无人机智能体
    const simulatedAgents: AgentStatus[] = Array.from({ length: 12 }, (_, i) => ({
      id: `UAV-${String(i + 1).padStart(3, '0')}`,
      status: Math.random() > 0.7 ? 'idle' : ['flying', 'delivering', 'returning'][Math.floor(Math.random() * 3)] as any,
      position: {
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        z: 50 + Math.random() * 100
      },
      batteryLevel: 20 + Math.random() * 80,
      efficiency: 60 + Math.random() * 40,
      riskLevel: Math.random() * 10,
      currentTask: Math.random() > 0.6 ? `TASK-${Math.floor(Math.random() * 100)}` : undefined
    }));

    // 创建协同任务
    const simulatedTasks: CollaborativeTask[] = Array.from({ length: 8 }, (_, i) => ({
      id: `TASK-${String(i + 1).padStart(3, '0')}`,
      type: ['delivery', 'surveillance', 'emergency', 'maintenance'][Math.floor(Math.random() * 4)] as any,
      priority: Math.floor(Math.random() * 10) + 1,
      requiredAgents: Math.floor(Math.random() * 3) + 1,
      assignedAgents: [],
      deadline: Date.now() + Math.random() * 3600000,
      location: {
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        z: Math.random() * 100
      },
      payload: Math.random() * 10,
      status: ['pending', 'assigned', 'executing'][Math.floor(Math.random() * 3)] as any
    }));

    setAgents(simulatedAgents);
    setTasks(simulatedTasks);
    
    // 注册智能体到多智能体系统
    simulatedAgents.forEach(agent => {
      const droneAgent: DroneAgent = {
        id: agent.id,
        position: agent.position,
        velocity: { x: 0, y: 0, z: 0 },
        destination: { x: agent.position.x + 100, y: agent.position.y + 100, z: agent.position.z },
        batteryLevel: agent.batteryLevel,
        payload: 5,
        priority: Math.floor(Math.random() * 10),
        status: agent.status,
        capabilities: ['delivery', 'surveillance'],
        communicationRange: 200,
        lastUpdate: Date.now()
      };
      multiAgentEngine.current?.registerAgent(droneAgent);
    });

    updateSystemMetrics();
  };

  const startSimulation = () => {
    const simulate = () => {
      // 更新智能体状态
      setAgents(prevAgents => prevAgents.map(agent => ({
        ...agent,
        position: {
          x: agent.position.x + (Math.random() - 0.5) * 10,
          y: agent.position.y + (Math.random() - 0.5) * 10,
          z: Math.max(30, Math.min(150, agent.position.z + (Math.random() - 0.5) * 5))
        },
        batteryLevel: Math.max(0, agent.batteryLevel - Math.random() * 0.5),
        efficiency: Math.max(0, Math.min(100, agent.efficiency + (Math.random() - 0.5) * 5)),
        riskLevel: Math.max(0, Math.min(10, agent.riskLevel + (Math.random() - 0.5) * 2))
      })));

      // 执行多智能体决策
      multiAgentEngine.current?.detectAndResolveConflicts();
      multiAgentEngine.current?.assignTasks();

      // 添加实时事件
      if (Math.random() > 0.95) {
        addRealtimeEvent();
      }

      updateSystemMetrics();
      
      animationRef.current = requestAnimationFrame(simulate);
    };

    simulate();
  };

  const stopSimulation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const addRealtimeEvent = () => {
    const eventTypes = [
      { type: 'conflict_resolved', message: '检测到路径冲突，已自动重新规划', color: 'orange' },
      { type: 'task_assigned', message: '新任务已分配给最优智能体组合', color: 'blue' },
      { type: 'emergency_response', message: '紧急任务触发，优先级调度启动', color: 'red' },
      { type: 'optimization', message: '路径优化完成，效率提升15%', color: 'green' },
      { type: 'collaboration', message: '多智能体协同编队飞行中', color: 'purple' }
    ];

    const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const newEvent = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      ...event
    };

    setRealtimeEvents(prev => [newEvent, ...prev.slice(0, 9)]);
  };

  const updateSystemMetrics = () => {
    setSystemMetrics(prev => ({
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.status !== 'idle').length,
      completedTasks: prev.completedTasks + (Math.random() > 0.98 ? 1 : 0),
      averageEfficiency: agents.reduce((sum, a) => sum + a.efficiency, 0) / agents.length || 0,
      conflictResolutions: prev.conflictResolutions + (Math.random() > 0.97 ? 1 : 0),
      systemLoad: (agents.filter(a => a.status !== 'idle').length / agents.length) * 100 || 0
    }));
  };

  const getStatusColor = (status: string) => {
    const colors = {
      idle: 'default',
      flying: 'blue',
      delivering: 'green',
      returning: 'orange',
      emergency: 'red'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getTaskTypeColor = (type: string) => {
    const colors = {
      delivery: 'blue',
      surveillance: 'green',
      emergency: 'red',
      maintenance: 'orange'
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  const agentColumns = [
    {
      title: '智能体ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (text: string) => (
        <span className="font-mono text-blue-400">{text}</span>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)} className="font-medium">
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: '位置',
      key: 'position',
      width: 150,
      render: (record: AgentStatus) => (
        <span className="font-mono text-xs text-gray-400">
          ({record.position.x.toFixed(0)}, {record.position.y.toFixed(0)}, {record.position.z.toFixed(0)})
        </span>
      )
    },
    {
      title: '电量',
      dataIndex: 'batteryLevel',
      key: 'battery',
      width: 120,
      render: (battery: number) => (
        <Progress 
          percent={battery} 
          size="small" 
          strokeColor={battery > 50 ? '#52c41a' : battery > 20 ? '#faad14' : '#ff4d4f'}
          showInfo={false}
        />
      )
    },
    {
      title: '效率',
      dataIndex: 'efficiency',
      key: 'efficiency',
      width: 80,
      render: (efficiency: number) => (
        <span className={`font-medium ${efficiency > 80 ? 'text-green-400' : efficiency > 60 ? 'text-yellow-400' : 'text-red-400'}`}>
          {efficiency.toFixed(0)}%
        </span>
      )
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      key: 'risk',
      width: 100,
      render: (risk: number) => (
        <Tag color={risk < 3 ? 'green' : risk < 7 ? 'orange' : 'red'}>
          {risk.toFixed(1)}
        </Tag>
      )
    }
  ];

  const taskColumns = [
    {
      title: '任务ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (text: string) => (
        <span className="font-mono text-purple-400">{text}</span>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color={getTaskTypeColor(type)} className="font-medium">
          {type.toUpperCase()}
        </Tag>
      )
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: number) => (
        <span className={`font-bold ${priority > 7 ? 'text-red-400' : priority > 4 ? 'text-yellow-400' : 'text-green-400'}`}>
          {priority}
        </span>
      )
    },
    {
      title: '需要智能体',
      dataIndex: 'requiredAgents',
      key: 'required',
      width: 100,
      render: (required: number) => (
        <span className="text-blue-400 font-medium">{required}</span>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'executing' ? 'green' : status === 'assigned' ? 'blue' : 'default'}>
          {status.toUpperCase()}
        </Tag>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* 系统控制区 */}
      <Card 
        title={
          <div className="flex items-center space-x-2">
            <ControlOutlined className="text-blue-400" />
            <span className="text-white">多智能体协同控制系统</span>
          </div>
        }
        className="bg-gray-900 border-gray-700"
        headStyle={{ backgroundColor: '#1f2937', borderBottom: '1px solid #374151' }}
        bodyStyle={{ backgroundColor: '#111827' }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col span={6}>
            <div className="flex items-center space-x-3">
              <span className="text-gray-300">系统状态:</span>
              <Switch 
                checked={isSystemActive}
                onChange={setIsSystemActive}
                checkedChildren="运行中"
                unCheckedChildren="已停止"
                className="bg-gray-600"
              />
            </div>
          </Col>
          <Col span={12}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">协同等级:</span>
                <span className="text-blue-400 font-medium">{cooperationLevel}%</span>
              </div>
              <Slider
                value={cooperationLevel}
                onChange={setCooperationLevel}
                min={0}
                max={100}
                className="cooperation-slider"
              />
            </div>
          </Col>
          <Col span={6}>
            <Button 
              type="primary" 
              icon={<SyncOutlined />}
              onClick={() => multiAgentEngine.current?.detectAndResolveConflicts()}
              className="w-full bg-blue-600 hover:bg-blue-700 border-blue-600"
            >
              手动冲突解决
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 系统指标 */}
      <Row gutter={[16, 16]}>
        <Col span={4}>
          <Card className="bg-gray-900 border-gray-700" bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={<span className="text-gray-400">总智能体数</span>}
              value={systemMetrics.totalAgents}
              prefix={<TeamOutlined className="text-blue-400" />}
              valueStyle={{ color: '#60a5fa' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className="bg-gray-900 border-gray-700" bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={<span className="text-gray-400">活跃智能体</span>}
              value={systemMetrics.activeAgents}
              prefix={<RobotOutlined className="text-green-400" />}
              valueStyle={{ color: '#34d399' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className="bg-gray-900 border-gray-700" bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={<span className="text-gray-400">完成任务</span>}
              value={systemMetrics.completedTasks}
              prefix={<CheckCircleOutlined className="text-purple-400" />}
              valueStyle={{ color: '#a78bfa' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className="bg-gray-900 border-gray-700" bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={<span className="text-gray-400">平均效率</span>}
              value={systemMetrics.averageEfficiency}
              precision={1}
              suffix="%"
              prefix={<ThunderboltOutlined className="text-yellow-400" />}
              valueStyle={{ color: '#fbbf24' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className="bg-gray-900 border-gray-700" bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={<span className="text-gray-400">冲突解决</span>}
              value={systemMetrics.conflictResolutions}
              prefix={<WarningOutlined className="text-orange-400" />}
              valueStyle={{ color: '#fb923c' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className="bg-gray-900 border-gray-700" bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={<span className="text-gray-400">系统负载</span>}
              value={systemMetrics.systemLoad}
              precision={1}
              suffix="%"
              prefix={<FireOutlined className="text-red-400" />}
              valueStyle={{ color: '#f87171' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 智能体状态表 */}
        <Col span={16}>
          <Card 
            title={
              <div className="flex items-center space-x-2">
                <RobotOutlined className="text-blue-400" />
                <span className="text-white">智能体实时状态</span>
                <Tag color="blue" className="ml-2">{agents.length} 个智能体</Tag>
              </div>
            }
            className="bg-gray-900 border-gray-700"
            headStyle={{ backgroundColor: '#1f2937', borderBottom: '1px solid #374151' }}
            bodyStyle={{ backgroundColor: '#111827', padding: '0' }}
          >
            <Table
              columns={agentColumns}
              dataSource={agents}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 8, showSizeChanger: false }}
              className="dark-table"
              scroll={{ y: 300 }}
            />
          </Card>
        </Col>

        {/* 实时事件流 */}
        <Col span={8}>
          <Card 
            title={
              <div className="flex items-center space-x-2">
                <SyncOutlined className="text-green-400" spin={isSystemActive} />
                <span className="text-white">实时事件流</span>
              </div>
            }
            className="bg-gray-900 border-gray-700"
            headStyle={{ backgroundColor: '#1f2937', borderBottom: '1px solid #374151' }}
            bodyStyle={{ backgroundColor: '#111827', maxHeight: '350px', overflowY: 'auto' }}
          >
            <Timeline
              items={realtimeEvents.map(event => ({
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
        </Col>
      </Row>

      {/* 协同任务管理 */}
      <Card 
        title={
          <div className="flex items-center space-x-2">
            <TeamOutlined className="text-purple-400" />
            <span className="text-white">协同任务管理</span>
            <Tag color="purple" className="ml-2">{tasks.length} 个任务</Tag>
          </div>
        }
        className="bg-gray-900 border-gray-700"
        headStyle={{ backgroundColor: '#1f2937', borderBottom: '1px solid #374151' }}
        bodyStyle={{ backgroundColor: '#111827', padding: '0' }}
      >
        <Table
          columns={taskColumns}
          dataSource={tasks}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 6, showSizeChanger: false }}
          className="dark-table"
        />
      </Card>

      <style jsx global>{`
        .dark-table .ant-table {
          background: transparent;
        }
        .dark-table .ant-table-thead > tr > th {
          background: #1f2937;
          border-bottom: 1px solid #374151;
          color: #d1d5db;
        }
        .dark-table .ant-table-tbody > tr > td {
          background: transparent;
          border-bottom: 1px solid #374151;
          color: #e5e7eb;
        }
        .dark-table .ant-table-tbody > tr:hover > td {
          background: #1f2937;
        }
        .cooperation-slider .ant-slider-rail {
          background: #374151;
        }
        .cooperation-slider .ant-slider-track {
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
        }
        .cooperation-slider .ant-slider-handle {
          border-color: #3b82f6;
        }
      `}</style>
    </div>
  );
};