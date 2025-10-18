'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Badge, 
  Space, 
  Tooltip, 
  Progress, 
  Statistic,
  Avatar,
  Dropdown,
  Menu,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm
} from 'antd';
import { 
  TeamOutlined,
  PlusOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  EnvironmentOutlined,
  MoreOutlined,
  RobotOutlined
} from '@ant-design/icons';

// 无人机信息接口
interface Drone {
  id: string;
  name: string;
  model: string;
  status: 'idle' | 'flying' | 'charging' | 'maintenance' | 'offline';
  battery: number;
  position: [number, number, number];
  speed: number;
  lastUpdate: string;
}

// 群组信息接口
interface DroneGroup {
  id: string;
  name: string;
  status: 'active' | 'standby' | 'mission' | 'offline';
  drones: string[];
  formation: string;
  leader: string;
}

const { Option } = Select;

const CompactDroneManagement: React.FC = () => {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [groups, setGroups] = useState<DroneGroup[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 模态框状态
  const [addDroneModalVisible, setAddDroneModalVisible] = useState(false);
  const [createGroupModalVisible, setCreateGroupModalVisible] = useState(false);
  const [selectedDrones, setSelectedDrones] = useState<string[]>([]);
  
  // 表单实例
  const [addDroneForm] = Form.useForm();
  const [createGroupForm] = Form.useForm();

  // 生成模拟数据
  useEffect(() => {
    const mockDrones: Drone[] = [
      {
        id: 'drone-001',
        name: 'SkyEye-01',
        model: 'DJI Matrice',
        status: 'flying',
        battery: 85,
        position: [39.9042, 116.4074, 120],
        speed: 11.6,
        lastUpdate: new Date().toLocaleTimeString()
      },
      {
        id: 'drone-002', 
        name: 'Guardian-02',
        model: 'Phantom Pro',
        status: 'idle',
        battery: 92,
        position: [39.9052, 116.4084, 0],
        speed: 0,
        lastUpdate: new Date().toLocaleTimeString()
      },
      {
        id: 'drone-003',
        name: 'Scout-03',
        model: 'Mini Drone',
        status: 'charging',
        battery: 45,
        position: [39.9032, 116.4064, 0],
        speed: 0,
        lastUpdate: new Date().toLocaleTimeString()
      },
      {
        id: 'drone-004',
        name: 'Patrol-04',
        model: 'Heavy Lift',
        status: 'maintenance',
        battery: 0,
        position: [39.9022, 116.4054, 0],
        speed: 0,
        lastUpdate: new Date().toLocaleTimeString()
      },
      {
        id: 'drone-005',
        name: 'Recon-05',
        model: 'Stealth Pro',
        status: 'flying',
        battery: 67,
        position: [39.9062, 116.4094, 95],
        speed: 8.3,
        lastUpdate: new Date().toLocaleTimeString()
      }
    ];

    const mockGroups: DroneGroup[] = [
      {
        id: 'group-alpha',
        name: '巡逻编队Alpha',
        status: 'mission',
        drones: ['drone-001', 'drone-005'],
        formation: '直线编队',
        leader: 'drone-001'
      },
      {
        id: 'group-beta',
        name: '侦察编队Beta',
        status: 'standby',
        drones: ['drone-002', 'drone-003'],
        formation: 'V字编队',
        leader: 'drone-002'
      }
    ];

    setDrones(mockDrones);
    setGroups(mockGroups);
  }, []);

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    const colors = {
      flying: '#52c41a',
      idle: '#1890ff',
      charging: '#faad14',
      maintenance: '#fa8c16',
      offline: '#ff4d4f',
      active: '#52c41a',
      standby: '#1890ff',
      mission: '#722ed1'
    };
    return colors[status as keyof typeof colors] || '#d9d9d9';
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    const texts = {
      flying: '飞行中',
      idle: '待机',
      charging: '充电中',
      maintenance: '维护中',
      offline: '离线',
      active: '活跃',
      standby: '待命',
      mission: '任务中'
    };
    return texts[status as keyof typeof texts] || status;
  };

  // 添加无人机功能
  const handleAddDrone = async (values: any) => {
    try {
      setLoading(true);
      
      const newDrone: Drone = {
        id: `drone-${Date.now()}`,
        name: values.name,
        model: values.model,
        status: 'idle',
        battery: 100,
        position: [39.9042 + Math.random() * 0.01, 116.4074 + Math.random() * 0.01, 0],
        speed: 0,
        lastUpdate: new Date().toLocaleTimeString()
      };
      
      setDrones(prev => [...prev, newDrone]);
      setAddDroneModalVisible(false);
      addDroneForm.resetFields();
      message.success(`无人机 ${values.name} 添加成功！`);
      
    } catch (error) {
      message.error('添加无人机失败！');
    } finally {
      setLoading(false);
    }
  };

  // 创建编队功能
  const handleCreateGroup = async (values: any) => {
    try {
      setLoading(true);
      
      if (selectedDrones.length < 2) {
        message.warning('编队至少需要2架无人机！');
        return;
      }
      
      const newGroup: DroneGroup = {
        id: `group-${Date.now()}`,
        name: values.name,
        status: 'standby',
        drones: selectedDrones,
        formation: values.formation,
        leader: selectedDrones[0]
      };
      
      setGroups(prev => [...prev, newGroup]);
      setCreateGroupModalVisible(false);
      createGroupForm.resetFields();
      setSelectedDrones([]);
      message.success(`编队 ${values.name} 创建成功！`);
      
    } catch (error) {
      message.error('创建编队失败！');
    } finally {
      setLoading(false);
    }
  };

  // 删除无人机
  const handleDeleteDrone = (droneId: string) => {
    setDrones(prev => prev.filter(d => d.id !== droneId));
    // 同时从编队中移除
    setGroups(prev => prev.map(group => ({
      ...group,
      drones: group.drones.filter(id => id !== droneId)
    })).filter(group => group.drones.length > 0));
    message.success('无人机已删除！');
  };

  // 删除编队
  const handleDeleteGroup = (groupId: string) => {
    setGroups(prev => prev.filter(g => g.id !== groupId));
    message.success('编队已解散！');
  };

  // 更改无人机状态
  const handleDroneStatusChange = (droneId: string, newStatus: Drone['status']) => {
    setDrones(prev => prev.map(drone => 
      drone.id === droneId 
        ? { 
            ...drone, 
            status: newStatus,
            speed: newStatus === 'flying' ? Math.random() * 15 + 5 : 0,
            lastUpdate: new Date().toLocaleTimeString()
          }
        : drone
    ));
    
    const statusText = getStatusText(newStatus);
    message.success(`无人机状态已更改为：${statusText}`);
  };

  // 更改编队状态
  const handleGroupStatusChange = (groupId: string, newStatus: DroneGroup['status']) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId ? { ...group, status: newStatus } : group
    ));
    
    // 同时更新编队内所有无人机状态
    const group = groups.find(g => g.id === groupId);
    if (group) {
      const droneStatus = newStatus === 'mission' ? 'flying' : 'idle';
      group.drones.forEach(droneId => {
        handleDroneStatusChange(droneId, droneStatus);
      });
    }
    
    message.success(`编队状态已更改！`);
  };

  // 无人机操作菜单
  const getDroneMenu = (drone: Drone) => (
    <Menu onClick={({ key }) => {
      switch (key) {
        case 'start':
          handleDroneStatusChange(drone.id, 'flying');
          break;
        case 'pause':
          handleDroneStatusChange(drone.id, 'idle');
          break;
        case 'charge':
          handleDroneStatusChange(drone.id, 'charging');
          break;
        case 'maintenance':
          handleDroneStatusChange(drone.id, 'maintenance');
          break;
        case 'offline':
          handleDroneStatusChange(drone.id, 'offline');
          break;
      }
    }}>
      <Menu.Item key="start" icon={<PlayCircleOutlined />}>
        启动飞行
      </Menu.Item>
      <Menu.Item key="pause" icon={<PauseCircleOutlined />}>
        待机
      </Menu.Item>
      <Menu.Item key="charge" icon={<ThunderboltOutlined />}>
        充电
      </Menu.Item>
      <Menu.Item key="maintenance" icon={<SettingOutlined />}>
        维护
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="offline" icon={<StopOutlined />} danger>
        离线
      </Menu.Item>
    </Menu>
  );

  // 编队操作菜单
  const getGroupMenu = (group: DroneGroup) => (
    <Menu onClick={({ key }) => {
      switch (key) {
        case 'start':
          handleGroupStatusChange(group.id, 'mission');
          break;
        case 'standby':
          handleGroupStatusChange(group.id, 'standby');
          break;
        case 'active':
          handleGroupStatusChange(group.id, 'active');
          break;
      }
    }}>
      <Menu.Item key="start" icon={<PlayCircleOutlined />}>
        开始任务
      </Menu.Item>
      <Menu.Item key="standby" icon={<PauseCircleOutlined />}>
        待命
      </Menu.Item>
      <Menu.Item key="active" icon={<EnvironmentOutlined />}>
        激活编队
      </Menu.Item>
    </Menu>
  );

  // 统计数据
  const stats = {
    total: drones.length,
    flying: drones.filter(d => d.status === 'flying').length,
    idle: drones.filter(d => d.status === 'idle').length,
    charging: drones.filter(d => d.status === 'charging').length,
    avgBattery: Math.round(drones.reduce((sum, d) => sum + d.battery, 0) / drones.length)
  };

  return (
    <div style={{ height: '100%' }}>
      {/* 统计概览 - 第一行 */}
      <Row gutter={[12, 12]} style={{ marginBottom: '16px' }}>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center', background: 'rgba(24, 144, 255, 0.1)' }}>
            <Statistic
              title="总无人机数"
              value={stats.total}
              prefix={<RobotOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center', background: 'rgba(82, 196, 26, 0.1)' }}>
            <Statistic
              title="飞行中"
              value={stats.flying}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center', background: 'rgba(250, 173, 20, 0.1)' }}>
            <Statistic
              title="待机"
              value={stats.idle}
              prefix={<PauseCircleOutlined />}
              valueStyle={{ color: '#faad14', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center', background: 'rgba(114, 46, 209, 0.1)' }}>
            <Statistic
              title="平均电量"
              value={stats.avgBattery}
              suffix="%"
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#722ed1', fontSize: '20px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 无人机状态 - 第二行 */}
      <Card 
        title={
          <Space>
            <TeamOutlined />
            <span>无人机状态监控</span>
            <Badge count={stats.flying} style={{ backgroundColor: '#52c41a' }} />
          </Space>
        }
        size="small"
        extra={
          <Button 
            type="primary" 
            size="small" 
            icon={<PlusOutlined />}
            onClick={() => setAddDroneModalVisible(true)}
            loading={loading}
          >
            添加无人机
          </Button>
        }
        style={{ marginBottom: '16px' }}
      >
        <Row gutter={[8, 8]}>
          {drones.map((drone) => (
            <Col span={4.8} key={drone.id}>
              <Card 
                size="small"
                hoverable
                style={{ 
                  height: '120px',
                  background: selectedDrones.includes(drone.id) 
                    ? 'rgba(24, 144, 255, 0.2)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  border: selectedDrones.includes(drone.id)
                    ? '2px solid #1890ff'
                    : `1px solid ${getStatusColor(drone.status)}`,
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
                bodyStyle={{ padding: '8px' }}
                onClick={() => {
                  if (selectedDrones.includes(drone.id)) {
                    setSelectedDrones(prev => prev.filter(id => id !== drone.id));
                  } else {
                    setSelectedDrones(prev => [...prev, drone.id]);
                  }
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <Avatar 
                    size={32} 
                    style={{ 
                      backgroundColor: getStatusColor(drone.status),
                      marginBottom: '4px'
                    }}
                  >
                    {drone.name.slice(-2)}
                  </Avatar>
                  
                  <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '2px' }}>
                    {drone.name}
                  </div>
                  
                  <Tag 
                    color={getStatusColor(drone.status)} 
                    style={{ fontSize: '10px', margin: '2px 0' }}
                  >
                    {getStatusText(drone.status)}
                  </Tag>
                  
                  <div style={{ marginTop: '4px' }}>
                    <Progress 
                      percent={drone.battery} 
                      size="small"
                      strokeColor={drone.battery > 50 ? '#52c41a' : drone.battery > 20 ? '#faad14' : '#ff4d4f'}
                      showInfo={false}
                    />
                    <div style={{ fontSize: '10px', color: '#666' }}>
                      {drone.battery}% | {drone.speed.toFixed(1)}m/s
                    </div>
                  </div>
                  
                  <div style={{ position: 'absolute', top: '4px', right: '4px' }}>
                    <Space size="small">
                      <Dropdown overlay={getDroneMenu(drone)} trigger={['click']}>
                        <Button 
                          type="text" 
                          size="small" 
                          icon={<MoreOutlined />}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Dropdown>
                      <Popconfirm
                        title="确定删除这架无人机吗？"
                        onConfirm={(e) => {
                          e?.stopPropagation();
                          handleDeleteDrone(drone.id);
                        }}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button 
                          type="text" 
                          size="small" 
                          danger
                          icon={<DeleteOutlined />}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Popconfirm>
                    </Space>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 群组管理 - 第三行 */}
      <Card 
        title={
          <Space>
            <TeamOutlined />
            <span>编队群组</span>
            <Badge count={groups.filter(g => g.status === 'mission').length} />
          </Space>
        }
        size="small"
        extra={
          <Button 
            type="primary" 
            size="small" 
            icon={<PlusOutlined />}
            onClick={() => setCreateGroupModalVisible(true)}
            loading={loading}
          >
            创建编队
          </Button>
        }
      >
        <Row gutter={[12, 12]}>
          {groups.map((group) => (
            <Col span={12} key={group.id}>
              <Card 
                size="small"
                hoverable
                style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${getStatusColor(group.status)}`,
                  borderRadius: '8px'
                }}
                bodyStyle={{ padding: '12px' }}
              >
                <Row align="middle">
                  <Col span={16}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {group.name}
                    </div>
                    <Space size="small">
                      <Tag color={getStatusColor(group.status)} size="small">
                        {getStatusText(group.status)}
                      </Tag>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        {group.formation}
                      </span>
                    </Space>
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                      队长: {drones.find(d => d.id === group.leader)?.name || '未指定'}
                    </div>
                  </Col>
                  <Col span={8} style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: getStatusColor(group.status) }}>
                      {group.drones.length}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      架无人机
                    </div>
                    <Space size="small" style={{ marginTop: '4px' }}>
                      <Dropdown overlay={getGroupMenu(group)} trigger={['click']}>
                        <Button type="text" size="small" icon={<PlayCircleOutlined />} />
                      </Dropdown>
                      <Popconfirm
                        title="确定解散这个编队吗？"
                        onConfirm={() => handleDeleteGroup(group.id)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </Space>
                  </Col>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 添加无人机模态框 */}
      <Modal
        title="添加新无人机"
        open={addDroneModalVisible}
        onCancel={() => {
          setAddDroneModalVisible(false);
          addDroneForm.resetFields();
        }}
        footer={null}
        width={400}
      >
        <Form
          form={addDroneForm}
          layout="vertical"
          onFinish={handleAddDrone}
        >
          <Form.Item
            name="name"
            label="无人机名称"
            rules={[{ required: true, message: '请输入无人机名称' }]}
          >
            <Input placeholder="例如: SkyEye-06" />
          </Form.Item>
          
          <Form.Item
            name="model"
            label="无人机型号"
            rules={[{ required: true, message: '请选择无人机型号' }]}
          >
            <Select placeholder="选择型号">
              <Option value="DJI Matrice">DJI Matrice</Option>
              <Option value="Phantom Pro">Phantom Pro</Option>
              <Option value="Mini Drone">Mini Drone</Option>
              <Option value="Heavy Lift">Heavy Lift</Option>
              <Option value="Stealth Pro">Stealth Pro</Option>
            </Select>
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setAddDroneModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                添加
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 创建编队模态框 */}
      <Modal
        title="创建新编队"
        open={createGroupModalVisible}
        onCancel={() => {
          setCreateGroupModalVisible(false);
          createGroupForm.resetFields();
          setSelectedDrones([]);
        }}
        footer={null}
        width={500}
      >
        <Form
          form={createGroupForm}
          layout="vertical"
          onFinish={handleCreateGroup}
        >
          <Form.Item
            name="name"
            label="编队名称"
            rules={[{ required: true, message: '请输入编队名称' }]}
          >
            <Input placeholder="例如: 巡逻编队Gamma" />
          </Form.Item>
          
          <Form.Item
            name="formation"
            label="编队类型"
            rules={[{ required: true, message: '请选择编队类型' }]}
          >
            <Select placeholder="选择编队类型">
              <Option value="直线编队">直线编队</Option>
              <Option value="V字编队">V字编队</Option>
              <Option value="三角编队">三角编队</Option>
              <Option value="菱形编队">菱形编队</Option>
              <Option value="圆形编队">圆形编队</Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="选择无人机">
            <div style={{ 
              border: '1px solid #d9d9d9', 
              borderRadius: '6px', 
              padding: '8px',
              minHeight: '100px',
              background: '#fafafa'
            }}>
              {selectedDrones.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#999', 
                  padding: '20px' 
                }}>
                  请在上方无人机列表中点击选择无人机
                </div>
              ) : (
                <Space wrap>
                  {selectedDrones.map(droneId => {
                    const drone = drones.find(d => d.id === droneId);
                    return drone ? (
                      <Tag 
                        key={droneId}
                        closable
                        onClose={() => setSelectedDrones(prev => prev.filter(id => id !== droneId))}
                        color={getStatusColor(drone.status)}
                      >
                        {drone.name}
                      </Tag>
                    ) : null;
                  })}
                </Space>
              )}
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              已选择 {selectedDrones.length} 架无人机 (至少需要2架)
            </div>
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setCreateGroupModalVisible(false);
                setSelectedDrones([]);
              }}>
                取消
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                disabled={selectedDrones.length < 2}
              >
                创建编队
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CompactDroneManagement;