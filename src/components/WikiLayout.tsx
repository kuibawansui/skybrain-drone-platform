'use client';

import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, Space, Badge, Button } from 'antd';
import {
  DashboardOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BookOutlined,
  TeamOutlined,
  BellOutlined,
  SearchOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

interface WikiLayoutProps {
  children: React.ReactNode;
  userInfo: { username: string; role: string };
  onLogout: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const WikiLayout: React.FC<WikiLayoutProps> = ({
  children,
  userInfo,
  onLogout,
  currentPage,
  onPageChange
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '控制台概览',
    },
    {
      key: 'drone-management',
      icon: <RobotOutlined />,
      label: '无人机管理',
    },
    {
      key: 'risk-assessment',
      icon: <SafetyCertificateOutlined />,
      label: '风险评估',
    },
    {
      key: 'data-analytics',
      icon: <BarChartOutlined />,
      label: '数据分析',
    },
    {
      key: 'knowledge-base',
      icon: <BookOutlined />,
      label: '知识库',
    },
    {
      key: 'team-collaboration',
      icon: <TeamOutlined />,
      label: '团队协作',
    },
    {
      key: 'system-settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '账户设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: onLogout,
    },
  ];

  const getRoleColor = (role: string) => {
    const colors = {
      '系统管理员': '#1890ff',
      '操作员': '#52c41a',
      '观察员': '#fa8c16',
      '访客': '#722ed1'
    };
    return colors[role as keyof typeof colors] || '#666';
  };

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="bg-white shadow-lg"
        width={260}
      >
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <SafetyCertificateOutlined className="text-white text-lg" />
            </div>
            {!collapsed && (
              <div>
                <Title level={4} className="mb-0 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SkyBrain
                </Title>
                <Text type="secondary" className="text-xs">
                  Wiki Knowledge Base
                </Text>
              </div>
            )}
          </div>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[currentPage]}
          items={menuItems}
          className="border-0 mt-4"
          onClick={({ key }) => onPageChange(key)}
        />

        {!collapsed && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Avatar
                  size="small"
                  style={{ backgroundColor: getRoleColor(userInfo.role) }}
                  icon={<UserOutlined />}
                />
                <div className="flex-1 min-w-0">
                  <Text strong className="text-sm block truncate">
                    {userInfo.username}
                  </Text>
                  <Text type="secondary" className="text-xs">
                    {userInfo.role}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        )}
      </Sider>

      <Layout>
        <Header className="bg-white shadow-sm px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-lg"
            />
            
            <div className="h-8 w-px bg-gray-200" />
            
            <Space>
              <Button
                type="text"
                icon={<SearchOutlined />}
                className="text-gray-600"
              >
                搜索知识库
              </Button>
            </Space>
          </div>

          <Space size="large">
            <Badge count={3} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                className="text-gray-600"
              />
            </Badge>

            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
                <Avatar
                  size="small"
                  style={{ backgroundColor: getRoleColor(userInfo.role) }}
                  icon={<UserOutlined />}
                />
                <div className="hidden sm:block">
                  <Text strong className="text-sm">
                    {userInfo.username}
                  </Text>
                  <Text type="secondary" className="text-xs block">
                    {userInfo.role}
                  </Text>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>

        <Content className="bg-gray-50 p-6 overflow-auto">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default WikiLayout;