'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Tabs, Button, Space, Badge, Statistic, Alert } from 'antd';
import { 
  DashboardOutlined, 
  ThunderboltOutlined, 
  EnvironmentOutlined,
  SettingOutlined,
  FullscreenOutlined,
  CompressOutlined,
  WifiOutlined,
  DisconnectOutlined,
  TeamOutlined,
  BarChartOutlined,
  ToolOutlined,
  ApiOutlined
} from '@ant-design/icons';
import { OptimizedRiskAssessmentPanel } from './OptimizedRiskAssessmentPanel';
import { IntegratedDroneVisualization } from './3D/IntegratedDroneVisualization';
import { PathPlanningPanel } from './PathPlanningPanel';
import { PathPlanningVisualization3D } from './3D/PathPlanningVisualization3D';
import WeatherDataPanel from './WeatherDataPanel';
import AirspaceDataPanel from './AirspaceDataPanel';
import DroneGroupManagement from './DroneGroupManagement';
import DroneFormationVisualization3D from './3D/DroneFormationVisualization3D';
import HistoricalDataAnalytics from './HistoricalDataAnalytics';
import PredictiveMaintenancePanel from './PredictiveMaintenancePanel';
import RealDataIntegrationPanel from './RealDataIntegrationPanel';
import { useWebSocket } from '../hooks/useWebSocket';

const { Header, Content, Sider } = Layout;
const { TabPane } = Tabs;

interface SystemStatus {
  totalDrones: number;
  activeDrones: number;
  warningDrones: number;
  emergencyDrones: number;
  overallRisk: number;
  systemHealth: number;
  lastUpdate: Date;
}

export const SkyBrainMainDashboard: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    totalDrones: 5,
    activeDrones: 3,
    warningDrones: 1,
    emergencyDrones: 1,
    overallRisk: 0.35,
    systemHealth: 92,
    lastUpdate: new Date()
  });

  // WebSocket连接状态
  const { isConnected, connectionAttempts } = useWebSocket({
    onMessage: (message) => {
      if (message.type === 'system_status') {
        setSystemStatus(message.data);
      }
    }
  });

  // 全屏切换
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // 处理紧急响应
  const handleEmergencyResponse = () => {
    console.log('🚨 启动紧急响应程序');
    // 模拟紧急处理
    setSystemStatus(prev => ({
      ...prev,
      emergencyDrones: 0,
      warningDrones: Math.max(0, prev.warningDrones - 1)
    }));
    
    // 显示处理结果
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 9999;
      background: #52c41a; color: white; padding: 12px 20px;
      border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-size: 14px; font-weight: bold;
    `;
    notification.textContent = '✅ 紧急情况已处理，无人机已安全返航';
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
  };

  // 处理风险优化
  const handleRiskOptimization = () => {
    console.log('🎯 启动风险优化建议');
    const suggestions = [
      '建议调整飞行高度至120-150米',
      '当前风速较大，建议降低飞行速度',
      '检测到人群聚集，建议绕行',
      '电池电量偏低，建议就近降落充电'
    ];
    
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 9999;
      background: #1890ff; color: white; padding: 12px 20px;
      border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-size: 14px; max-width: 300px;
    `;
    notification.textContent = `💡 优化建议: ${randomSuggestion}`;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 4000);
  };

  // 处理视角重置
  const handleViewReset = () => {
    console.log('🎮 重置3D视角');
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 9999;
      background: #52c41a; color: white; padding: 12px 20px;
      border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-size: 14px;
    `;
    notification.textContent = '🎯 视角已重置到默认位置';
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 2000);
  };

  // 处理快速路径规划
  const handleQuickPlanning = () => {
    console.log('🛣️ 启动快速路径规划');
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 9999;
      background: #722ed1; color: white; padding: 12px 20px;
      border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-size: 14px;
    `;
    notification.textContent = '🚀 正在生成最优路径，请稍候...';
    document.body.appendChild(notification);
    
    // 模拟规划过程
    setTimeout(() => {
      notification.textContent = '✅ 路径规划完成！总距离: 2.3km, 预计时间: 8分钟';
      setTimeout(() => document.body.removeChild(notification), 3000);
    }, 2000);
  };

  // 模拟数据更新
  useEffect(() => {
    if (!isConnected) {
      const interval = setInterval(() => {
        setSystemStatus(prev => ({
          ...prev,
          overallRisk: Math.max(0, Math.min(1, prev.overallRisk + (Math.random() - 0.5) * 0.1)),
          systemHealth: Math.max(70, Math.min(100, prev.systemHealth + (Math.random() - 0.5) * 5)),
          lastUpdate: new Date()
        }));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isConnected]);

  // 获取风险等级样式
  const getRiskStyle = (risk: number) => {
    if (risk >= 0.7) return { color: '#FF4D4F', text: '高风险' };
    if (risk >= 0.4) return { color: '#FAAD14', text: '中风险' };
    if (risk >= 0.2) return { color: '#1890FF', text: '低风险' };
    return { color: '#52C41A', text: '安全' };
  };

  const riskStyle = getRiskStyle(systemStatus.overallRisk);

  return (
    <Layout style={{ height: '100vh', background: '#0a0e1a' }}>
      {/* 顶部导航栏 */}
      <Header style={{ 
        background: 'rgba(0, 0, 0, 0.8)', 
        padding: '0 24px',
        borderBottom: '1px solid rgba(24, 144, 255, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          height: '100%'
        }}>
          {/* Logo和标题 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              background: 'linear-gradient(45deg, #1890FF, #00FF88)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 20px rgba(24, 144, 255, 0.5)'
            }}>
              🧠 SkyBrain
            </div>
            <Badge 
              status={isConnected ? 'processing' : 'error'} 
              text={
                <span style={{ color: 'white', fontSize: '12px' }}>
                  {isConnected ? '实时连接' : `离线模式 (重试: ${connectionAttempts})`}
                </span>
              } 
            />
          </div>

          {/* 系统状态 */}
          <Space size="large">
            <Statistic
              title="系统健康度"
              value={systemStatus.systemHealth}
              suffix="%"
              valueStyle={{ 
                color: systemStatus.systemHealth > 80 ? '#52C41A' : '#FAAD14',
                fontSize: '16px'
              }}
            />
            <Statistic
              title="总体风险"
              value={Math.round(systemStatus.overallRisk * 100)}
              suffix="%"
              valueStyle={{ 
                color: riskStyle.color,
                fontSize: '16px'
              }}
            />
            <Statistic
              title="活跃无人机"
              value={`${systemStatus.activeDrones}/${systemStatus.totalDrones}`}
              valueStyle={{ 
                color: '#1890FF',
                fontSize: '16px'
              }}
            />
          </Space>

          {/* 控制按钮 */}
          <Space>
            <Button 
              icon={isFullscreen ? <CompressOutlined /> : <FullscreenOutlined />}
              onClick={toggleFullscreen}
              style={{ border: 'none', background: 'transparent', color: 'white' }}
            >
              {isFullscreen ? '退出全屏' : '全屏'}
            </Button>
          </Space>
        </div>
      </Header>

      <Layout>
        {/* 侧边栏 */}
        <Sider 
          collapsible 
          collapsed={siderCollapsed} 
          onCollapse={setSiderCollapsed}
          style={{ 
            background: 'rgba(0, 0, 0, 0.6)',
            borderRight: '1px solid rgba(24, 144, 255, 0.3)',
            backdropFilter: 'blur(10px)'
          }}
          width={200}
        >
          <div style={{ padding: '16px 0' }}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              tabPosition="left"
              style={{ height: '100%' }}
              items={[
                {
                  key: 'dashboard',
                  label: (
                    <span style={{ color: 'white', fontSize: '12px' }}>
                      <DashboardOutlined /> 总览
                    </span>
                  )
                },
                {
                  key: 'risk',
                  label: (
                    <span style={{ color: 'white', fontSize: '12px' }}>
                      <ThunderboltOutlined /> 风险评估
                    </span>
                  )
                },
                {
                  key: '3d',
                  label: (
                    <span style={{ color: 'white', fontSize: '12px' }}>
                      <EnvironmentOutlined /> 3D可视化
                    </span>
                  )
                },
                {
                  key: 'pathplanning',
                  label: (
                    <span style={{ color: 'white', fontSize: '12px' }}>
                      <EnvironmentOutlined /> 路径规划
                    </span>
                  )
                },
                {
                  key: 'weather',
                  label: (
                    <span style={{ color: 'white', fontSize: '12px' }}>
                      🌤️ 气象数据
                    </span>
                  )
                },
                {
                  key: 'airspace',
                  label: (
                    <span style={{ color: 'white', fontSize: '12px' }}>
                      🛩️ 空域管制
                    </span>
                  )
                },
                {
                  key: 'group',
                  label: (
                    <span style={{ color: 'white', fontSize: '12px' }}>
                      <TeamOutlined /> 群组管理
                    </span>
                  )
                },
                {
                  key: 'analytics',
                  label: (
                    <span style={{ color: 'white', fontSize: '12px' }}>
                      <BarChartOutlined /> 数据分析
                    </span>
                  )
                },
                {
                  key: 'maintenance',
                  label: (
                    <span style={{ color: 'white', fontSize: '12px' }}>
                      <ToolOutlined /> 预测维护
                    </span>
                  )
                },
                {
                  key: 'realdata',
                  label: (
                    <span style={{ color: 'white', fontSize: '12px' }}>
                      <ApiOutlined /> 真实数据
                    </span>
                  )
                },
                {
                  key: 'settings',
                  label: (
                    <span style={{ color: 'white', fontSize: '12px' }}>
                      <SettingOutlined /> 设置
                    </span>
                  )
                }
              ]}
            />
          </div>
        </Sider>

        {/* 主内容区 */}
        <Layout style={{ padding: '16px', background: 'transparent' }}>
          <Content style={{ 
            background: 'transparent',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            {/* 动态页面提示 - 根据不同标签页显示不同内容 */}
            {activeTab === 'dashboard' && systemStatus.emergencyDrones > 0 && (
              <Alert
                message="系统总览警报"
                description={`检测到 ${systemStatus.emergencyDrones} 架无人机处于紧急状态，${systemStatus.warningDrones} 架需要关注`}
                type="error"
                showIcon
                closable
                style={{ marginBottom: '16px' }}
                action={
                  <Button size="small" danger onClick={handleEmergencyResponse}>
                    紧急响应
                  </Button>
                }
              />
            )}

            {activeTab === 'risk' && (
              <Alert
                message="风险评估模式"
                description="当前正在进行实时风险分析，建议关注高风险区域和异常数据变化"
                type="info"
                showIcon
                closable
                style={{ marginBottom: '16px' }}
                action={
                  <Button size="small" type="primary" onClick={handleRiskOptimization}>
                    优化建议
                  </Button>
                }
              />
            )}

            {activeTab === '3d' && (
              <Alert
                message="3D可视化模式"
                description="使用鼠标拖拽旋转视角，滚轮缩放，双击重置视角。支持多视角切换观察"
                type="success"
                showIcon
                closable
                style={{ marginBottom: '16px' }}
                action={
                  <Button size="small" onClick={handleViewReset}>
                    重置视角
                  </Button>
                }
              />
            )}

            {activeTab === 'pathplanning' && (
              <Alert
                message="智能路径规划模式"
                description="设置起终点坐标，选择飞行模式，系统将自动计算最优路径并进行风险评估"
                type="warning"
                showIcon
                closable
                style={{ marginBottom: '16px' }}
                action={
                  <Button size="small" type="primary" onClick={handleQuickPlanning}>
                    快速规划
                  </Button>
                }
              />
            )}

            {/* 主要内容 */}
            {activeTab === 'dashboard' && (
              <Row gutter={[16, 16]} style={{ height: '100%' }}>
                <Col span={16}>
                  <Card 
                    title="3D 实时监控" 
                    style={{ 
                      height: '100%',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(24, 144, 255, 0.3)'
                    }}
                    bodyStyle={{ padding: 0, height: 'calc(100% - 57px)' }}
                  >
                    <IntegratedDroneVisualization />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card 
                    title="风险评估" 
                    style={{ 
                      height: '100%',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(24, 144, 255, 0.3)'
                    }}
                    bodyStyle={{ padding: 0, height: 'calc(100% - 57px)' }}
                  >
                    <OptimizedRiskAssessmentPanel 
                      onRiskUpdate={(riskData) => {
                        setSystemStatus(prev => ({
                          ...prev,
                          overallRisk: riskData.overallRisk,
                          lastUpdate: new Date()
                        }));
                      }}
                    />
                  </Card>
                </Col>
              </Row>
            )}

            {activeTab === 'risk' && (
              <Card 
                title="详细风险评估" 
                style={{ 
                  height: '100%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(24, 144, 255, 0.3)'
                }}
                bodyStyle={{ padding: 0, height: 'calc(100% - 57px)' }}
              >
                <OptimizedRiskAssessmentPanel />
              </Card>
            )}

            {activeTab === '3d' && (
              <Card 
                title="3D 飞行可视化" 
                style={{ 
                  height: '100%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(24, 144, 255, 0.3)'
                }}
                bodyStyle={{ padding: 0, height: 'calc(100% - 57px)' }}
              >
                <IntegratedDroneVisualization />
              </Card>
            )}

            {activeTab === 'pathplanning' && (
              <Row gutter={[16, 16]} style={{ height: '100%' }}>
                <Col span={8}>
                  <Card 
                    title="路径规划控制" 
                    style={{ 
                      height: '100%',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(24, 144, 255, 0.3)'
                    }}
                    bodyStyle={{ padding: 0, height: 'calc(100% - 57px)' }}
                  >
                    <PathPlanningPanel />
                  </Card>
                </Col>
                <Col span={16}>
                  <Card 
                    title="3D 路径可视化" 
                    style={{ 
                      height: '100%',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(24, 144, 255, 0.3)'
                    }}
                    bodyStyle={{ padding: 0, height: 'calc(100% - 57px)' }}
                  >
                    <PathPlanningVisualization3D />
                  </Card>
                </Col>
              </Row>
            )}

            {activeTab === 'weather' && (
              <Card 
                title="🌤️ 实时气象数据" 
                style={{ 
                  height: '100%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(24, 144, 255, 0.3)'
                }}
                bodyStyle={{ padding: 16, height: 'calc(100% - 57px)', overflow: 'auto' }}
              >
                <WeatherDataPanel />
              </Card>
            )}

            {activeTab === 'airspace' && (
              <Card 
                title="🛩️ 空域管制信息" 
                style={{ 
                  height: '100%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(24, 144, 255, 0.3)'
                }}
                bodyStyle={{ padding: 16, height: 'calc(100% - 57px)', overflow: 'auto' }}
              >
                <AirspaceDataPanel />
              </Card>
            )}

            {activeTab === 'group' && (
              <Row gutter={[16, 16]} style={{ height: '100%' }}>
                <Col span={14}>
                  <Card 
                    title="🤖 无人机群组管理" 
                    style={{ 
                      height: '100%',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(24, 144, 255, 0.3)'
                    }}
                    bodyStyle={{ padding: 16, height: 'calc(100% - 57px)', overflow: 'auto' }}
                  >
                    <DroneGroupManagement />
                  </Card>
                </Col>
                <Col span={10}>
                  <Card 
                    title="🎯 3D 编队可视化" 
                    style={{ 
                      height: '100%',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(24, 144, 255, 0.3)'
                    }}
                    bodyStyle={{ padding: 0, height: 'calc(100% - 57px)' }}
                  >
                    <DroneFormationVisualization3D />
                  </Card>
                </Col>
              </Row>
            )}

            {activeTab === 'analytics' && (
              <Card 
                title="📊 历史数据分析" 
                style={{ 
                  height: '100%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(24, 144, 255, 0.3)'
                }}
                bodyStyle={{ padding: 16, height: 'calc(100% - 57px)', overflow: 'hidden' }}
              >
                <HistoricalDataAnalytics />
              </Card>
            )}

            {activeTab === 'maintenance' && (
              <Card 
                title="🔧 预测性维护" 
                style={{ 
                  height: '100%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(24, 144, 255, 0.3)'
                }}
                bodyStyle={{ padding: 16, height: 'calc(100% - 57px)', overflow: 'hidden' }}
              >
                <PredictiveMaintenancePanel />
              </Card>
            )}

            {activeTab === 'realdata' && (
              <Card 
                title="📡 真实数据集成" 
                style={{ 
                  height: '100%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(24, 144, 255, 0.3)'
                }}
                bodyStyle={{ padding: 16, height: 'calc(100% - 57px)', overflow: 'hidden' }}
              >
                <RealDataIntegrationPanel />
              </Card>
            )}

            {activeTab === 'settings' && (
              <Card 
                title="系统设置" 
                style={{ 
                  height: '100%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(24, 144, 255, 0.3)'
                }}
              >
                <div style={{ padding: '24px', color: 'white' }}>
                  <h3>WebSocket 配置</h3>
                  <p>连接状态: {isConnected ? '已连接' : '未连接'}</p>
                  <p>重试次数: {connectionAttempts}</p>
                  
                  <h3>系统信息</h3>
                  <p>版本: v1.0.0</p>
                  <p>最后更新: {systemStatus.lastUpdate.toLocaleString()}</p>
                  
                  <h3>部署信息</h3>
                  <p>环境: {process.env.NODE_ENV}</p>
                  <p>平台: SkyBrain 智能无人机管理平台</p>
                </div>
              </Card>
            )}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};