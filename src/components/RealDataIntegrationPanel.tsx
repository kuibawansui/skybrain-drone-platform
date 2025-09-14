'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Switch, 
  Button, 
  Space, 
  Statistic, 
  Alert, 
  Badge, 
  Progress,
  Table,
  Tag,
  Tooltip,
  Divider,
  Input,
  Form,
  Select,
  Modal,
  notification
} from 'antd';
import {
  ApiOutlined,
  CloudOutlined,
  RadarChartOutlined,
  SettingOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
  EnvironmentOutlined,
  WifiOutlined,
  DisconnectOutlined
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useRealData } from '../hooks/useRealData';

const { Option } = Select;

interface DataSourceConfig {
  id: string;
  name: string;
  type: 'drone' | 'weather' | 'airspace';
  endpoint: string;
  apiKey: string;
  enabled: boolean;
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  lastUpdate: Date | null;
  dataCount: number;
}

export const RealDataIntegrationPanel: React.FC = () => {
  const [enableRealData, setEnableRealData] = useState(false);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [form] = Form.useForm();

  // 使用真实数据Hook
  const {
    drones,
    weather,
    airspace,
    isConnected,
    loading,
    error,
    stats,
    riskAssessment,
    dataSource,
    lastUpdate,
    refreshData,
    clearError
  } = useRealData({
    enableDroneData: enableRealData,
    enableWeatherData: enableRealData,
    enableAirspaceData: enableRealData,
    location: { latitude: 39.9042, longitude: 116.4074 },
    updateInterval: 5000,
    onDataUpdate: (data) => {
      console.log('📊 数据更新:', data);
    },
    onError: (err) => {
      notification.error({
        message: '数据获取失败',
        description: err.message,
        duration: 4
      });
    }
  });

  // 数据源配置
  const [dataSources, setDataSources] = useState<DataSourceConfig[]>([
    {
      id: 'drone_primary',
      name: '主要无人机数据源',
      type: 'drone',
      endpoint: 'wss://api.skybrain.com/ws/drones',
      apiKey: '',
      enabled: true,
      status: 'disconnected',
      lastUpdate: null,
      dataCount: 0
    },
    {
      id: 'weather_openweather',
      name: 'OpenWeatherMap',
      type: 'weather',
      endpoint: 'https://api.openweathermap.org/data/2.5',
      apiKey: '',
      enabled: true,
      status: 'disconnected',
      lastUpdate: null,
      dataCount: 0
    },
    {
      id: 'airspace_faa',
      name: 'FAA NOTAM数据',
      type: 'airspace',
      endpoint: 'https://api.faa.gov/notams',
      apiKey: '',
      enabled: true,
      status: 'disconnected',
      lastUpdate: null,
      dataCount: 0
    }
  ]);

  // 更新数据源状态
  useEffect(() => {
    setDataSources(prev => prev.map(source => ({
      ...source,
      status: isConnected ? 'connected' : 'disconnected',
      lastUpdate: lastUpdate,
      dataCount: source.type === 'drone' ? drones.length : 
                 source.type === 'weather' ? (weather ? 1 : 0) :
                 source.type === 'airspace' ? (airspace?.notams.length || 0) : 0
    })));
  }, [isConnected, lastUpdate, drones.length, weather, airspace]);

  // 生成连接状态图表数据
  const generateConnectionData = () => {
    const now = new Date();
    const data = [];
    
    for (let i = 29; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        connected: isConnected ? 1 : 0,
        dataRate: Math.random() * 100,
        latency: 50 + Math.random() * 100
      });
    }
    
    return data;
  };

  const connectionData = generateConnectionData();

  // 数据源状态分布
  const statusDistribution = [
    { name: '已连接', value: dataSources.filter(s => s.status === 'connected').length, color: '#52c41a' },
    { name: '未连接', value: dataSources.filter(s => s.status === 'disconnected').length, color: '#ff4d4f' },
    { name: '错误', value: dataSources.filter(s => s.status === 'error').length, color: '#faad14' }
  ];

  // 测试连接
  const testConnection = async (sourceId: string) => {
    setTestingConnection(true);
    const source = dataSources.find(s => s.id === sourceId);
    
    if (!source) return;

    try {
      // 模拟连接测试
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 随机成功/失败
      const success = Math.random() > 0.3;
      
      setDataSources(prev => prev.map(s => 
        s.id === sourceId 
          ? { ...s, status: success ? 'connected' : 'error' }
          : s
      ));

      notification[success ? 'success' : 'error']({
        message: success ? '连接测试成功' : '连接测试失败',
        description: success 
          ? `${source.name} 连接正常，数据传输稳定`
          : `${source.name} 连接失败，请检查配置`,
        duration: 3
      });
    } catch (error) {
      notification.error({
        message: '连接测试失败',
        description: '网络错误或配置问题',
        duration: 3
      });
    } finally {
      setTestingConnection(false);
    }
  };

  // 数据源表格列
  const dataSourceColumns = [
    {
      title: '数据源',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: DataSourceConfig) => (
        <Space>
          {record.type === 'drone' && <RadarChartOutlined style={{ color: '#1890ff' }} />}
          {record.type === 'weather' && <CloudOutlined style={{ color: '#52c41a' }} />}
          {record.type === 'airspace' && <EnvironmentOutlined style={{ color: '#722ed1' }} />}
          <span>{name}</span>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          connected: { color: 'success', icon: <CheckCircleOutlined />, text: '已连接' },
          disconnected: { color: 'default', icon: <DisconnectOutlined />, text: '未连接' },
          error: { color: 'error', icon: <CloseCircleOutlined />, text: '错误' },
          testing: { color: 'processing', icon: <WifiOutlined />, text: '测试中' }
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return (
          <Badge 
            status={config.color as any} 
            text={
              <Space>
                {config.icon}
                {config.text}
              </Space>
            } 
          />
        );
      },
    },
    {
      title: '数据量',
      dataIndex: 'dataCount',
      key: 'dataCount',
      render: (count: number) => (
        <Statistic 
          value={count} 
          valueStyle={{ fontSize: '14px' }}
          suffix="条"
        />
      ),
    },
    {
      title: '最后更新',
      dataIndex: 'lastUpdate',
      key: 'lastUpdate',
      render: (date: Date | null) => (
        date ? (
          <Tooltip title={date.toLocaleString('zh-CN')}>
            <span>{Math.round((Date.now() - date.getTime()) / 1000)}秒前</span>
          </Tooltip>
        ) : (
          <span style={{ color: '#999' }}>从未更新</span>
        )
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: DataSourceConfig) => (
        <Space>
          <Button 
            size="small" 
            icon={<ApiOutlined />}
            loading={testingConnection}
            onClick={() => testConnection(record.id)}
          >
            测试
          </Button>
          <Button 
            size="small" 
            icon={<SettingOutlined />}
            onClick={() => {
              form.setFieldsValue(record);
              setConfigModalVisible(true);
            }}
          >
            配置
          </Button>
        </Space>
      ),
    }
  ];

  // 保存配置
  const saveConfiguration = async (values: any) => {
    try {
      setDataSources(prev => prev.map(source => 
        source.id === values.id ? { ...source, ...values } : source
      ));
      
      notification.success({
        message: '配置保存成功',
        description: '数据源配置已更新',
        duration: 2
      });
      
      setConfigModalVisible(false);
    } catch (error) {
      notification.error({
        message: '配置保存失败',
        description: '请检查配置信息',
        duration: 3
      });
    }
  };

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
              <ApiOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
              <span style={{ color: 'white', fontWeight: 'bold' }}>真实数据集成</span>
              <Switch
                checked={enableRealData}
                onChange={setEnableRealData}
                checkedChildren="启用"
                unCheckedChildren="禁用"
              />
            </Space>
          </Col>
          <Col>
            <Badge 
              status={isConnected ? 'processing' : 'error'} 
              text={
                <span style={{ color: 'white' }}>
                  数据源: {dataSource === 'real' ? '真实数据' : 
                           dataSource === 'enhanced_simulation' ? '增强模拟' : '基础模拟'}
                </span>
              } 
            />
          </Col>
          <Col>
            <Space>
              <Button 
                size="small"
                icon={<ReloadOutlined />}
                onClick={refreshData}
                loading={loading}
              >
                刷新数据
              </Button>
              <Button 
                size="small"
                icon={<SettingOutlined />}
                onClick={() => setConfigModalVisible(true)}
              >
                数据源配置
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 错误提示 */}
      {error && (
        <Alert
          message="数据获取错误"
          description={error}
          type="error"
          showIcon
          closable
          onClose={clearError}
          style={{ marginBottom: '16px' }}
        />
      )}

      {/* 数据统计 */}
      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={6}>
          <Card size="small" style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(24, 144, 255, 0.3)' }}>
            <Statistic
              title="活跃无人机"
              value={stats.activeDrones}
              suffix={`/ ${stats.totalDrones}`}
              valueStyle={{ color: '#1890ff' }}
              prefix={<RadarChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(82, 196, 26, 0.3)' }}>
            <Statistic
              title="平均电量"
              value={stats.avgBattery}
              suffix="%"
              valueStyle={{ color: stats.avgBattery > 50 ? '#52c41a' : '#faad14' }}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(250, 173, 20, 0.3)' }}>
            <Statistic
              title="天气预警"
              value={stats.weatherAlerts}
              suffix="个"
              valueStyle={{ color: stats.weatherAlerts > 0 ? '#faad14' : '#52c41a' }}
              prefix={<CloudOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(114, 46, 209, 0.3)' }}>
            <Statistic
              title="空域限制"
              value={stats.airspaceRestrictions}
              suffix="个"
              valueStyle={{ color: stats.airspaceRestrictions > 0 ? '#722ed1' : '#52c41a' }}
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 风险评估 */}
      {riskAssessment.level > 0 && (
        <Alert
          message={`当前风险等级: ${Math.round(riskAssessment.level * 100)}%`}
          description={
            <div>
              <p><strong>建议:</strong> {riskAssessment.recommendation}</p>
              <p><strong>风险因素:</strong></p>
              <ul>
                {riskAssessment.factors.map((factor, index) => (
                  <li key={index}>{factor}</li>
                ))}
              </ul>
            </div>
          }
          type={riskAssessment.level > 0.7 ? 'error' : riskAssessment.level > 0.4 ? 'warning' : 'info'}
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      {/* 主要内容 */}
      <Row gutter={16} style={{ height: 'calc(100% - 200px)' }}>
        {/* 左侧：连接状态和图表 */}
        <Col span={14}>
          {/* 连接状态图表 */}
          <Card 
            title="📡 数据连接状态" 
            size="small"
            style={{ 
              height: '300px', 
              marginBottom: '16px',
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(24, 144, 255, 0.3)'
            }}
          >
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={connectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="#fff" />
                <YAxis stroke="#fff" />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid #1890ff',
                    borderRadius: '4px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="connected" 
                  stroke="#52c41a" 
                  strokeWidth={2}
                  name="连接状态"
                />
                <Line 
                  type="monotone" 
                  dataKey="dataRate" 
                  stroke="#1890ff" 
                  strokeWidth={2}
                  name="数据传输率"
                />
                <Line 
                  type="monotone" 
                  dataKey="latency" 
                  stroke="#faad14" 
                  strokeWidth={2}
                  name="延迟(ms)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* 数据源状态分布 */}
          <Card 
            title="📊 数据源状态分布" 
            size="small"
            style={{ 
              height: 'calc(100% - 316px)',
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(24, 144, 255, 0.3)'
            }}
          >
            <Row>
              <Col span={12}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {statusDistribution.map((entry, index) => (
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
              </Col>
              <Col span={12}>
                <div style={{ padding: '20px' }}>
                  <Space direction="vertical" size="middle">
                    <div>
                      <Badge status="success" text="已连接数据源" />
                      <div style={{ marginLeft: '24px', color: '#52c41a', fontSize: '18px', fontWeight: 'bold' }}>
                        {dataSources.filter(s => s.status === 'connected').length}
                      </div>
                    </div>
                    <div>
                      <Badge status="error" text="离线数据源" />
                      <div style={{ marginLeft: '24px', color: '#ff4d4f', fontSize: '18px', fontWeight: 'bold' }}>
                        {dataSources.filter(s => s.status === 'disconnected').length}
                      </div>
                    </div>
                    <div>
                      <Badge status="warning" text="错误数据源" />
                      <div style={{ marginLeft: '24px', color: '#faad14', fontSize: '18px', fontWeight: 'bold' }}>
                        {dataSources.filter(s => s.status === 'error').length}
                      </div>
                    </div>
                  </Space>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 右侧：数据源管理 */}
        <Col span={10}>
          <Card 
            title="🔧 数据源管理" 
            size="small"
            style={{ 
              height: '100%',
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(24, 144, 255, 0.3)'
            }}
            extra={
              <Button 
                size="small" 
                type="primary"
                icon={<SettingOutlined />}
                onClick={() => setConfigModalVisible(true)}
              >
                添加数据源
              </Button>
            }
          >
            <Table
              columns={dataSourceColumns}
              dataSource={dataSources}
              rowKey="id"
              size="small"
              scroll={{ y: 'calc(100vh - 300px)' }}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      {/* 配置模态框 */}
      <Modal
        title="数据源配置"
        open={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={saveConfiguration}
        >
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          
          <Form.Item
            label="数据源名称"
            name="name"
            rules={[{ required: true, message: '请输入数据源名称' }]}
          >
            <Input placeholder="输入数据源名称" />
          </Form.Item>

          <Form.Item
            label="数据源类型"
            name="type"
            rules={[{ required: true, message: '请选择数据源类型' }]}
          >
            <Select placeholder="选择数据源类型">
              <Option value="drone">无人机数据</Option>
              <Option value="weather">天气数据</Option>
              <Option value="airspace">空域数据</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="API端点"
            name="endpoint"
            rules={[{ required: true, message: '请输入API端点' }]}
          >
            <Input placeholder="https://api.example.com/data" />
          </Form.Item>

          <Form.Item
            label="API密钥"
            name="apiKey"
          >
            <Input.Password placeholder="输入API密钥（可选）" />
          </Form.Item>

          <Form.Item
            label="启用状态"
            name="enabled"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RealDataIntegrationPanel;