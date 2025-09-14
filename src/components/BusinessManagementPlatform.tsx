'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Progress, 
  Tag, 
  Button,
  Select,
  DatePicker,
  Tabs,
  List,
  Avatar,
  Badge,
  Timeline,
  Alert
} from 'antd';
import {
  DollarOutlined,
  TrophyOutlined,
  TeamOutlined,
  RocketOutlined,
  BarChartOutlined,
  FileTextOutlined,
  BellOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Line, Column, Pie } from '@ant-design/plots';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface BusinessData {
  revenue: number;
  orders: number;
  customers: number;
  efficiency: number;
  growth: number;
}

interface CustomerData {
  id: string;
  name: string;
  type: string;
  revenue: number;
  orders: number;
  status: string;
}

interface PerformanceMetric {
  metric: string;
  current: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
}

export const BusinessManagementPlatform: React.FC = () => {
  const [businessData, setBusinessData] = useState<BusinessData>({
    revenue: 0,
    orders: 0,
    customers: 0,
    efficiency: 0,
    growth: 0
  });

  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [loading, setLoading] = useState(false);

  // 导出报告功能
  const handleExportReport = () => {
    setLoading(true);
    
    // 生成报告数据
    const reportData = {
      period: selectedPeriod,
      generatedAt: new Date().toLocaleString('zh-CN'),
      summary: {
        totalRevenue: businessData.revenue,
        totalOrders: businessData.orders,
        activeCustomers: businessData.customers,
        operationalEfficiency: businessData.efficiency,
        growthRate: businessData.growth
      },
      customers: customerData,
      performance: performanceMetrics,
      businessDistribution: businessDistribution
    };

    // 创建并下载JSON报告
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `SkyBrain商业报告_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    // 同时生成CSV格式的客户数据（修复换行与转义）
    const escapeCSV = (val: unknown) => {
      const s = String(val ?? '');
      const needsQuote = /[",\n\r]/.test(s);
      const escaped = s.replace(/"/g, '""');
      return needsQuote ? `"${escaped}"` : escaped;
    };
    const csvRows: string[] = [];
    csvRows.push(['客户名称', '业务类型', '月收入(元)', '订单数', '状态'].map(escapeCSV).join(','));
    customerData.forEach((customer) => {
      csvRows.push([
        customer.name,
        customer.type,
        customer.revenue,
        customer.orders,
        customer.status === 'active' ? '活跃' : '待激活'
      ].map(escapeCSV).join(','));
    });
    const csvContent = csvRows.join('\n');
    
    const csvUri = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csvContent);
    const csvFileName = `SkyBrain客户数据_${new Date().toISOString().split('T')[0]}.csv`;
    
    const csvLink = document.createElement('a');
    csvLink.setAttribute('href', csvUri);
    csvLink.setAttribute('download', csvFileName);
    csvLink.click();
    
    setTimeout(() => {
      setLoading(false);
      // 显示成功提示
      alert('报告导出成功！已生成JSON和CSV两种格式的文件。');
    }, 1000);
  };

  // 模拟实时业务数据
  useEffect(() => {
    const updateBusinessData = () => {
      setBusinessData({
        revenue: 2850000 + Math.random() * 100000,
        orders: 15420 + Math.floor(Math.random() * 100),
        customers: 1280 + Math.floor(Math.random() * 20),
        efficiency: 94.5 + Math.random() * 5,
        growth: 23.8 + Math.random() * 5
      });
    };

    updateBusinessData();
    const interval = setInterval(updateBusinessData, 3000);
    return () => clearInterval(interval);
  }, []);

  // 收入趋势数据
  const revenueData = [
    { month: '1月', revenue: 2200000, profit: 440000 },
    { month: '2月', revenue: 2350000, profit: 470000 },
    { month: '3月', revenue: 2180000, profit: 436000 },
    { month: '4月', revenue: 2520000, profit: 504000 },
    { month: '5月', revenue: 2680000, profit: 536000 },
    { month: '6月', revenue: 2850000, profit: 570000 }
  ];

  // 业务分布数据
  const businessDistribution = [
    { type: '物流配送', value: 45, color: '#1890ff' },
    { type: '应急救援', value: 25, color: '#52c41a' },
    { type: '巡检监控', value: 20, color: '#faad14' },
    { type: '其他服务', value: 10, color: '#f5222d' }
  ];

  // 客户数据
  const customerData: CustomerData[] = [
    { id: 'C001', name: '京东物流', type: '电商物流', revenue: 850000, orders: 3200, status: 'active' },
    { id: 'C002', name: '顺丰速运', type: '快递物流', revenue: 720000, orders: 2800, status: 'active' },
    { id: 'C003', name: '美团外卖', type: '即时配送', revenue: 650000, orders: 4500, status: 'active' },
    { id: 'C004', name: '应急管理局', type: '政府机构', revenue: 420000, orders: 800, status: 'active' },
    { id: 'C005', name: '国家电网', type: '基础设施', revenue: 380000, orders: 600, status: 'pending' }
  ];

  // 性能指标
  const performanceMetrics: PerformanceMetric[] = [
    { metric: '任务成功率', current: 98.5, target: 99.0, trend: 'up' },
    { metric: '平均响应时间', current: 2.3, target: 2.0, trend: 'down' },
    { metric: '客户满意度', current: 4.8, target: 4.9, trend: 'up' },
    { metric: '设备利用率', current: 87.2, target: 90.0, trend: 'up' },
    { metric: '运营成本效率', current: 92.1, target: 95.0, trend: 'stable' }
  ];

  const customerColumns = [
    {
      title: '客户名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: CustomerData) => (
        <div>
          <Avatar style={{ backgroundColor: '#1890ff', marginRight: 8 }}>
            {text.charAt(0)}
          </Avatar>
          {text}
        </div>
      )
    },
    {
      title: '业务类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === '电商物流' ? 'blue' : type === '政府机构' ? 'green' : 'orange'}>
          {type}
        </Tag>
      )
    },
    {
      title: '月收入',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue: number) => `¥${(revenue / 10000).toFixed(1)}万`,
      sorter: (a: CustomerData, b: CustomerData) => a.revenue - b.revenue
    },
    {
      title: '订单数',
      dataIndex: 'orders',
      key: 'orders',
      sorter: (a: CustomerData, b: CustomerData) => a.orders - b.orders
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge 
          status={status === 'active' ? 'success' : 'processing'} 
          text={status === 'active' ? '活跃' : '待激活'} 
        />
      )
    }
  ];

  const revenueConfig = {
    data: revenueData,
    xField: 'month',
    yField: 'revenue',
    seriesField: 'type',
    smooth: true,
    color: ['#1890ff', '#52c41a'],
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
  };

  const distributionConfig = {
    appendPadding: 10,
    data: businessDistribution,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  return (
    <div style={{ padding: '24px', background: 'linear-gradient(135deg, #0c1426 0%, #1a2332 100%)', minHeight: '100vh' }}>
      {/* 顶部统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card className="glass-panel" style={{ textAlign: 'center' }}>
            <Statistic
              title={<span style={{ color: '#8c8c8c' }}>总收入</span>}
              value={businessData.revenue}
              precision={0}
              valueStyle={{ color: '#52c41a', fontSize: '24px' }}
              prefix={<DollarOutlined />}
              suffix="元"
            />
            <div style={{ marginTop: '8px' }}>
              <Tag color="green">+{businessData.growth.toFixed(1)}%</Tag>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="glass-panel" style={{ textAlign: 'center' }}>
            <Statistic
              title={<span style={{ color: '#8c8c8c' }}>总订单</span>}
              value={businessData.orders}
              valueStyle={{ color: '#1890ff', fontSize: '24px' }}
              prefix={<FileTextOutlined />}
            />
            <div style={{ marginTop: '8px' }}>
              <Tag color="blue">本月</Tag>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="glass-panel" style={{ textAlign: 'center' }}>
            <Statistic
              title={<span style={{ color: '#8c8c8c' }}>活跃客户</span>}
              value={businessData.customers}
              valueStyle={{ color: '#faad14', fontSize: '24px' }}
              prefix={<TeamOutlined />}
            />
            <div style={{ marginTop: '8px' }}>
              <Tag color="orange">+12</Tag>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="glass-panel" style={{ textAlign: 'center' }}>
            <Statistic
              title={<span style={{ color: '#8c8c8c' }}>运营效率</span>}
              value={businessData.efficiency}
              precision={1}
              valueStyle={{ color: '#722ed1', fontSize: '24px' }}
              prefix={<TrophyOutlined />}
              suffix="%"
            />
            <div style={{ marginTop: '8px' }}>
              <Tag color="purple">优秀</Tag>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 主要内容区域 */}
      <Row gutter={[16, 16]}>
        {/* 左侧图表区域 */}
        <Col span={16}>
          <Card className="glass-panel" title={
            <span style={{ color: 'white' }}>
              <BarChartOutlined style={{ marginRight: '8px' }} />
              收入趋势分析
            </span>
          }>
            <div style={{ height: '300px' }}>
              <Line {...revenueConfig} />
            </div>
          </Card>

          <Card 
            className="glass-panel" 
            title={
              <span style={{ color: 'white' }}>
                <TeamOutlined style={{ marginRight: '8px' }} />
                客户管理
              </span>
            }
            style={{ marginTop: '16px' }}
          >
            <Table
              columns={customerColumns}
              dataSource={customerData}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </Card>
        </Col>

        {/* 右侧信息面板 */}
        <Col span={8}>
          <Card className="glass-panel" title={
            <span style={{ color: 'white' }}>
              <RocketOutlined style={{ marginRight: '8px' }} />
              业务分布
            </span>
          }>
            <div style={{ height: '200px' }}>
              <Pie {...distributionConfig} />
            </div>
          </Card>

          <Card 
            className="glass-panel" 
            title={
              <span style={{ color: 'white' }}>
                <TrophyOutlined style={{ marginRight: '8px' }} />
                性能指标
              </span>
            }
            style={{ marginTop: '16px' }}
          >
            <List
              size="small"
              dataSource={performanceMetrics}
              renderItem={(item) => (
                <List.Item>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#fff', fontSize: '12px' }}>{item.metric}</span>
                      <span style={{ color: item.trend === 'up' ? '#52c41a' : item.trend === 'down' ? '#f5222d' : '#faad14' }}>
                        {item.current}{item.metric.includes('时间') ? 's' : item.metric.includes('率') ? '%' : ''}
                      </span>
                    </div>
                    <Progress
                      percent={(item.current / item.target) * 100}
                      size="small"
                      strokeColor={item.trend === 'up' ? '#52c41a' : item.trend === 'down' ? '#f5222d' : '#faad14'}
                      showInfo={false}
                    />
                  </div>
                </List.Item>
              )}
            />
          </Card>

          <Card 
            className="glass-panel" 
            title={
              <span style={{ color: 'white' }}>
                <BellOutlined style={{ marginRight: '8px' }} />
                系统通知
              </span>
            }
            style={{ marginTop: '16px' }}
          >
            <Timeline>
              <Timeline.Item color="green">
                <div style={{ color: '#fff', fontSize: '12px' }}>
                  <div>新客户&ldquo;阿里巴巴&rdquo;签约成功</div>
                  <div style={{ color: '#8c8c8c' }}>2分钟前</div>
                </div>
              </Timeline.Item>
              <Timeline.Item color="blue">
                <div style={{ color: '#fff', fontSize: '12px' }}>
                  <div>月度收入目标达成105%</div>
                  <div style={{ color: '#8c8c8c' }}>1小时前</div>
                </div>
              </Timeline.Item>
              <Timeline.Item color="orange">
                <div style={{ color: '#fff', fontSize: '12px' }}>
                  <div>系统维护计划已安排</div>
                  <div style={{ color: '#8c8c8c' }}>3小时前</div>
                </div>
              </Timeline.Item>
              <Timeline.Item color="red">
                <div style={{ color: '#fff', fontSize: '12px' }}>
                  <div>设备UAV-015需要维护</div>
                  <div style={{ color: '#8c8c8c' }}>6小时前</div>
                </div>
              </Timeline.Item>
            </Timeline>
          </Card>
        </Col>
      </Row>

      {/* 底部操作区域 */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: 'white', marginRight: '16px' }}>数据报告周期：</span>
                <Select 
                  value={selectedPeriod} 
                  onChange={setSelectedPeriod}
                  style={{ width: 120, marginRight: '16px' }}
                >
                  <Option value="day">日报</Option>
                  <Option value="week">周报</Option>
                  <Option value="month">月报</Option>
                  <Option value="quarter">季报</Option>
                </Select>
                <RangePicker style={{ marginRight: '16px' }} />
              </div>
              <div>
                <Button 
                  type="primary" 
                  icon={<FileTextOutlined />} 
                  style={{ marginRight: '8px' }}
                  loading={loading}
                  onClick={handleExportReport}
                >
                  {loading ? '导出中...' : '导出报告'}
                </Button>
                <Button icon={<SettingOutlined />}>
                  系统设置
                </Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BusinessManagementPlatform;