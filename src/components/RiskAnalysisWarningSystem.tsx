'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Alert, Progress, Timeline, Statistic, Badge, Button, Select, Table, Tag, Space, Modal } from 'antd';
import { 
  WarningOutlined, 
  ThunderboltOutlined, 
  CloudOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BellOutlined,
  FireOutlined,
  EyeOutlined,
  RadarChartOutlined,
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  AlertOutlined,
  SoundOutlined
} from '@ant-design/icons';

interface RiskEvent {
  id: string;
  type: 'weather' | 'collision' | 'technical' | 'airspace' | 'emergency' | 'security';
  level: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: { lat: number; lng: number; name: string };
  affectedDrones: string[];
  timestamp: string;
  status: 'active' | 'resolved' | 'monitoring';
  probability: number;
  impact: number;
  responseActions: string[];
  estimatedDuration: number; // 分钟
}

interface EmergencyResponse {
  id: string;
  eventId: string;
  type: 'evacuation' | 'reroute' | 'landing' | 'maintenance' | 'investigation';
  status: 'pending' | 'executing' | 'completed' | 'failed';
  assignedTeam: string;
  startTime: string;
  estimatedCompletion: string;
  progress: number;
}

interface RiskMetrics {
  totalRisks: number;
  criticalRisks: number;
  activeWarnings: number;
  resolvedToday: number;
  averageResponseTime: number; // 分钟
  systemReliability: number; // 百分比
}

export const RiskAnalysisWarningSystem: React.FC = () => {
  const [riskEvents, setRiskEvents] = useState<RiskEvent[]>([]);
  const [emergencyResponses, setEmergencyResponses] = useState<EmergencyResponse[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics>({
    totalRisks: 0,
    criticalRisks: 0,
    activeWarnings: 0,
    resolvedToday: 0,
    averageResponseTime: 0,
    systemReliability: 0
  });
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all');
  const [emergencyModalVisible, setEmergencyModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<RiskEvent | null>(null);

  // 初始化风险事件数据
  useEffect(() => {
    const generateRiskEvents = (): RiskEvent[] => {
      const riskTypes: RiskEvent['type'][] = ['weather', 'collision', 'technical', 'airspace', 'emergency', 'security'];
      const riskLevels: RiskEvent['level'][] = ['low', 'medium', 'high', 'critical'];
      const statuses: RiskEvent['status'][] = ['active', 'resolved', 'monitoring'];
      
      const events: RiskEvent[] = [
        {
          id: 'RISK-001',
          type: 'weather',
          level: 'high',
          title: '强风切变警告',
          description: '检测到CBD核心区域出现强风切变现象，风速突变超过15m/s，可能影响无人机飞行稳定性',
          location: { lat: 39.9042, lng: 116.4074, name: 'CBD核心区' },
          affectedDrones: ['UAV-001', 'UAV-003', 'UAV-007'],
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toLocaleTimeString(),
          status: 'active',
          probability: 85,
          impact: 75,
          responseActions: ['调整飞行高度', '重新规划航线', '降低飞行速度'],
          estimatedDuration: 45
        },
        {
          id: 'RISK-002',
          type: 'collision',
          level: 'critical',
          title: '空域冲突预警',
          description: 'UAV-005与UAV-012在坐标(116.408, 39.905)处存在潜在碰撞风险，预计3分钟后交汇',
          location: { lat: 39.905, lng: 116.408, name: '朝阳区商务中心' },
          affectedDrones: ['UAV-005', 'UAV-012'],
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toLocaleTimeString(),
          status: 'active',
          probability: 92,
          impact: 95,
          responseActions: ['紧急避让机动', '高度分离', '速度调节'],
          estimatedDuration: 8
        },
        {
          id: 'RISK-003',
          type: 'technical',
          level: 'medium',
          title: '电池电量不足',
          description: 'UAV-008电池电量降至20%以下，需要立即返航充电或更换电池',
          location: { lat: 39.912, lng: 116.395, name: '海淀区科技园' },
          affectedDrones: ['UAV-008'],
          timestamp: new Date(Date.now() - 8 * 60 * 1000).toLocaleTimeString(),
          status: 'monitoring',
          probability: 100,
          impact: 40,
          responseActions: ['立即返航', '寻找最近充电站', '任务转移'],
          estimatedDuration: 25
        },
        {
          id: 'RISK-004',
          type: 'airspace',
          level: 'high',
          title: '禁飞区域入侵',
          description: '检测到UAV-015偏离预定航线，正在接近军事管制区域边界',
          location: { lat: 39.928, lng: 116.388, name: '军事管制区边界' },
          affectedDrones: ['UAV-015'],
          timestamp: new Date(Date.now() - 12 * 60 * 1000).toLocaleTimeString(),
          status: 'active',
          probability: 78,
          impact: 90,
          responseActions: ['立即转向', '降低高度', '联系管制中心'],
          estimatedDuration: 15
        },
        {
          id: 'RISK-005',
          type: 'emergency',
          level: 'critical',
          title: '医疗紧急配送',
          description: '接收到医疗紧急配送任务，需要为重症患者运送血液制品，要求最高优先级',
          location: { lat: 39.897, lng: 116.423, name: '协和医院' },
          affectedDrones: ['UAV-002'],
          timestamp: new Date(Date.now() - 3 * 60 * 1000).toLocaleTimeString(),
          status: 'active',
          probability: 100,
          impact: 100,
          responseActions: ['清空航线', '最高优先级', '医疗护航'],
          estimatedDuration: 20
        },
        {
          id: 'RISK-006',
          type: 'security',
          level: 'medium',
          title: '异常飞行器检测',
          description: '雷达系统检测到未识别飞行器进入监控空域，可能为非法无人机',
          location: { lat: 39.915, lng: 116.404, name: '奥林匹克公园' },
          affectedDrones: ['UAV-009', 'UAV-011'],
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toLocaleTimeString(),
          status: 'monitoring',
          probability: 65,
          impact: 70,
          responseActions: ['增强监控', '保持距离', '上报安全部门'],
          estimatedDuration: 60
        }
      ];

      // 添加更多随机事件
      for (let i = 7; i <= 20; i++) {
        events.push({
          id: `RISK-${String(i).padStart(3, '0')}`,
          type: riskTypes[Math.floor(Math.random() * riskTypes.length)],
          level: riskLevels[Math.floor(Math.random() * riskLevels.length)],
          title: `风险事件 ${i}`,
          description: `系统检测到的第${i}个风险事件，需要关注和处理`,
          location: {
            lat: 39.9042 + (Math.random() - 0.5) * 0.1,
            lng: 116.4074 + (Math.random() - 0.5) * 0.1,
            name: `位置点-${i}`
          },
          affectedDrones: [`UAV-${String(Math.floor(Math.random() * 20) + 1).padStart(3, '0')}`],
          timestamp: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toLocaleTimeString(),
          status: statuses[Math.floor(Math.random() * statuses.length)],
          probability: 30 + Math.random() * 70,
          impact: 20 + Math.random() * 80,
          responseActions: ['监控状态', '准备应对', '评估影响'],
          estimatedDuration: 10 + Math.random() * 120
        });
      }

      return events;
    };

    const generateEmergencyResponses = (): EmergencyResponse[] => {
      return [
        {
          id: 'RESP-001',
          eventId: 'RISK-001',
          type: 'reroute',
          status: 'executing',
          assignedTeam: '飞行控制组A',
          startTime: new Date(Date.now() - 3 * 60 * 1000).toLocaleTimeString(),
          estimatedCompletion: new Date(Date.now() + 42 * 60 * 1000).toLocaleTimeString(),
          progress: 35
        },
        {
          id: 'RESP-002',
          eventId: 'RISK-002',
          type: 'evacuation',
          status: 'executing',
          assignedTeam: '应急响应组',
          startTime: new Date(Date.now() - 1 * 60 * 1000).toLocaleTimeString(),
          estimatedCompletion: new Date(Date.now() + 7 * 60 * 1000).toLocaleTimeString(),
          progress: 80
        },
        {
          id: 'RESP-003',
          eventId: 'RISK-003',
          type: 'landing',
          status: 'pending',
          assignedTeam: '维护组B',
          startTime: new Date().toLocaleTimeString(),
          estimatedCompletion: new Date(Date.now() + 25 * 60 * 1000).toLocaleTimeString(),
          progress: 0
        }
      ];
    };

    const events = generateRiskEvents();
    const responses = generateEmergencyResponses();
    
    setRiskEvents(events);
    setEmergencyResponses(responses);

    // 计算风险指标
    const totalRisks = events.length;
    const criticalRisks = events.filter(e => e.level === 'critical').length;
    const activeWarnings = events.filter(e => e.status === 'active').length;
    const resolvedToday = events.filter(e => e.status === 'resolved').length;
    const averageResponseTime = 8.5; // 模拟数据
    const systemReliability = 96.8; // 模拟数据

    setRiskMetrics({
      totalRisks,
      criticalRisks,
      activeWarnings,
      resolvedToday,
      averageResponseTime,
      systemReliability
    });
  }, []);

  // 获取风险等级颜色
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return '#ff4d4f';
      case 'high': return '#fa8c16';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#d9d9d9';
    }
  };

  // 获取风险类型图标
  const getRiskTypeIcon = (type: string) => {
    switch (type) {
      case 'weather': return <CloudOutlined />;
      case 'collision': return <ExclamationCircleOutlined />;
      case 'technical': return <ThunderboltOutlined />;
      case 'airspace': return <EnvironmentOutlined />;
      case 'emergency': return <FireOutlined />;
      case 'security': return <SafetyCertificateOutlined />;
      default: return <WarningOutlined />;
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'error';
      case 'resolved': return 'success';
      case 'monitoring': return 'warning';
      default: return 'default';
    }
  };

  // 触发应急响应
  const triggerEmergencyResponse = (event: RiskEvent) => {
    setSelectedEvent(event);
    setEmergencyModalVisible(true);
  };

  // 过滤风险事件
  const filteredEvents = selectedRiskLevel === 'all' 
    ? riskEvents 
    : riskEvents.filter(event => event.level === selectedRiskLevel);

  const riskColumns = [
    {
      title: '风险ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {getRiskTypeIcon(type)}
          <span style={{ fontSize: '12px' }}>
            {type === 'weather' ? '气象' : type === 'collision' ? '碰撞' : 
             type === 'technical' ? '技术' : type === 'airspace' ? '空域' :
             type === 'emergency' ? '紧急' : '安全'}
          </span>
        </div>
      ),
    },
    {
      title: '等级',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level: string) => (
        <Tag color={getRiskLevelColor(level)}>
          {level === 'critical' ? '严重' : level === 'high' ? '高' : 
           level === 'medium' ? '中' : '低'}
        </Tag>
      ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Badge 
          status={getStatusColor(status) as any} 
          text={status === 'active' ? '活跃' : status === 'resolved' ? '已解决' : '监控中'}
        />
      ),
    },
    {
      title: '概率',
      dataIndex: 'probability',
      key: 'probability',
      width: 100,
      render: (probability: number) => (
        <Progress 
          percent={probability} 
          size="small" 
          strokeColor={probability > 80 ? '#ff4d4f' : probability > 60 ? '#fa8c16' : '#52c41a'}
        />
      ),
    },
    {
      title: '影响',
      dataIndex: 'impact',
      key: 'impact',
      width: 100,
      render: (impact: number) => (
        <Progress 
          percent={impact} 
          size="small" 
          strokeColor={impact > 80 ? '#ff4d4f' : impact > 60 ? '#fa8c16' : '#52c41a'}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: RiskEvent) => (
        <Button 
          size="small" 
          type="primary" 
          danger={record.level === 'critical'}
          onClick={() => triggerEmergencyResponse(record)}
        >
          应急响应
        </Button>
      ),
    },
  ];

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      {/* 风险概览指标 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col span={4}>
          <Card size="small" className="glass-panel">
            <Statistic
              title="总风险数"
              value={riskMetrics.totalRisks}
              prefix={<AlertOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontSize: '18px' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" className="glass-panel">
            <Statistic
              title="严重风险"
              value={riskMetrics.criticalRisks}
              prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f', fontSize: '18px' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" className="glass-panel">
            <Statistic
              title="活跃警告"
              value={riskMetrics.activeWarnings}
              prefix={<BellOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16', fontSize: '18px' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" className="glass-panel">
            <Statistic
              title="今日解决"
              value={riskMetrics.resolvedToday}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: '18px' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" className="glass-panel">
            <Statistic
              title="响应时间"
              value={riskMetrics.averageResponseTime}
              precision={1}
              suffix="分钟"
              prefix={<CloseCircleOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1', fontSize: '18px' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" className="glass-panel">
            <Statistic
              title="系统可靠性"
              value={riskMetrics.systemReliability}
              precision={1}
              suffix="%"
              prefix={<SafetyCertificateOutlined style={{ color: '#13c2c2' }} />}
              valueStyle={{ color: '#13c2c2', fontSize: '18px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 紧急警告横幅 */}
      {riskEvents.filter(e => e.level === 'critical' && e.status === 'active').length > 0 && (
        <Alert
          message="🚨 严重风险警告"
          description={
            <div>
              检测到 {riskEvents.filter(e => e.level === 'critical' && e.status === 'active').length} 个严重风险事件正在发生，请立即采取应急措施！
              <ul style={{ margin: '8px 0 0 20px' }}>
                {riskEvents.filter(e => e.level === 'critical' && e.status === 'active').map(event => (
                  <li key={event.id}>{event.title} - {event.location.name}</li>
                ))}
              </ul>
            </div>
          }
          type="error"
          showIcon
          style={{ marginBottom: '16px' }}
          action={
            <Button size="small" danger>
              查看详情
            </Button>
          }
        />
      )}

      {/* 风险事件列表 */}
      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>
                  <WarningOutlined style={{ marginRight: '8px', color: '#fa8c16' }} />
                  风险事件监控
                </span>
                <Select
                  value={selectedRiskLevel}
                  onChange={setSelectedRiskLevel}
                  style={{ width: 120 }}
                >
                  <Select.Option value="all">全部等级</Select.Option>
                  <Select.Option value="critical">严重</Select.Option>
                  <Select.Option value="high">高</Select.Option>
                  <Select.Option value="medium">中</Select.Option>
                  <Select.Option value="low">低</Select.Option>
                </Select>
              </div>
            }
            className="glass-panel"
            style={{ height: '500px' }}
          >
            <Table
              columns={riskColumns}
              dataSource={filteredEvents}
              rowKey="id"
              size="small"
              scroll={{ y: 380 }}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>

        {/* 应急响应状态 */}
        <Col span={8}>
          <Card 
            title="🚑 应急响应状态"
            className="glass-panel"
            style={{ height: '500px' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {emergencyResponses.map((response) => (
                <Card key={response.id} size="small" style={{ background: 'rgba(0, 20, 40, 0.3)' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <Tag color={response.status === 'executing' ? 'processing' : response.status === 'completed' ? 'success' : 'default'}>
                      {response.status === 'executing' ? '执行中' : response.status === 'completed' ? '已完成' : '待处理'}
                    </Tag>
                    <span style={{ fontSize: '12px', color: 'white' }}>{response.type === 'reroute' ? '航线调整' : response.type === 'evacuation' ? '紧急撤离' : '紧急降落'}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#8C8C8C', marginBottom: '8px' }}>
                    负责团队: {response.assignedTeam}
                  </div>
                  <Progress 
                    percent={response.progress} 
                    size="small" 
                    strokeColor={response.progress > 80 ? '#52c41a' : '#1890ff'}
                  />
                  <div style={{ fontSize: '10px', color: '#8C8C8C', marginTop: '4px' }}>
                    预计完成: {response.estimatedCompletion}
                  </div>
                </Card>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 风险分析时间线 */}
      <Card
        title="📊 风险分析处理流程"
        className="glass-panel"
        style={{ marginTop: '16px' }}
      >
        <Timeline
          items={[
            {
              color: 'blue',
              children: '风险检测 - 多模态传感器实时监控，AI算法自动识别潜在风险'
            },
            {
              color: 'orange',
              children: '风险评估 - 动态贝叶斯网络计算风险概率和影响程度'
            },
            {
              color: 'red',
              children: '预警发布 - 根据风险等级自动触发相应级别的预警通知'
            },
            {
              color: 'purple',
              children: '应急响应 - 启动预案，调度资源，执行避险或救援行动'
            },
            {
              color: 'green',
              children: '效果评估 - 监控响应效果，调整策略，总结经验教训'
            },
            {
              color: 'cyan',
              children: '风险解除 - 确认风险消除，恢复正常运行，更新风险模型'
            }
          ]}
        />
      </Card>

      {/* 应急响应模态框 */}
      <Modal
        title="🚨 应急响应处理"
        open={emergencyModalVisible}
        onCancel={() => setEmergencyModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setEmergencyModalVisible(false)}>
            取消
          </Button>,
          <Button key="confirm" type="primary" danger>
            确认执行
          </Button>
        ]}
      >
        {selectedEvent && (
          <div>
            <Alert
              message={selectedEvent.title}
              description={selectedEvent.description}
              type={selectedEvent.level === 'critical' ? 'error' : 'warning'}
              showIcon
              style={{ marginBottom: '16px' }}
            />
            <div style={{ marginBottom: '12px' }}>
              <strong>建议响应措施:</strong>
              <ul style={{ marginTop: '8px' }}>
                {selectedEvent.responseActions.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>受影响无人机:</strong> {selectedEvent.affectedDrones.join(', ')}
            </div>
            <div>
              <strong>预计处理时间:</strong> {selectedEvent.estimatedDuration} 分钟
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};