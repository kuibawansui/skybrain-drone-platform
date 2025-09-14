'use client';

import React from 'react';
import { Card, Statistic, Progress, List, Badge, Space } from 'antd';
import { 
  RocketOutlined, 
  ThunderboltOutlined, 
  SignalFilled,
  WarningOutlined,
  CheckCircleOutlined 
} from '@ant-design/icons';

export const RealTimeDataPanel: React.FC = () => {
  // 模拟实时数据
  const systemStats = {
    totalDrones: 20,
    activeDrones: 18,
    completedMissions: 156,
    successRate: 98.5,
  };

  const droneList = [
    { id: 'UAV-001', status: 'flying', battery: 85, mission: '配送至CBD区域' },
    { id: 'UAV-002', status: 'delivering', battery: 72, mission: '医疗物资运输' },
    { id: 'UAV-003', status: 'returning', battery: 45, mission: '返回基地充电' },
    { id: 'UAV-004', status: 'emergency', battery: 23, mission: '紧急降落' },
    { id: 'UAV-005', status: 'idle', battery: 100, mission: '待命中' },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap = {
      flying: { status: 'processing' as const, text: '飞行中' },
      delivering: { status: 'warning' as const, text: '配送中' },
      returning: { status: 'default' as const, text: '返航中' },
      emergency: { status: 'error' as const, text: '紧急状态' },
      idle: { status: 'success' as const, text: '待命' },
    };
    return statusMap[status as keyof typeof statusMap] || { status: 'default' as const, text: '未知' };
  };

  return (
    <div className="space-y-4 h-full">
      {/* 系统概览 */}
      <Card 
        title="系统概览" 
        className="glass-panel"
        size="small"
      >
        <div className="grid grid-cols-2 gap-4">
          <Statistic
            title="总无人机数"
            value={systemStats.totalDrones}
            prefix={<RocketOutlined />}
            valueStyle={{ color: '#1890FF' }}
          />
          <Statistic
            title="活跃数量"
            value={systemStats.activeDrones}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52C41A' }}
          />
          <Statistic
            title="完成任务"
            value={systemStats.completedMissions}
            valueStyle={{ color: '#FAAD14' }}
          />
          <Statistic
            title="成功率"
            value={systemStats.successRate}
            suffix="%"
            valueStyle={{ color: '#52C41A' }}
          />
        </div>
      </Card>

      {/* 系统性能 */}
      <Card 
        title="系统性能" 
        className="glass-panel"
        size="small"
      >
        <Space direction="vertical" className="w-full">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>CPU使用率</span>
              <span>45%</span>
            </div>
            <Progress percent={45} strokeColor="#1890FF" size="small" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>内存使用率</span>
              <span>68%</span>
            </div>
            <Progress percent={68} strokeColor="#FAAD14" size="small" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>网络延迟</span>
              <span>12ms</span>
            </div>
            <Progress percent={88} strokeColor="#52C41A" size="small" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>数据处理</span>
              <span>实时</span>
            </div>
            <Progress percent={95} strokeColor="#722ED1" size="small" />
          </div>
        </Space>
      </Card>

      {/* 无人机状态列表 */}
      <Card 
        title="无人机状态" 
        className="glass-panel flex-1"
        size="small"
      >
        <List
          size="small"
          dataSource={droneList}
          renderItem={(item) => {
            const statusInfo = getStatusBadge(item.status);
            return (
              <List.Item className="border-b border-gray-700 last:border-b-0">
                <div className="w-full">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-white">{item.id}</span>
                    <Badge {...statusInfo} />
                  </div>
                  
                  <div className="flex justify-between items-center mb-2">
                    <Space>
                      <ThunderboltOutlined 
                        style={{ 
                          color: item.battery > 50 ? '#52c41a' : item.battery > 20 ? '#faad14' : '#ff4d4f'
                        }} 
                      />
                      <span className="text-sm">{item.battery}%</span>
                    </Space>
                    <SignalFilled className="text-green-400" />
                  </div>
                  
                  <div className="text-xs text-gray-400 truncate">
                    {item.mission}
                  </div>
                  
                  {item.status === 'emergency' && (
                    <div className="flex items-center mt-2 text-red-400">
                      <WarningOutlined className="mr-1" />
                      <span className="text-xs">需要立即处理</span>
                    </div>
                  )}
                </div>
              </List.Item>
            );
          }}
        />
      </Card>

      {/* 实时警报 */}
      <Card 
        title="实时警报" 
        className="glass-panel"
        size="small"
      >
        <List
          size="small"
          dataSource={[
            { type: 'warning', message: 'UAV-004 电量低于25%', time: '2分钟前' },
            { type: 'info', message: '新的配送任务已分配', time: '5分钟前' },
            { type: 'error', message: '检测到强风区域', time: '8分钟前' },
          ]}
          renderItem={(item) => (
            <List.Item className="border-b border-gray-700 last:border-b-0">
              <div className="w-full">
                <div className="flex items-start space-x-2">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    item.type === 'error' ? 'bg-red-500' :
                    item.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <div className="text-sm text-white">{item.message}</div>
                    <div className="text-xs text-gray-400">{item.time}</div>
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};