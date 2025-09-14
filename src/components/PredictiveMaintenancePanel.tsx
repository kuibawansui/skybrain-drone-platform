'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Alert, 
  Progress, 
  Timeline, 
  Statistic, 
  Table, 
  Tag, 
  Button, 
  Space,
  Tooltip,
  Badge,
  Divider,
  List,
  Avatar
} from 'antd';
import {
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ToolOutlined,
  ThunderboltOutlined,
  BatteryOutlined,
  SettingOutlined,
  AlertOutlined,
  CalendarOutlined,
  DollarOutlined
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import type { PredictiveAnalytics, MaintenanceRecord } from '../types/analytics';

// 模拟预测性维护数据
const generatePredictiveData = () => {
  const droneNames = ['天鹰-001', '雷鸟-002', '猎鹰-003', '海燕-004', '金雕-005'];
  const components = ['螺旋桨', '电池', '传感器', '电机', '摄像头', '通信模块'];
  
  const predictiveData: PredictiveAnalytics[] = droneNames.map((name, index) => {
    const droneId = `drone_${index + 1}`;
    const batteryLife = 30 + Math.random() * 60; // 30-90天
    
    return {
      droneId,
      predictions: {
        nextMaintenanceDate: new Date(Date.now() + (7 + Math.random() * 21) * 24 * 60 * 60 * 1000),
        batteryLifeRemaining: batteryLife,
        componentFailureRisk: components.map(component => ({
          component,
          riskLevel: Math.random(),
          estimatedFailureDate: new Date(Date.now() + (30 + Math.random() * 180) * 24 * 60 * 60 * 1000),
          confidence: 0.7 + Math.random() * 0.3
        })).sort((a, b) => b.riskLevel - a.riskLevel).slice(0, 3),
        performanceDecline: {
          predicted: Math.random() > 0.6,
          timeframe: 15 + Math.random() * 45,
          factors: ['电池老化', '螺旋桨磨损', '传感器漂移'].slice(0, Math.floor(Math.random() * 3) + 1)
        }
      },
      recommendations: [
        {
          type: 'maintenance' as 'maintenance',
          priority: batteryLife < 45 ? 'high' as 'high' : 'medium' as 'medium',
          description: `建议在${Math.ceil(batteryLife)}天内更换电池`,
          estimatedCost: 800 + Math.random() * 400,
          estimatedBenefit: '延长飞行时间20%，提高安全性'
        },
        {
          type: 'optimization' as 'optimization',
          priority: 'low' as 'low',
          description: '优化飞行参数以减少部件磨损',
          estimatedCost: 0,
          estimatedBenefit: '延长部件寿命15%'
        }
      ].filter(() => Math.random() > 0.3)
    };
  });

  return predictiveData;
};

const generateMaintenanceHistory = (): MaintenanceRecord[] => {
  const records: MaintenanceRecord[] = [];
  const droneNames = ['天鹰-001', '雷鸟-002', '猎鹰-003', '海燕-004', '金雕-005'];
  const maintenanceTypes: Array<'routine' | 'repair' | 'upgrade' | 'inspection'> = 
    ['routine', 'repair', 'upgrade', 'inspection'];
  const technicians = ['张工程师', '李技师', '王维修员', '赵专家'];
  
  for (let i = 0; i < 25; i++) {
    const droneIndex = Math.floor(Math.random() * droneNames.length);
    const maintenanceDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
    
    records.push({
      id: `maintenance_${i + 1}`,
      droneId: `drone_${droneIndex + 1}`,
      date: maintenanceDate,
      type: maintenanceTypes[Math.floor(Math.random() * maintenanceTypes.length)],
      description: [
        '常规检查和清洁',
        '更换螺旋桨',
        '电池校准',
        '传感器校准',
        '固件升级',
        '电机维修'
      ][Math.floor(Math.random() * 6)],
      cost: 200 + Math.random() * 1000,
      duration: 1 + Math.random() * 4,
      technician: technicians[Math.floor(Math.random() * technicians.length)],
      partsReplaced: Math.random() > 0.5 ? ['螺旋桨', '电池'].slice(0, Math.floor(Math.random() * 2) + 1) : [],
      nextMaintenanceDate: new Date(maintenanceDate.getTime() + (30 + Math.random() * 30) * 24 * 60 * 60 * 1000),
      status: Math.random() > 0.1 ? 'completed' : 'pending'
    });
  }
  
  return records.sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const PredictiveMaintenancePanel: React.FC = () => {
  const [predictiveData, setPredictiveData] = useState<PredictiveAnalytics[]>([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setPredictiveData(generatePredictiveData());
      setMaintenanceHistory(generateMaintenanceHistory());
      setLoading(false);
    };

    initializeData();
  }, []);

  // 生成健康度趋势数据
  const generateHealthTrendData = () => {
    const days = 30;
    const data = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      data.push({
        date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        overall: 85 + Math.random() * 10 + Math.sin(i / 7) * 5,
        battery: 80 + Math.random() * 15 + Math.sin(i / 5) * 8,
        mechanical: 90 + Math.random() * 8 + Math.sin(i / 10) * 3,
        electronic: 88 + Math.random() * 10 + Math.sin(i / 6) * 4
      });
    }
    
    return data;
  };

  const healthTrendData = generateHealthTrendData();

  // 计算统计数据
  const totalDrones = predictiveData.length;
  const highRiskDrones = predictiveData.filter(d => 
    d.predictions.componentFailureRisk.some(c => c.riskLevel > 0.7)
  ).length;
  const upcomingMaintenance = predictiveData.filter(d => {
    const days = Math.ceil((d.predictions.nextMaintenanceDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days <= 7;
  }).length;
  const totalRecommendations = predictiveData.reduce((sum, d) => sum + d.recommendations.length, 0);

  // 维护记录表格列
  const maintenanceColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 100,
      render: (date: Date) => date.toLocaleDateString('zh-CN'),
    },
    {
      title: '无人机',
      dataIndex: 'droneId',
      key: 'droneId',
      width: 100,
      render: (droneId: string) => {
        const droneNames = ['天鹰-001', '雷鸟-002', '猎鹰-003', '海燕-004', '金雕-005'];
        const index = parseInt(droneId.split('_')[1]) - 1;
        return droneNames[index] || droneId;
      },
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => {
        const typeMap = {
          routine: { text: '常规', color: 'blue' },
          repair: { text: '维修', color: 'orange' },
          upgrade: { text: '升级', color: 'green' },
          inspection: { text: '检查', color: 'purple' }
        };
        const config = typeMap[type as keyof typeof typeMap] || { text: type, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '费用',
      dataIndex: 'cost',
      key: 'cost',
      width: 80,
      render: (cost: number) => `¥${cost.toFixed(0)}`,
    },
    {
      title: '技师',
      dataIndex: 'technician',
      key: 'technician',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => {
        const statusMap = {
          completed: { text: '完成', color: 'success' },
          pending: { text: '待处理', color: 'warning' },
          in_progress: { text: '进行中', color: 'processing' }
        };
        const config = statusMap[status as keyof typeof statusMap] || { text: status, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    }
  ];

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <Space>
          <ToolOutlined spin style={{ fontSize: '24px', color: '#1890ff' }} />
          <span style={{ color: 'white' }}>正在分析维护数据...</span>
        </Space>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      {/* 关键指标 */}
      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={6}>
          <Card size="small" style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(24, 144, 255, 0.3)' }}>
            <Statistic
              title="监控无人机"
              value={totalDrones}
              valueStyle={{ color: '#1890ff' }}
              prefix={<SettingOutlined />}
              suffix="架"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 77, 79, 0.3)' }}>
            <Statistic
              title="高风险设备"
              value={highRiskDrones}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<AlertOutlined />}
              suffix="架"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(250, 173, 20, 0.3)' }}>
            <Statistic
              title="近期维护"
              value={upcomingMaintenance}
              valueStyle={{ color: '#faad14' }}
              prefix={<CalendarOutlined />}
              suffix="架"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(82, 196, 26, 0.3)' }}>
            <Statistic
              title="优化建议"
              value={totalRecommendations}
              valueStyle={{ color: '#52c41a' }}
              prefix={<ThunderboltOutlined />}
              suffix="条"
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容 */}
      <Row gutter={16} style={{ height: 'calc(100% - 100px)' }}>
        {/* 左侧：预测分析 */}
        <Col span={16}>
          {/* 健康度趋势 */}
          <Card 
            title="🔍 设备健康度趋势" 
            size="small"
            style={{ 
              height: '300px', 
              marginBottom: '16px',
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(24, 144, 255, 0.3)'
            }}
          >
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={healthTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#fff" />
                <YAxis stroke="#fff" domain={[70, 100]} />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid #1890ff',
                    borderRadius: '4px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="overall" 
                  stroke="#1890ff" 
                  strokeWidth={2}
                  name="整体健康度"
                />
                <Line 
                  type="monotone" 
                  dataKey="battery" 
                  stroke="#52c41a" 
                  strokeWidth={2}
                  name="电池健康度"
                />
                <Line 
                  type="monotone" 
                  dataKey="mechanical" 
                  stroke="#faad14" 
                  strokeWidth={2}
                  name="机械健康度"
                />
                <Line 
                  type="monotone" 
                  dataKey="electronic" 
                  stroke="#722ed1" 
                  strokeWidth={2}
                  name="电子健康度"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* 风险预警 */}
          <Card 
            title="⚠️ 风险预警与建议" 
            size="small"
            style={{ 
              height: 'calc(100% - 316px)',
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(24, 144, 255, 0.3)'
            }}
          >
            <div style={{ height: 'calc(100% - 40px)', overflow: 'auto' }}>
              {predictiveData.map((drone, index) => {
                const droneNames = ['天鹰-001', '雷鸟-002', '猎鹰-003', '海燕-004', '金雕-005'];
                const droneName = droneNames[index] || `无人机-${index + 1}`;
                const highRiskComponents = drone.predictions.componentFailureRisk.filter(c => c.riskLevel > 0.6);
                
                if (highRiskComponents.length === 0 && drone.recommendations.length === 0) return null;

                return (
                  <Card 
                    key={drone.droneId}
                    size="small" 
                    title={droneName}
                    style={{ 
                      marginBottom: '12px',
                      background: 'rgba(0, 0, 0, 0.1)',
                      border: '1px solid rgba(24, 144, 255, 0.2)'
                    }}
                  >
                    {/* 高风险部件 */}
                    {highRiskComponents.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        <Alert
                          message="部件风险预警"
                          type="warning"
                          showIcon
                          style={{ marginBottom: '8px' }}
                        />
                        {highRiskComponents.map((component, idx) => (
                          <div key={idx} style={{ marginBottom: '8px' }}>
                            <Row align="middle">
                              <Col span={8}>
                                <strong>{component.component}</strong>
                              </Col>
                              <Col span={10}>
                                <Progress 
                                  percent={component.riskLevel * 100} 
                                  size="small"
                                  status={component.riskLevel > 0.8 ? 'exception' : 'active'}
                                  format={percent => `${Math.round(percent!)}%`}
                                />
                              </Col>
                              <Col span={6} style={{ textAlign: 'right' }}>
                                <Tooltip title={`预计故障时间: ${component.estimatedFailureDate.toLocaleDateString('zh-CN')}`}>
                                  <Tag color={component.riskLevel > 0.8 ? 'red' : 'orange'}>
                                    {Math.ceil((component.estimatedFailureDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))}天
                                  </Tag>
                                </Tooltip>
                              </Col>
                            </Row>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 维护建议 */}
                    {drone.recommendations.length > 0 && (
                      <div>
                        <Divider style={{ margin: '8px 0' }} />
                        <List
                          size="small"
                          dataSource={drone.recommendations}
                          renderItem={(rec, idx) => (
                            <List.Item key={idx}>
                              <List.Item.Meta
                                avatar={
                                  <Avatar 
                                    icon={rec.type === 'maintenance' ? <ToolOutlined /> : <ThunderboltOutlined />}
                                    style={{ 
                                      backgroundColor: rec.priority === 'high' ? '#ff4d4f' : 
                                                     rec.priority === 'medium' ? '#faad14' : '#52c41a'
                                    }}
                                  />
                                }
                                title={
                                  <Space>
                                    <span>{rec.description}</span>
                                    <Tag color={rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'orange' : 'green'}>
                                      {rec.priority === 'high' ? '高优先级' : rec.priority === 'medium' ? '中优先级' : '低优先级'}
                                    </Tag>
                                  </Space>
                                }
                                description={
                                  <Space>
                                    <span>预计费用: ¥{rec.estimatedCost.toFixed(0)}</span>
                                    <span>预期收益: {rec.estimatedBenefit}</span>
                                  </Space>
                                }
                              />
                            </List.Item>
                          )}
                        />
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </Card>
        </Col>

        {/* 右侧：维护历史 */}
        <Col span={8}>
          <Card 
            title="🔧 维护历史记录" 
            size="small"
            style={{ 
              height: '100%',
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(24, 144, 255, 0.3)'
            }}
            extra={
              <Button size="small" type="primary">
                新增维护
              </Button>
            }
          >
            <Table
              columns={maintenanceColumns}
              dataSource={maintenanceHistory}
              rowKey="id"
              size="small"
              scroll={{ y: 'calc(100vh - 200px)' }}
              pagination={{
                pageSize: 10,
                size: 'small',
                showSizeChanger: false
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PredictiveMaintenancePanel;