import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Tag, 
  Badge, 
  Space, 
  Tooltip, 
  Progress, 
  Alert,
  Divider,
  Statistic,
  Switch
} from 'antd';
import { 
  TeamOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';

const { Option } = Select;

// 无人机信息接口
interface Drone {
  id: string;
  name: string;
  model: string;
  status: 'idle' | 'flying' | 'charging' | 'maintenance' | 'offline';
  battery: number;
  position: [number, number, number]; // [lat, lng, alt]
  speed: number;
  heading: number;
  lastUpdate: string;
  groupId?: string;
  isLeader?: boolean;
}

// 无人机群组接口
interface DroneGroup {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  memberIds: string[];
  status: 'idle' | 'active' | 'mission' | 'emergency';
  formation: 'line' | 'triangle' | 'diamond' | 'circle' | 'custom';
  mission?: {
    id: string;
    name: string;
    progress: number;
    startTime: string;
    estimatedEndTime: string;
  };
  createdAt: string;
  lastActive: string;
}

// 编队配置接口
interface FormationConfig {
  type: string;
  spacing: number;
  altitude: number;
  speed: number;
  pattern: {
    [droneId: string]: {
      offsetX: number;
      offsetY: number;
      offsetZ: number;
    };
  };
}

const DroneGroupManagement: React.FC = () => {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [groups, setGroups] = useState<DroneGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<DroneGroup | null>(null);
  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
  const [isFormationModalVisible, setIsFormationModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState<DroneGroup | null>(null);
  const [form] = Form.useForm();
  const [formationForm] = Form.useForm();

  // 初始化模拟数据
  useEffect(() => {
    initializeMockData();
    
    // 每5秒更新一次数据
    const interval = setInterval(updateDroneStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const initializeMockData = () => {
    // 模拟无人机数据
    const mockDrones: Drone[] = [
      {
        id: 'drone_001',
        name: 'SkyEye-01',
        model: 'DJI Matrice 300',
        status: 'idle',
        battery: 85,
        position: [39.9042, 116.4074, 120],
        speed: 0,
        heading: 0,
        lastUpdate: new Date().toISOString(),
      },
      {
        id: 'drone_002',
        name: 'SkyEye-02',
        model: 'DJI Matrice 300',
        status: 'flying',
        battery: 72,
        position: [39.9142, 116.4174, 115],
        speed: 15,
        heading: 90,
        lastUpdate: new Date().toISOString(),
        groupId: 'group_001',
        isLeader: true
      },
      {
        id: 'drone_003',
        name: 'SkyEye-03',
        model: 'DJI Phantom 4',
        status: 'flying',
        battery: 68,
        position: [39.9122, 116.4154, 115],
        speed: 15,
        heading: 90,
        lastUpdate: new Date().toISOString(),
        groupId: 'group_001'
      },
      {
        id: 'drone_004',
        name: 'SkyEye-04',
        model: 'DJI Phantom 4',
        status: 'charging',
        battery: 45,
        position: [39.9000, 116.4000, 0],
        speed: 0,
        heading: 0,
        lastUpdate: new Date().toISOString(),
      },
      {
        id: 'drone_005',
        name: 'SkyEye-05',
        model: 'DJI Mini 3',
        status: 'idle',
        battery: 92,
        position: [39.9020, 116.4020, 0],
        speed: 0,
        heading: 0,
        lastUpdate: new Date().toISOString(),
      }
    ];

    // 模拟群组数据
    const mockGroups: DroneGroup[] = [
      {
        id: 'group_001',
        name: '巡逻编队Alpha',
        description: '城市区域巡逻任务编队',
        leaderId: 'drone_002',
        memberIds: ['drone_002', 'drone_003'],
        status: 'mission',
        formation: 'line',
        mission: {
          id: 'mission_001',
          name: '城市巡逻任务',
          progress: 65,
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          estimatedEndTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString()
        },
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date().toISOString()
      }
    ];

    setDrones(mockDrones);
    setGroups(mockGroups);
  };

  // 更新无人机状态
  const updateDroneStatus = () => {
    setDrones(prevDrones => 
      prevDrones.map(drone => ({
        ...drone,
        battery: Math.max(0, drone.battery + (Math.random() - 0.7) * 2),
        speed: drone.status === 'flying' ? 10 + Math.random() * 10 : 0,
        lastUpdate: new Date().toISOString()
      }))
    );
  };

  // 获取状态颜色和图标
  const getStatusConfig = (status: string) => {
    const configs = {
      idle: { color: '#52c41a', text: '待机', icon: <CheckCircleOutlined /> },
      flying: { color: '#1890ff', text: '飞行中', icon: <PlayCircleOutlined /> },
      charging: { color: '#faad14', text: '充电中', icon: <ThunderboltOutlined /> },
      maintenance: { color: '#fa8c16', text: '维护中', icon: <SettingOutlined /> },
      offline: { color: '#f5222d', text: '离线', icon: <WarningOutlined /> },
      active: { color: '#1890ff', text: '活跃', icon: <PlayCircleOutlined /> },
      mission: { color: '#722ed1', text: '任务中', icon: <EnvironmentOutlined /> },
      emergency: { color: '#f5222d', text: '紧急', icon: <WarningOutlined /> }
    };
    return configs[status as keyof typeof configs] || configs.idle;
  };

  // 创建或编辑群组
  const handleGroupSubmit = async (values: any) => {
    try {
      if (editingGroup) {
        // 编辑群组
        setGroups(prev => prev.map(group => 
          group.id === editingGroup.id 
            ? { ...group, ...values, memberIds: values.memberIds || [] }
            : group
        ));
      } else {
        // 创建新群组
        const newGroup: DroneGroup = {
          id: `group_${Date.now()}`,
          name: values.name,
          description: values.description,
          leaderId: values.leaderId,
          memberIds: values.memberIds || [],
          status: 'idle',
          formation: values.formation || 'line',
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString()
        };
        setGroups(prev => [...prev, newGroup]);
        
        // 更新无人机的群组信息
        setDrones(prev => prev.map(drone => ({
          ...drone,
          groupId: values.memberIds?.includes(drone.id) ? newGroup.id : drone.groupId,
          isLeader: drone.id === values.leaderId
        })));
      }
      
      setIsGroupModalVisible(false);
      setEditingGroup(null);
      form.resetFields();
    } catch (error) {
      console.error('保存群组失败:', error);
    }
  };

  // 删除群组
  const handleDeleteGroup = (groupId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个无人机群组吗？',
      onOk: () => {
        setGroups(prev => prev.filter(group => group.id !== groupId));
        // 清除无人机的群组信息
        setDrones(prev => prev.map(drone => 
          drone.groupId === groupId 
            ? { ...drone, groupId: undefined, isLeader: false }
            : drone
        ));
      }
    });
  };

  // 启动群组任务
  const handleStartGroupMission = (groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { 
            ...group, 
            status: 'mission',
            mission: {
              id: `mission_${Date.now()}`,
              name: '自动生成任务',
              progress: 0,
              startTime: new Date().toISOString(),
              estimatedEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
            }
          }
        : group
    ));
    
    // 更新群组内无人机状态
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setDrones(prev => prev.map(drone => 
        group.memberIds.includes(drone.id)
          ? { ...drone, status: 'flying' }
          : drone
      ));
    }
  };

  // 停止群组任务
  const handleStopGroupMission = (groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, status: 'idle', mission: undefined }
        : group
    ));
    
    // 更新群组内无人机状态
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setDrones(prev => prev.map(drone => 
        group.memberIds.includes(drone.id)
          ? { ...drone, status: 'idle' }
          : drone
      ));
    }
  };

  // 无人机表格列定义
  const droneColumns = [
    {
      title: '无人机',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Drone) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.model}</div>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Drone) => {
        const config = getStatusConfig(status);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge status={status === 'flying' ? 'processing' : status === 'offline' ? 'error' : 'success'} />
            <span>{config.text}</span>
            {record.isLeader && <Tag color="gold" size="small">队长</Tag>}
          </div>
        );
      }
    },
    {
      title: '电量',
      dataIndex: 'battery',
      key: 'battery',
      render: (battery: number) => (
        <Progress 
          percent={battery} 
          size="small" 
          strokeColor={battery > 50 ? '#52c41a' : battery > 20 ? '#faad14' : '#f5222d'}
          format={percent => `${percent?.toFixed(0)}%`}
        />
      )
    },
    {
      title: '位置',
      dataIndex: 'position',
      key: 'position',
      render: (position: [number, number, number]) => (
        <div style={{ fontSize: '12px' }}>
          <div>纬度: {position[0].toFixed(4)}</div>
          <div>经度: {position[1].toFixed(4)}</div>
          <div>高度: {position[2]}m</div>
        </div>
      )
    },
    {
      title: '速度',
      dataIndex: 'speed',
      key: 'speed',
      render: (speed: number) => `${speed.toFixed(1)} m/s`
    }
  ];

  // 群组表格列定义
  const groupColumns = [
    {
      title: '群组名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: DroneGroup) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.description}</div>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: DroneGroup) => {
        const config = getStatusConfig(status);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag color={config.color} icon={config.icon}>
              {config.text}
            </Tag>
            {record.mission && (
              <Progress 
                percent={record.mission.progress} 
                size="small" 
                style={{ width: 60 }}
              />
            )}
          </div>
        );
      }
    },
    {
      title: '成员',
      dataIndex: 'memberIds',
      key: 'memberIds',
      render: (memberIds: string[], record: DroneGroup) => {
        const leader = drones.find(d => d.id === record.leaderId);
        const members = drones.filter(d => memberIds.includes(d.id));
        return (
          <div>
            <div style={{ fontSize: '12px', marginBottom: '4px' }}>
              队长: {leader?.name || '未知'}
            </div>
            <div style={{ fontSize: '12px' }}>
              成员: {members.length} 架
            </div>
          </div>
        );
      }
    },
    {
      title: '编队',
      dataIndex: 'formation',
      key: 'formation',
      render: (formation: string) => {
        const formationNames = {
          line: '直线编队',
          triangle: '三角编队',
          diamond: '菱形编队',
          circle: '圆形编队',
          custom: '自定义编队'
        };
        return formationNames[formation as keyof typeof formationNames] || formation;
      }
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: DroneGroup) => (
        <Space>
          <Tooltip title="编辑群组">
            <Button 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => {
                setEditingGroup(record);
                form.setFieldsValue({
                  name: record.name,
                  description: record.description,
                  leaderId: record.leaderId,
                  memberIds: record.memberIds,
                  formation: record.formation
                });
                setIsGroupModalVisible(true);
              }}
            />
          </Tooltip>
          
          {record.status === 'idle' ? (
            <Tooltip title="启动任务">
              <Button 
                size="small" 
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={() => handleStartGroupMission(record.id)}
              />
            </Tooltip>
          ) : (
            <Tooltip title="停止任务">
              <Button 
                size="small" 
                danger
                icon={<StopOutlined />}
                onClick={() => handleStopGroupMission(record.id)}
              />
            </Tooltip>
          )}
          
          <Tooltip title="编队配置">
            <Button 
              size="small" 
              icon={<SettingOutlined />}
              onClick={() => {
                setSelectedGroup(record);
                setIsFormationModalVisible(true);
              }}
            />
          </Tooltip>
          
          <Tooltip title="删除群组">
            <Button 
              size="small" 
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteGroup(record.id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // 获取可用的无人机（未分组或当前群组的）
  const getAvailableDrones = () => {
    return drones.filter(drone => 
      !drone.groupId || (editingGroup && drone.groupId === editingGroup.id)
    );
  };

  return (
    <div style={{ height: '100%', padding: '16px' }}>
      {/* 统计概览 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="总无人机数"
              value={drones.length}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="活跃群组"
              value={groups.filter(g => g.status !== 'idle').length}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="飞行中"
              value={drones.filter(d => d.status === 'flying').length}
              prefix={<EnvironmentOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="平均电量"
              value={Math.round(drones.reduce((sum, d) => sum + d.battery, 0) / drones.length)}
              suffix="%"
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 无人机群组管理 */}
        <Col span={14}>
          <Card 
            title="无人机群组管理"
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingGroup(null);
                  form.resetFields();
                  setIsGroupModalVisible(true);
                }}
              >
                创建群组
              </Button>
            }
          >
            <Table
              columns={groupColumns}
              dataSource={groups}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ y: 300 }}
            />
          </Card>
        </Col>

        {/* 无人机状态监控 */}
        <Col span={10}>
          <Card title="无人机状态监控">
            <Table
              columns={droneColumns}
              dataSource={drones}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ y: 300 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 创建/编辑群组模态框 */}
      <Modal
        title={editingGroup ? '编辑群组' : '创建新群组'}
        open={isGroupModalVisible}
        onCancel={() => {
          setIsGroupModalVisible(false);
          setEditingGroup(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleGroupSubmit}
        >
          <Form.Item
            name="name"
            label="群组名称"
            rules={[{ required: true, message: '请输入群组名称' }]}
          >
            <Input placeholder="输入群组名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="群组描述"
          >
            <Input.TextArea placeholder="输入群组描述" rows={2} />
          </Form.Item>

          <Form.Item
            name="leaderId"
            label="队长无人机"
            rules={[{ required: true, message: '请选择队长无人机' }]}
          >
            <Select placeholder="选择队长无人机">
              {getAvailableDrones().map(drone => (
                <Option key={drone.id} value={drone.id}>
                  {drone.name} ({drone.model})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="memberIds"
            label="群组成员"
            rules={[{ required: true, message: '请选择群组成员' }]}
          >
            <Select 
              mode="multiple" 
              placeholder="选择群组成员"
              maxTagCount={3}
            >
              {getAvailableDrones().map(drone => (
                <Option key={drone.id} value={drone.id}>
                  {drone.name} ({drone.model})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="formation"
            label="编队类型"
            initialValue="line"
          >
            <Select>
              <Option value="line">直线编队</Option>
              <Option value="triangle">三角编队</Option>
              <Option value="diamond">菱形编队</Option>
              <Option value="circle">圆形编队</Option>
              <Option value="custom">自定义编队</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编队配置模态框 */}
      <Modal
        title="编队配置"
        open={isFormationModalVisible}
        onCancel={() => setIsFormationModalVisible(false)}
        onOk={() => {
          // 保存编队配置逻辑
          setIsFormationModalVisible(false);
        }}
        width={800}
      >
        {selectedGroup && (
          <div>
            <Alert
              message="编队配置"
              description={`正在配置群组 "${selectedGroup.name}" 的编队参数`}
              type="info"
              style={{ marginBottom: 16 }}
            />
            
            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="编队间距">
                    <Input suffix="米" defaultValue="50" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="飞行高度">
                    <Input suffix="米" defaultValue="120" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="飞行速度">
                    <Input suffix="m/s" defaultValue="15" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item label="自动保持编队">
                <Switch defaultChecked />
              </Form.Item>
              
              <Form.Item label="碰撞避免">
                <Switch defaultChecked />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DroneGroupManagement;