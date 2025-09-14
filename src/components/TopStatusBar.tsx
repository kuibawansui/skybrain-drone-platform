'use client';

import React from 'react';
import { Layout, Space, Badge, Button, Avatar, Dropdown } from 'antd';
import { 
  UserOutlined, 
  SettingOutlined, 
  PoweroffOutlined,
  BellOutlined,
  CloudOutlined,
  WifiOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import dayjs from 'dayjs';

const { Header } = Layout;

export const TopStatusBar: React.FC = () => {
  const systemStatus = useSelector((state: RootState) => state.system.status);
  const currentTime = dayjs().format('YYYY-MM-DD HH:mm:ss');

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <PoweroffOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  return (
    <Header className="control-panel px-6 flex items-center justify-between h-16 border-b border-gray-700">
      {/* 左侧 Logo 和系统状态 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            background: 'linear-gradient(135deg, #1890FF 0%, #40a9ff 100%)', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>S</span>
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', margin: 0 }}>SkyBrain</h1>
            <p style={{ fontSize: '12px', color: '#8C8C8C', margin: 0 }}>无人机集群调度平台</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Badge 
            status={systemStatus === 'online' ? 'success' : 'error'} 
            text={
              <span className={systemStatus === 'online' ? 'status-online' : 'status-error'}>
                系统{systemStatus === 'online' ? '正常' : '异常'}
              </span>
            } 
          />
          <Badge status="success" text={<span className="status-online">网络连接</span>} />
          <WifiOutlined className="text-green-400" />
        </div>
      </div>

      {/* 中央时间和天气 */}
      <div className="flex items-center space-x-6">
        <div className="text-center">
          <div className="text-lg font-mono text-white">{currentTime}</div>
          <div className="text-xs text-gray-400">北京时间</div>
        </div>
        
        <div className="flex items-center space-x-2 glass-panel px-4 py-2">
          <CloudOutlined className="text-blue-400" />
          <div className="text-sm">
            <span className="text-white">晴朗</span>
            <span className="text-gray-400 ml-2">22°C</span>
          </div>
        </div>
      </div>

      {/* 右侧用户操作区 */}
      <div className="flex items-center space-x-4">
        <Button 
          type="text" 
          icon={<BellOutlined />} 
          className="text-white hover:text-blue-400"
          size="large"
        />
        
        <Button 
          danger
          type="primary"
          icon={<PoweroffOutlined />}
          className="glow-orange"
        >
          紧急停止
        </Button>
        
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <div className="flex items-center space-x-2 cursor-pointer hover:bg-white/10 px-3 py-2 rounded-lg transition-colors">
            <Avatar icon={<UserOutlined />} className="bg-blue-500" />
            <div className="text-sm">
              <div className="text-white">管理员</div>
              <div className="text-gray-400">在线</div>
            </div>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};