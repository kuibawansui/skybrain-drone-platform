'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Progress, Tag, Timeline, Statistic, Alert, Space, Select, Input } from 'antd';
import { 
  RocketOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  WarningOutlined,
  ThunderboltOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  ControlOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';

interface DroneTask {
  id: string;
  droneId: string;
  type: 'delivery' | 'patrol' | 'emergency' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'assigned' | 'executing' | 'completed' | 'failed';
  startLocation: { lat: number; lng: number; name: string };
  endLocation: { lat: number; lng: number; name: string };
  estimatedDuration: number; // 分钟
  actualDuration?: number;
  assignedTime?: string;
  completedTime?: string;
  payload?: string;
  distance: number; // 公里
}

interface DroneInfo {
  id: string;
  name: string;
  status: 'idle' | 'busy' | 'maintenance' | 'offline';
  batteryLevel: number;
  currentLocation: { lat: number; lng: number; name: string };
  currentTask?: string;
  totalFlightTime: number; // 小时
  completedTasks: number;
  efficiency: number; // 百分比
  lastMaintenance: string;
}

interface FleetMetrics {
  totalDrones: number;
  activeDrones: number;
  tasksInQueue: number;
  completedToday: number;
  averageEfficiency: number;
  totalFlightHours: number;
}

export const DroneFleetScheduler: React.FC = () => {
  const [drones, setDrones] = useState<DroneInfo[]>([]);
  const [tasks, setTasks] = useState<DroneTask[]>([]);
  const [fleetMetrics, setFleetMetrics] = useState<FleetMetrics>({
    totalDrones: 0,
    activeDrones: 0,
    tasksInQueue: 0,
    completedToday: 0,
    averageEfficiency: 0,
    totalFlightHours: 0
  });
  const [schedulingMode, setSchedulingMode] = useState<'auto' | 'manual'>('auto');
  const [selectedDrone, setSelectedDrone] = useState<string | null>(null);

  // 初始化模拟数据
  useEffect(() => {
    const initializeDrones = (): DroneInfo[] => {
      return Array.from({ length: 20 }, (_, i) => ({
        id: `UAV-${String(i + 1).padStart(3, '0')}`,
        name: `无人机-${i + 1}`,
        status: Math.random() > 0.8 ? 'maintenance' : Math.random() > 0.2 ? 'busy' : 'idle',
        batteryLevel: 20 + Math.random() * 80,
        currentLocation: {
          lat: 39.9042 + (Math.random() - 0.5) * 0.1,
          lng: 116.4074 + (Math.random() - 0.5) * 0.1,
          name: `位置点-${i + 1}`
        },
        currentTask: Math.random() > 0.7 ? `TASK-${Math.floor(Math.random() * 100)}` : undefined,
        totalFlightTime: Math.random() * 500,
        completedTasks: Math.floor(Math.random() * 200),
        efficiency: 70 + Math.random() * 25,
        lastMaintenance: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
      }));
    };

    const initializeTasks = (): DroneTask[] => {
      const taskTypes: DroneTask['type'][] = ['delivery', 'patrol', 'emergency', 'maintenance'];
      const priorities: DroneTask['priority'][] = ['low', 'medium', 'high', 'critical'];
      const statuses: DroneTask['status'][] = ['pending', 'assigned', 'executing', 'completed'];
      
      return Array.from({ length: 50 }, (_, i) => ({
        id: `TASK-${String(i + 1).padStart(3, '0')}`,
        droneId: Math.random() > 0.3 ? `UAV-${String(Math.floor(Math.random() * 20) + 1).padStart(3, '0')}` : '',
        type: taskTypes[Math.floor(Math.random() * taskTypes.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        startLocation: {
          lat: 39.9042 + (Math.random() - 0.5) * 0.2,
          lng: 116.4074 + (Math.random() - 0.5) * 0.2,
          name: `起点-${i + 1}`
        },
        endLocation: {
          lat: 39.9042 + (Math.random() - 0.5) * 0.2,
          lng: 116.4074 + (Math.random() - 0.5) * 0.2,
          name: `终点-${i + 1}`
        },
        estimatedDuration: 15 + Math.random() * 120,
        distance: 1 + Math.random() * 20,
        payload: Math.random() > 0.5 ? `包裹-${i + 1}` : undefined,
        assignedTime: Math.random() > 0.5 ? new Date().toLocaleTimeString() : undefined,
        completedTime: Math.random() > 0.7 ? new Date().toLocaleTimeString() : undefined
      }));
    };

    const dronesData = initializeDrones();
    const tasksData = initializeTasks();
    
    setDrones(dronesData);
    setTasks(tasksData);

    // 计算集群指标
    const activeDrones = dronesData.filter(d => d.status === 'busy' || d.status === 'idle').length;
    const tasksInQueue = tasksData.filter(t => t.status === 'pending').length;
    const completedToday = tasksData.filter(t => t.status === 'completed').length;
    const averageEfficiency = dronesData.reduce((sum, d) => sum + d.efficiency, 0) / dronesData.length;
    const totalFlightHours = dronesData.reduce((sum, d) => sum + d.totalFlightTime, 0);

    setFleetMetrics({
      totalDrones: dronesData.length,
      activeDrones,
      tasksInQueue,
      completedToday,
      averageEfficiency,
      totalFlightHours
    });
  }, []);

  // 自动调度算法
  const autoScheduleTasks = () => {
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const availableDrones = drones.filter(d => d.status === 'idle' && d.batteryLevel > 30);
    
    const updatedTasks = [...tasks];
    const updatedDrones = [...drones];

    pendingTasks
      .sort((a, b) => {
        const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      })
      .forEach(task => {
        if (availableDrones.length === 0) return;

        // 选择最适合的无人机（考虑距离、电量、效率）
        const bestDrone = availableDrones.reduce((best, drone) => {
          const distance = Math.sqrt(
            Math.pow(drone.currentLocation.lat - task.startLocation.lat, 2) +
            Math.pow(drone.currentLocation.lng - task.startLocation.lng, 2)
          );
          const score = drone.efficiency * (100 - distance * 100) * (drone.batteryLevel / 100);
          
          if (!best || score > best.score) {
            return { drone, score };
          }
          return best;
        }, null as { drone: DroneInfo; score: number } | null);

        if (bestDrone) {
          // 分配任务
          const taskIndex = updatedTasks.findIndex(t => t.id === task.id);
          const droneIndex = updatedDrones.findIndex(d => d.id === bestDrone.drone.id);
          
          updatedTasks[taskIndex] = {
            ...updatedTasks[taskIndex],
            status: 'assigned',
            droneId: bestDrone.drone.id,
            assignedTime: new Date().toLocaleTimeString()
          };
          
          updatedDrones[droneIndex] = {
            ...updatedDrones[droneIndex],
            status: 'busy',
            currentTask: task.id
          };

          // 从可用无人机列表中移除
          const availableIndex = availableDrones.findIndex(d => d.id === bestDrone.drone.id);
          availableDrones.splice(availableIndex, 1);
        }
      });

    setTasks(updatedTasks);
    setDrones(updatedDrones);
    
    // 更新指标
    const newActiveDrones = updatedDrones.filter(d => d.status === 'busy' || d.status === 'idle').length;
    const newTasksInQueue = updatedTasks.filter(t => t.status === 'pending').length;
    
    setFleetMetrics(prev => ({
      ...prev,
      activeDrones: newActiveDrones,
      tasksInQueue: newTasksInQueue
    }));
  };

  // 手动分配任务
  const manualAssignTask = (taskId: string, droneId: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: 'assigned' as const, droneId, assignedTime: new Date().toLocaleTimeString() }
        : task
    );
    
    const updatedDrones = drones.map(drone =>
      drone.id === droneId
        ? { ...drone, status: 'busy' as const, currentTask: taskId }
        : drone
    );

    setTasks(updatedTasks);
    setDrones(updatedDrones);
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'green';
      case 'busy': return 'blue';
      case 'maintenance': return 'orange';
      case 'offline': return 'red';
      case 'pending': return 'default';
      case 'assigned': return 'processing';
      case 'executing': return 'warning';
      case 'completed': return 'success';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  // 获取优先级颜色
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'blue';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const droneColumns = [
    {
      title: '无人机ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status === 'idle' ? '空闲' : status === 'busy' ? '忙碌' : status === 'maintenance' ? '维护' : '离线'}
        </Tag>
      ),
    },
    {
      title: '电量',
      dataIndex: 'batteryLevel',
      key: 'batteryLevel',
      width: 120,
      render: (level: number) => (
        <Progress 
          percent={level} 
          size="small" 
          strokeColor={level > 50 ? '#52c41a' : level > 20 ? '#faad14' : '#ff4d4f'}
        />
      ),
    },
    {
      title: '效率',
      dataIndex: 'efficiency',
      key: 'efficiency',
      width: 80,
      render: (efficiency: number) => `${efficiency.toFixed(1)}%`,
    },
    {
      title: '当前任务',
      dataIndex: 'currentTask',
      key: 'currentTask',
      width: 100,
      render: (task: string) => task || '-',
    },
    {
      title: '完成任务数',
      dataIndex: 'completedTasks',
      key: 'completedTasks',
      width: 100,
    },
  ];

  const taskColumns = [
    {
      title: '任务ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => {
        const typeMap = { delivery: '配送', patrol: '巡逻', emergency: '应急', maintenance: '维护' };
        return typeMap[type as keyof typeof typeMap] || type;
      },
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {priority === 'critical' ? '紧急' : priority === 'high' ? '高' : priority === 'medium' ? '中' : '低'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status === 'pending' ? '待分配' : status === 'assigned' ? '已分配' : 
           status === 'executing' ? '执行中' : status === 'completed' ? '已完成' : '失败'}
        </Tag>
      ),
    },
    {
      title: '分配无人机',
      dataIndex: 'droneId',
      key: 'droneId',
      width: 100,
      render: (droneId: string) => droneId || '-',
    },
    {
      title: '预计时长',
      dataIndex: 'estimatedDuration',
      key: 'estimatedDuration',
      width: 100,
      render: (duration: number) => `${duration.toFixed(0)}分钟`,
    },
    {
      title: '距离',
      dataIndex: 'distance',
      key: 'distance',
      width: 80,
      render: (distance: number) => `${distance.toFixed(1)}km`,
    },
  ];

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      {/* 集群概览指标 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col span={4}>
          <Card size="small" className="glass-panel">
            <Statistic
              title="总无人机数"
              value={fleetMetrics.totalDrones}
              prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontSize: '18px' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" className="glass-panel">
            <Statistic
              title="活跃数量"
              value={fleetMetrics.activeDrones}
              prefix={<RocketOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: '18px' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" className="glass-panel">
            <Statistic
              title="队列任务"
              value={fleetMetrics.tasksInQueue}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14', fontSize: '18px' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" className="glass-panel">
            <Statistic
              title="今日完成"
              value={fleetMetrics.completedToday}
              prefix={<CheckCircleOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1', fontSize: '18px' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" className="glass-panel">
            <Statistic
              title="平均效率"
              value={fleetMetrics.averageEfficiency}
              precision={1}
              suffix="%"
              prefix={<ThunderboltOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16', fontSize: '18px' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" className="glass-panel">
            <Statistic
              title="总飞行时长"
              value={fleetMetrics.totalFlightHours}
              precision={1}
              suffix="h"
              prefix={<EnvironmentOutlined style={{ color: '#13c2c2' }} />}
              valueStyle={{ color: '#13c2c2', fontSize: '18px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 调度控制面板 */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>
              <ControlOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              集群调度控制
            </span>
            <Space>
              <Select
                value={schedulingMode}
                onChange={setSchedulingMode}
                style={{ width: 120 }}
              >
                <Select.Option value="auto">自动调度</Select.Option>
                <Select.Option value="manual">手动调度</Select.Option>
              </Select>
              <Button 
                type="primary" 
                icon={<PlayCircleOutlined />}
                onClick={autoScheduleTasks}
                disabled={schedulingMode === 'manual'}
              >
                启动调度
              </Button>
              <Button 
                icon={<ReloadOutlined />}
                onClick={() => window.location.reload()}
              >
                重置数据
              </Button>
            </Space>
          </div>
        }
        className="glass-panel"
        style={{ marginBottom: '16px' }}
      >
        <Alert
          message={`当前调度模式: ${schedulingMode === 'auto' ? '自动调度' : '手动调度'}`}
          description={
            schedulingMode === 'auto' 
              ? '系统将根据优先级、距离、电量和效率自动分配任务给最适合的无人机'
              : '需要手动为每个任务选择合适的无人机进行分配'
          }
          type="info"
          showIcon
        />
      </Card>

      {/* 无人机状态表格 */}
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card 
            title="🚁 无人机集群状态"
            className="glass-panel"
            style={{ height: '400px' }}
          >
            <Table
              columns={droneColumns}
              dataSource={drones}
              rowKey="id"
              size="small"
              scroll={{ y: 300 }}
              pagination={false}
              rowSelection={{
                type: 'radio',
                selectedRowKeys: selectedDrone ? [selectedDrone] : [],
                onChange: (selectedRowKeys) => {
                  setSelectedDrone(selectedRowKeys[0] as string || null);
                },
              }}
            />
          </Card>
        </Col>

        {/* 任务队列表格 */}
        <Col span={12}>
          <Card 
            title="📋 任务调度队列"
            className="glass-panel"
            style={{ height: '400px' }}
          >
            <Table
              columns={taskColumns}
              dataSource={tasks}
              rowKey="id"
              size="small"
              scroll={{ y: 300 }}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      {/* 调度时间线 */}
      <Card
        title="⏱️ 调度执行时间线"
        className="glass-panel"
        style={{ marginTop: '16px' }}
      >
        <Timeline
          items={[
            {
              color: 'blue',
              children: '任务接收 - 系统接收新的配送/巡逻任务请求'
            },
            {
              color: 'orange',
              children: '优先级评估 - 根据任务类型、紧急程度、距离进行优先级排序'
            },
            {
              color: 'green',
              children: '资源匹配 - 分析可用无人机的位置、电量、负载能力'
            },
            {
              color: 'purple',
              children: '最优分配 - 使用多目标优化算法选择最适合的无人机'
            },
            {
              color: 'red',
              children: '冲突检测 - 检查航路冲突并进行动态调整'
            },
            {
              color: 'cyan',
              children: '任务执行 - 无人机开始执行任务并实时监控状态'
            }
          ]}
        />
      </Card>
    </div>
  );
};