'use client';

import React from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Tag, Timeline, Progress, Avatar, List } from 'antd';
import {
  RobotOutlined,
  SafetyCertificateOutlined,
  BarChartOutlined,
  TeamOutlined,
  TrophyOutlined,
  BookOutlined,
  EyeOutlined,
  EditOutlined,
  UserOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import BusinessManagementPlatform from './BusinessManagementPlatform';

const { Title, Text, Paragraph } = Typography;

interface WikiDashboardProps {
  userInfo: { username: string; role: string };
}

const WikiDashboard: React.FC<WikiDashboardProps> = ({ userInfo }) => {
  const quickStats = [
    {
      title: '在线无人机',
      value: 24,
      suffix: '架',
      icon: <RobotOutlined className="text-blue-500" />,
      color: '#1890ff'
    },
    {
      title: '风险事件',
      value: 3,
      suffix: '个',
      icon: <SafetyCertificateOutlined className="text-red-500" />,
      color: '#ff4d4f'
    },
    {
      title: '知识条目',
      value: 1247,
      suffix: '条',
      icon: <BookOutlined className="text-green-500" />,
      color: '#52c41a'
    },
    {
      title: '团队成员',
      value: 18,
      suffix: '人',
      icon: <TeamOutlined className="text-purple-500" />,
      color: '#722ed1'
    }
  ];

  const recentActivities = [
    {
      time: '2分钟前',
      user: 'admin',
      action: '更新了无人机飞行路径规划文档',
      type: 'edit'
    },
    {
      time: '15分钟前',
      user: 'operator',
      action: '创建了新的风险评估报告',
      type: 'create'
    },
    {
      time: '1小时前',
      user: 'viewer',
      action: '查看了系统监控面板',
      type: 'view'
    },
    {
      time: '2小时前',
      user: 'admin',
      action: '修改了团队协作规则',
      type: 'edit'
    }
  ];

  const knowledgeCategories = [
    { name: '无人机操作手册', count: 156, progress: 85 },
    { name: '风险管理指南', count: 89, progress: 92 },
    { name: '系统维护文档', count: 234, progress: 78 },
    { name: '应急处理流程', count: 67, progress: 95 },
    { name: '培训教程', count: 123, progress: 88 }
  ];

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'edit': return <EditOutlined className="text-blue-500" />;
      case 'create': return <BookOutlined className="text-green-500" />;
      case 'view': return <EyeOutlined className="text-gray-500" />;
      default: return <ClockCircleOutlined className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 欢迎区域 */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
        <div className="flex items-center justify-between">
          <div>
            <Title level={2} className="mb-2">
              欢迎回来，{userInfo.username}！
            </Title>
            <Paragraph className="text-gray-600 mb-4">
              您当前的角色是 <Tag color="blue">{userInfo.role}</Tag>，
              今天是 {new Date().toLocaleDateString('zh-CN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}
            </Paragraph>
            <Space>
              <Tag icon={<TrophyOutlined />} color="gold">
                本月贡献排行 #3
              </Tag>
              <Tag icon={<BookOutlined />} color="green">
                已完成 12 个知识条目
              </Tag>
            </Space>
          </div>
          <div className="hidden md:block">
            <Avatar size={80} icon={<UserOutlined />} className="bg-gradient-to-r from-blue-500 to-purple-600" />
          </div>
        </div>
      </Card>

      {/* 快速统计 */}
      <Row gutter={[16, 16]}>
        {quickStats.map((stat, index) => (
          <Col xs={12} sm={12} md={6} key={index}>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <div className="mb-3">
                <div 
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-2"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  {stat.icon}
                </div>
              </div>
              <Statistic
                title={stat.title}
                value={stat.value}
                suffix={stat.suffix}
                valueStyle={{ color: stat.color, fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* 知识库分类 */}
        <Col xs={24} lg={12}>
          <Card title="知识库分类" className="h-full">
            <Space direction="vertical" className="w-full" size="middle">
              {knowledgeCategories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Text strong>{category.name}</Text>
                    <Text type="secondary">{category.count} 条</Text>
                  </div>
                  <Progress 
                    percent={category.progress} 
                    size="small"
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                </div>
              ))}
            </Space>
          </Card>
        </Col>

        {/* 最近活动 */}
        <Col xs={24} lg={12}>
          <Card title="最近活动" className="h-full">
            <List
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item className="border-0 px-0">
                  <List.Item.Meta
                    avatar={getActionIcon(item.type)}
                    title={
                      <div className="flex items-center justify-between">
                        <Text strong className="text-sm">{item.user}</Text>
                        <Text type="secondary" className="text-xs">{item.time}</Text>
                      </div>
                    }
                    description={
                      <Text className="text-sm text-gray-600">{item.action}</Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 主控制面板 */}
      <Card title="实时监控面板" className="mt-6">
        <BusinessManagementPlatform />
      </Card>
    </div>
  );
};

export default WikiDashboard;