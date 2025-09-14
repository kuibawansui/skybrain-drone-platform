'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Tabs, 
  DatePicker, 
  Select, 
  Button, 
  Space, 
  Statistic, 
  Table, 
  Progress,
  Tag,
  Alert,
  Tooltip,
  Spin
} from 'antd';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DownloadOutlined,
  CalendarOutlined,
  FilterOutlined,
  ExportOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { FlightRecord, DronePerformanceMetrics, FlightAnalytics } from '../types/analytics';

const { RangePicker } = DatePicker;
const { Option } = Select;

// 模拟历史数据
const generateMockFlightData = (): FlightRecord[] => {
  const mockData: FlightRecord[] = [];
  const droneNames = ['天鹰-001', '雷鸟-002', '猎鹰-003', '海燕-004', '金雕-005'];
  const missionTypes: Array<'patrol' | 'delivery' | 'inspection' | 'emergency' | 'training'> = 
    ['patrol', 'delivery', 'inspection', 'emergency', 'training'];
  
  for (let i = 0; i < 150; i++) {
    const startTime = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const duration = 20 + Math.random() * 120; // 20-140分钟
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
    
    mockData.push({
      id: `flight_${i + 1}`,
      droneId: `drone_${Math.floor(Math.random() * 5) + 1}`,
      droneName: droneNames[Math.floor(Math.random() * droneNames.length)],
      startTime,
      endTime,
      duration,
      distance: 5 + Math.random() * 45, // 5-50公里
      maxAltitude: 50 + Math.random() * 100, // 50-150米
      avgSpeed: 15 + Math.random() * 25, // 15-40 km/h
      maxSpeed: 25 + Math.random() * 35, // 25-60 km/h
      batteryStart: 95 + Math.random() * 5, // 95-100%
      batteryEnd: 20 + Math.random() * 30, // 20-50%
      batteryConsumption: 50 + Math.random() * 30, // 50-80%
      flightPath: [], // 简化处理
      weather: {
        temperature: 15 + Math.random() * 20,
        humidity: 40 + Math.random() * 40,
        windSpeed: Math.random() * 15,
        windDirection: Math.random() * 360,
        visibility: 5 + Math.random() * 15
      },
      riskEvents: Math.random() > 0.7 ? [{
        timestamp: new Date(startTime.getTime() + Math.random() * duration * 60 * 1000),
        type: Math.random() > 0.5 ? 'warning' : 'error' as 'warning' | 'error',
        description: '检测到异常气流',
        riskLevel: Math.random()
      }] : [],
      missionType: missionTypes[Math.floor(Math.random() * missionTypes.length)],
      status: Math.random() > 0.1 ? 'completed' : (Math.random() > 0.5 ? 'aborted' : 'emergency_landing') as 'completed' | 'aborted' | 'emergency_landing'
    });
  }
  
  return mockData.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
};

const generatePerformanceMetrics = (flightData: FlightRecord[]): DronePerformanceMetrics[] => {
  const droneGroups = flightData.reduce((acc, flight) => {
    if (!acc[flight.droneId]) {
      acc[flight.droneId] = [];
    }
    acc[flight.droneId].push(flight);
    return acc;
  }, {} as Record<string, FlightRecord[]>);

  return Object.entries(droneGroups).map(([droneId, flights]) => {
    const completedFlights = flights.filter(f => f.status === 'completed');
    const totalFlightTime = flights.reduce((sum, f) => sum + f.duration, 0) / 60; // 小时
    const totalDistance = flights.reduce((sum, f) => sum + f.distance, 0);
    
    return {
      droneId,
      droneName: flights[0].droneName,
      totalFlights: flights.length,
      totalFlightTime,
      totalDistance,
      avgFlightDuration: flights.reduce((sum, f) => sum + f.duration, 0) / flights.length,
      avgBatteryConsumption: flights.reduce((sum, f) => sum + f.batteryConsumption, 0) / flights.length,
      successRate: (completedFlights.length / flights.length) * 100,
      maintenanceScore: 75 + Math.random() * 20,
      lastMaintenance: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + (7 + Math.random() * 14) * 24 * 60 * 60 * 1000),
      performanceTrend: ['improving', 'stable', 'declining'][Math.floor(Math.random() * 3)] as 'improving' | 'stable' | 'declining',
      commonIssues: ['电池老化', '螺旋桨磨损', '传感器校准'].slice(0, Math.floor(Math.random() * 3) + 1)
    };
  });
};

export const HistoricalDataAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState<[any, any] | null>(null);
  const [selectedDrones, setSelectedDrones] = useState<string[]>([]);
  const [flightData, setFlightData] = useState<FlightRecord[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<DronePerformanceMetrics[]>([]);

  // 初始化数据
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockFlightData = generateMockFlightData();
      const mockPerformanceData = generatePerformanceMetrics(mockFlightData);
      
      setFlightData(mockFlightData);
      setPerformanceMetrics(mockPerformanceData);
      setLoading(false);
    };

    initializeData();
  }, []);

  // 过滤数据
  const filteredFlightData = flightData.filter(flight => {
    if (timeRange && timeRange[0] && timeRange[1]) {
      const flightDate = flight.startTime;
      return flightDate >= timeRange[0].toDate() && flightDate <= timeRange[1].toDate();
    }
    if (selectedDrones.length > 0) {
      return selectedDrones.includes(flight.droneId);
    }
    return true;
  });

  // 生成图表数据
  const generateChartData = () => {
    // 按日期统计飞行次数
    const flightsByDate = filteredFlightData.reduce((acc, flight) => {
      const date = flight.startTime.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const flightTrendData = Object.entries(flightsByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14) // 最近14天
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        flights: count,
        distance: filteredFlightData
          .filter(f => f.startTime.toISOString().split('T')[0] === date)
          .reduce((sum, f) => sum + f.distance, 0)
      }));

    // 任务类型分布
    const missionTypeData = Object.entries(
      filteredFlightData.reduce((acc, flight) => {
        acc[flight.missionType] = (acc[flight.missionType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([type, count]) => ({
      name: {
        patrol: '巡逻',
        delivery: '配送',
        inspection: '检查',
        emergency: '紧急',
        training: '训练'
      }[type] || type,
      value: count,
      color: {
        patrol: '#1890ff',
        delivery: '#52c41a',
        inspection: '#faad14',
        emergency: '#ff4d4f',
        training: '#722ed1'
      }[type] || '#666'
    }));

    // 无人机性能对比
    const dronePerformanceData = performanceMetrics.map(drone => ({
      name: drone.droneName,
      flights: drone.totalFlights,
      hours: Math.round(drone.totalFlightTime * 10) / 10,
      distance: Math.round(drone.totalDistance * 10) / 10,
      successRate: Math.round(drone.successRate * 10) / 10,
      maintenance: drone.maintenanceScore
    }));

    return {
      flightTrendData,
      missionTypeData,
      dronePerformanceData
    };
  };

  const { flightTrendData, missionTypeData, dronePerformanceData } = generateChartData();

  // 计算统计数据
  const totalFlights = filteredFlightData.length;
  const totalFlightTime = filteredFlightData.reduce((sum, f) => sum + f.duration, 0) / 60; // 小时
  const totalDistance = filteredFlightData.reduce((sum, f) => sum + f.distance, 0);
  const avgSuccessRate = performanceMetrics.reduce((sum, p) => sum + p.successRate, 0) / performanceMetrics.length;
  const totalRiskEvents = filteredFlightData.reduce((sum, f) => sum + f.riskEvents.length, 0);

  // 表格列定义
  const flightColumns = [
    {
      title: '无人机',
      dataIndex: 'droneName',
      key: 'droneName',
      width: 120,
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 150,
      render: (time: Date) => time.toLocaleString('zh-CN'),
    },
    {
      title: '飞行时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (duration: number) => `${Math.round(duration)}分钟`,
    },
    {
      title: '距离',
      dataIndex: 'distance',
      key: 'distance',
      width: 100,
      render: (distance: number) => `${distance.toFixed(1)}km`,
    },
    {
      title: '任务类型',
      dataIndex: 'missionType',
      key: 'missionType',
      width: 100,
      render: (type: string) => {
        const typeMap = {
          patrol: { text: '巡逻', color: 'blue' },
          delivery: { text: '配送', color: 'green' },
          inspection: { text: '检查', color: 'orange' },
          emergency: { text: '紧急', color: 'red' },
          training: { text: '训练', color: 'purple' }
        };
        const config = typeMap[type as keyof typeof typeMap] || { text: type, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap = {
          completed: { text: '完成', color: 'success' },
          aborted: { text: '中止', color: 'warning' },
          emergency_landing: { text: '紧急降落', color: 'error' }
        };
        const config = statusMap[status as keyof typeof statusMap] || { text: status, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '电池消耗',
      dataIndex: 'batteryConsumption',
      key: 'batteryConsumption',
      width: 120,
      render: (consumption: number) => (
        <Progress 
          percent={consumption} 
          size="small" 
          status={consumption > 80 ? 'exception' : 'normal'}
          format={percent => `${Math.round(percent!)}%`}
        />
      ),
    }
  ];

  const performanceColumns = [
    {
      title: '无人机',
      dataIndex: 'droneName',
      key: 'droneName',
      width: 120,
    },
    {
      title: '总飞行次数',
      dataIndex: 'totalFlights',
      key: 'totalFlights',
      width: 100,
    },
    {
      title: '总飞行时间',
      dataIndex: 'totalFlightTime',
      key: 'totalFlightTime',
      width: 120,
      render: (time: number) => `${time.toFixed(1)}小时`,
    },
    {
      title: '总距离',
      dataIndex: 'totalDistance',
      key: 'totalDistance',
      width: 100,
      render: (distance: number) => `${distance.toFixed(1)}km`,
    },
    {
      title: '成功率',
      dataIndex: 'successRate',
      key: 'successRate',
      width: 100,
      render: (rate: number) => (
        <Progress 
          percent={rate} 
          size="small" 
          status={rate > 90 ? 'success' : rate > 70 ? 'normal' : 'exception'}
          format={percent => `${Math.round(percent!)}%`}
        />
      ),
    },
    {
      title: '维护评分',
      dataIndex: 'maintenanceScore',
      key: 'maintenanceScore',
      width: 100,
      render: (score: number) => (
        <Progress 
          percent={score} 
          size="small" 
          status={score > 80 ? 'success' : score > 60 ? 'normal' : 'exception'}
          format={percent => `${Math.round(percent!)}分`}
        />
      ),
    },
    {
      title: '性能趋势',
      dataIndex: 'performanceTrend',
      key: 'performanceTrend',
      width: 100,
      render: (trend: string) => {
        const trendMap = {
          improving: { text: '上升', color: 'success' },
          stable: { text: '稳定', color: 'processing' },
          declining: { text: '下降', color: 'warning' }
        };
        const config = trendMap[trend as keyof typeof trendMap] || { text: trend, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '下次维护',
      dataIndex: 'nextMaintenance',
      key: 'nextMaintenance',
      width: 120,
      render: (date: Date) => {
        const days = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return (
          <Tooltip title={date.toLocaleDateString('zh-CN')}>
            <Tag color={days < 7 ? 'red' : days < 14 ? 'orange' : 'green'}>
              {days}天后
            </Tag>
          </Tooltip>
        );
      },
    }
  ];

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        background: 'rgba(0, 0, 0, 0.1)',
        borderRadius: '8px'
      }}>
        <Spin size="large" />
        <span style={{ marginLeft: '16px', color: 'white' }}>正在加载历史数据...</span>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      {/* 控制面板 */}
      <Card 
        size="small" 
        style={{ 
          marginBottom: '16px',
          background: 'rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(24, 144, 255, 0.3)'
        }}
      >
        <Row gutter={16} align="middle">
          <Col>
            <Space>
              <CalendarOutlined style={{ color: '#1890ff' }} />
              <RangePicker
                value={timeRange}
                onChange={setTimeRange}
                placeholder={['开始日期', '结束日期']}
                style={{ width: 240 }}
              />
            </Space>
          </Col>
          <Col>
            <Space>
              <FilterOutlined style={{ color: '#1890ff' }} />
              <Select
                mode="multiple"
                placeholder="选择无人机"
                style={{ width: 200 }}
                value={selectedDrones}
                onChange={setSelectedDrones}
              >
                {performanceMetrics.map(drone => (
                  <Option key={drone.droneId} value={drone.droneId}>
                    {drone.droneName}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => window.location.reload()}
              >
                刷新数据
              </Button>
              <Button 
                type="primary" 
                icon={<ExportOutlined />}
              >
                导出报告
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 统计概览 */}
      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={6}>
          <Card size="small" style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(24, 144, 255, 0.3)' }}>
            <Statistic
              title="总飞行次数"
              value={totalFlights}
              valueStyle={{ color: '#1890ff' }}
              suffix="次"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(24, 144, 255, 0.3)' }}>
            <Statistic
              title="总飞行时间"
              value={totalFlightTime.toFixed(1)}
              valueStyle={{ color: '#52c41a' }}
              suffix="小时"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(24, 144, 255, 0.3)' }}>
            <Statistic
              title="总飞行距离"
              value={totalDistance.toFixed(1)}
              valueStyle={{ color: '#faad14' }}
              suffix="公里"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(24, 144, 255, 0.3)' }}>
            <Statistic
              title="平均成功率"
              value={avgSuccessRate.toFixed(1)}
              valueStyle={{ color: avgSuccessRate > 90 ? '#52c41a' : '#faad14' }}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容标签页 */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        style={{ height: 'calc(100% - 140px)' }}
        items={[
          {
            key: 'overview',
            label: (
              <span>
                <BarChartOutlined />
                数据概览
              </span>
            ),
            children: (
              <Row gutter={16} style={{ height: '100%' }}>
                <Col span={12}>
                  <Card 
                    title="飞行趋势分析" 
                    size="small"
                    style={{ 
                      height: '300px', 
                      marginBottom: '16px',
                      background: 'rgba(0, 0, 0, 0.2)',
                      border: '1px solid rgba(24, 144, 255, 0.3)'
                    }}
                  >
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={flightTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="#fff" />
                        <YAxis stroke="#fff" />
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0,0,0,0.8)', 
                            border: '1px solid #1890ff',
                            borderRadius: '4px'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="flights" 
                          stroke="#1890ff" 
                          fill="rgba(24, 144, 255, 0.3)"
                          name="飞行次数"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Card>
                  
                  <Card 
                    title="任务类型分布" 
                    size="small"
                    style={{ 
                      height: '300px',
                      background: 'rgba(0, 0, 0, 0.2)',
                      border: '1px solid rgba(24, 144, 255, 0.3)'
                    }}
                  >
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={missionTypeData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {missionTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0,0,0,0.8)', 
                            border: '1px solid #1890ff',
                            borderRadius: '4px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
                
                <Col span={12}>
                  <Card 
                    title="无人机性能对比" 
                    size="small"
                    style={{ 
                      height: '620px',
                      background: 'rgba(0, 0, 0, 0.2)',
                      border: '1px solid rgba(24, 144, 255, 0.3)'
                    }}
                  >
                    <ResponsiveContainer width="100%" height={540}>
                      <BarChart data={dronePerformanceData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis type="number" stroke="#fff" />
                        <YAxis dataKey="name" type="category" stroke="#fff" width={80} />
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0,0,0,0.8)', 
                            border: '1px solid #1890ff',
                            borderRadius: '4px'
                          }}
                        />
                        <Legend />
                        <Bar dataKey="flights" fill="#1890ff" name="飞行次数" />
                        <Bar dataKey="hours" fill="#52c41a" name="飞行小时" />
                        <Bar dataKey="successRate" fill="#faad14" name="成功率%" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
              </Row>
            )
          },
          {
            key: 'flights',
            label: (
              <span>
                <LineChartOutlined />
                飞行记录
              </span>
            ),
            children: (
              <Card 
                title={`飞行记录 (${filteredFlightData.length} 条)`}
                size="small"
                style={{ 
                  height: '100%',
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(24, 144, 255, 0.3)'
                }}
                extra={
                  <Button 
                    size="small" 
                    icon={<DownloadOutlined />}
                  >
                    导出数据
                  </Button>
                }
              >
                <Table
                  columns={flightColumns}
                  dataSource={filteredFlightData}
                  rowKey="id"
                  size="small"
                  scroll={{ y: 'calc(100vh - 300px)' }}
                  pagination={{
                    pageSize: 20,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => 
                      `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
                  }}
                />
              </Card>
            )
          },
          {
            key: 'performance',
            label: (
              <span>
                <PieChartOutlined />
                性能分析
              </span>
            ),
            children: (
              <Card 
                title="无人机性能分析"
                size="small"
                style={{ 
                  height: '100%',
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(24, 144, 255, 0.3)'
                }}
              >
                <Table
                  columns={performanceColumns}
                  dataSource={performanceMetrics}
                  rowKey="droneId"
                  size="small"
                  scroll={{ y: 'calc(100vh - 300px)' }}
                  pagination={false}
                />
              </Card>
            )
          }
        ]}
      />
    </div>
  );
};

export default HistoricalDataAnalytics;