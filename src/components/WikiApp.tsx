'use client';

import React, { useState, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import LoginPage from './LoginPage';
import WikiLayout from './WikiLayout';
import WikiDashboard from './WikiDashboard';
import BusinessManagementPlatform from './BusinessManagementPlatform';
import { Card, Typography, Space, Tag, Timeline, Statistic, Row, Col } from 'antd';
import {
  BookOutlined,
  TeamOutlined,
  SettingOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  BarChartOutlined,
  UserOutlined,
  FileTextOutlined,
  BulbOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface UserInfo {
  username: string;
  role: string;
}

const WikiApp: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  // 检查本地存储中的登录状态
  useEffect(() => {
    const savedUserInfo = localStorage.getItem('skybrainUserInfo');
    if (savedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(savedUserInfo);
        setUserInfo(parsedUserInfo);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('解析用户信息失败:', error);
        localStorage.removeItem('skybrainUserInfo');
      }
    }
  }, []);

  const handleLogin = (loginUserInfo: UserInfo) => {
    setUserInfo(loginUserInfo);
    setIsLoggedIn(true);
    localStorage.setItem('skybrainUserInfo', JSON.stringify(loginUserInfo));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserInfo(null);
    setCurrentPage('dashboard');
    localStorage.removeItem('skybrainUserInfo');
  };

  const renderPageContent = () => {
    if (!userInfo) return null;

    switch (currentPage) {
      case 'dashboard':
        return <WikiDashboard userInfo={userInfo} />;
      
      case 'drone-management':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Title level={2}>无人机管理</Title>
              <Tag color="blue">实时监控</Tag>
            </div>
            <BusinessManagementPlatform />
          </div>
        );
      
      case 'risk-assessment':
        return (
          <Card>
            <Title level={2}>风险评估系统</Title>
            <Paragraph>
              智能风险评估系统提供实时风险监控、预测分析和应急响应功能。
            </Paragraph>
            <Row gutter={[16, 16]} className="mt-6">
              <Col span={8}>
                <Statistic
                  title="当前风险等级"
                  value="中等"
                  valueStyle={{ color: '#fa8c16' }}
                  prefix={<SafetyCertificateOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="风险事件"
                  value={3}
                  valueStyle={{ color: '#ff4d4f' }}
                  suffix="个"
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="处理中"
                  value={1}
                  valueStyle={{ color: '#1890ff' }}
                  suffix="个"
                />
              </Col>
            </Row>
          </Card>
        );
      
      case 'data-analytics':
        return (
          <Card>
            <Title level={2}>数据分析</Title>
            <Paragraph>
              综合数据分析平台，提供飞行数据、性能指标、趋势分析等功能。
            </Paragraph>
            <Timeline className="mt-6">
              <Timeline.Item color="green">
                <Text strong>数据收集</Text>
                <br />
                <Text type="secondary">实时收集无人机飞行数据</Text>
              </Timeline.Item>
              <Timeline.Item color="blue">
                <Text strong>数据处理</Text>
                <br />
                <Text type="secondary">智能算法处理和分析数据</Text>
              </Timeline.Item>
              <Timeline.Item color="red">
                <Text strong>报告生成</Text>
                <br />
                <Text type="secondary">自动生成分析报告和建议</Text>
              </Timeline.Item>
            </Timeline>
          </Card>
        );
      
      case 'knowledge-base':
        return (
          <div className="space-y-6">
            <Card>
              <Title level={2}>知识库</Title>
              <Paragraph>
                SkyBrain 知识库包含操作手册、最佳实践、故障排除指南等丰富内容。
              </Paragraph>
              
              <Row gutter={[16, 16]} className="mt-6">
                <Col xs={24} sm={12} md={8}>
                  <Card size="small" className="text-center hover:shadow-md transition-shadow">
                    <RobotOutlined className="text-3xl text-blue-500 mb-2" />
                    <Title level={4}>操作手册</Title>
                    <Text type="secondary">156 篇文档</Text>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card size="small" className="text-center hover:shadow-md transition-shadow">
                    <SafetyCertificateOutlined className="text-3xl text-red-500 mb-2" />
                    <Title level={4}>安全指南</Title>
                    <Text type="secondary">89 篇文档</Text>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card size="small" className="text-center hover:shadow-md transition-shadow">
                    <BulbOutlined className="text-3xl text-green-500 mb-2" />
                    <Title level={4}>最佳实践</Title>
                    <Text type="secondary">234 篇文档</Text>
                  </Card>
                </Col>
              </Row>
            </Card>
          </div>
        );
      
      case 'team-collaboration':
        return (
          <Card>
            <Title level={2}>团队协作</Title>
            <Paragraph>
              团队协作平台支持实时沟通、任务分配、进度跟踪等功能。
            </Paragraph>
            <Space direction="vertical" className="w-full mt-6">
              <Card size="small">
                <Space>
                  <TeamOutlined className="text-blue-500" />
                  <div>
                    <Text strong>在线成员</Text>
                    <br />
                    <Text type="secondary">当前有 12 名成员在线</Text>
                  </div>
                </Space>
              </Card>
              <Card size="small">
                <Space>
                  <FileTextOutlined className="text-green-500" />
                  <div>
                    <Text strong>待办任务</Text>
                    <br />
                    <Text type="secondary">您有 3 个待完成任务</Text>
                  </div>
                </Space>
              </Card>
            </Space>
          </Card>
        );
      
      case 'system-settings':
        return (
          <Card>
            <Title level={2}>系统设置</Title>
            <Paragraph>
              系统配置和管理功能，包括用户管理、权限设置、系统参数等。
            </Paragraph>
            {userInfo.role === '系统管理员' ? (
              <div className="mt-6">
                <Text strong className="text-green-600">✓ 您拥有系统管理员权限</Text>
                <div className="mt-4 space-y-2">
                  <div>• 用户账户管理</div>
                  <div>• 系统参数配置</div>
                  <div>• 数据备份与恢复</div>
                  <div>• 安全策略设置</div>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <Text type="secondary">您当前的角色是 {userInfo.role}，权限有限。</Text>
              </div>
            )}
          </Card>
        );
      
      default:
        return <WikiDashboard userInfo={userInfo} />;
    }
  };

  if (!isLoggedIn) {
    return (
      <ConfigProvider locale={zhCN}>
        <LoginPage onLogin={handleLogin} />
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider locale={zhCN}>
      <WikiLayout
        userInfo={userInfo!}
        onLogout={handleLogout}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      >
        {renderPageContent()}
      </WikiLayout>
    </ConfigProvider>
  );
};

export default WikiApp;