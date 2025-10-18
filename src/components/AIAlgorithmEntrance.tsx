'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Typography, 
  Space, 
  Avatar, 
  Dropdown, 
  Menu, 
  Badge,
  Row,
  Col,
  Statistic,
  Progress,
  Tag
} from 'antd';
import { 
  ExperimentOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  CrownOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  FireOutlined
} from '@ant-design/icons';
import LoginModal from './LoginModal';
import AIAlgorithmShowcase from './AIAlgorithmShowcase';

const { Title, Text } = Typography;

const AIAlgorithmEntrance: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAlgorithms, setShowAlgorithms] = useState(false);

  useEffect(() => {
    // 检查本地存储的用户信息
    const savedUser = localStorage.getItem('skybrainUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (userInfo: any) => {
    setUser(userInfo);
  };

  const handleLogout = () => {
    localStorage.removeItem('skybrainUser');
    setUser(null);
    setShowAlgorithms(false);
  };

  const getUserMenu = () => (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        个人资料
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        设置
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  if (showAlgorithms && user) {
    return <AIAlgorithmShowcase />;
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 背景装饰 */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        animation: 'float 20s ease-in-out infinite',
        pointerEvents: 'none'
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* 顶部用户信息 */}
        {user && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            marginBottom: '20px' 
          }}>
            <Dropdown overlay={getUserMenu()} placement="bottomRight">
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                background: 'rgba(255,255,255,0.2)', 
                padding: '8px 16px', 
                borderRadius: '25px',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)'
              }}>
                <Avatar src={user.avatar} icon={<UserOutlined />} />
                <span style={{ color: 'white', marginLeft: '8px', fontWeight: 'bold' }}>
                  {user.username}
                </span>
                <Badge 
                  count={user.role === 'administrator' ? <CrownOutlined style={{ color: '#f1c40f' }} /> : '研究员'} 
                  style={{ marginLeft: '8px' }}
                />
              </div>
            </Dropdown>
          </div>
        )}

        {/* 主标题区域 */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{
            fontSize: '120px',
            marginBottom: '20px',
            textShadow: '0 0 30px rgba(255,255,255,0.5)',
            animation: 'pulse 2s ease-in-out infinite'
          }}>🧠</div>
          
          <Title level={1} style={{ 
            color: 'white', 
            fontSize: '48px', 
            margin: 0,
            textShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}>
            SkyBrain AI算法研究平台
          </Title>
          
          <Text style={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: '20px',
            display: 'block',
            marginTop: '16px'
          }}>
            探索前沿AI算法 • 验证创新理论 • 展示卓越性能
          </Text>

          {/* 特色标签 */}
          <Space size="large" style={{ marginTop: '30px' }}>
            <Tag 
              icon={<ThunderboltOutlined />} 
              color="gold" 
              style={{ fontSize: '16px', padding: '8px 16px', borderRadius: '20px' }}
            >
              强化学习
            </Tag>
            <Tag 
              icon={<TrophyOutlined />} 
              color="cyan" 
              style={{ fontSize: '16px', padding: '8px 16px', borderRadius: '20px' }}
            >
              博弈论
            </Tag>
            <Tag 
              icon={<FireOutlined />} 
              color="volcano" 
              style={{ fontSize: '16px', padding: '8px 16px', borderRadius: '20px' }}
            >
              群体智能
            </Tag>
          </Space>
        </div>

        {/* 功能卡片区域 */}
        <Row gutter={[24, 24]} style={{ marginBottom: '40px' }}>
          <Col xs={24} md={8}>
            <Card 
              style={{ 
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '16px',
                textAlign: 'center',
                height: '200px'
              }}
              bodyStyle={{ padding: '30px 20px' }}
            >
              <RocketOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
              <Title level={4} style={{ color: 'white', margin: '0 0 8px 0' }}>
                算法设计
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                深度Q网络、Actor-Critic、多智能体强化学习等前沿算法
              </Text>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card 
              style={{ 
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '16px',
                textAlign: 'center',
                height: '200px'
              }}
              bodyStyle={{ padding: '30px 20px' }}
            >
              <ExperimentOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
              <Title level={4} style={{ color: 'white', margin: '0 0 8px 0' }}>
                仿真验证
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                实时仿真环境，可视化算法执行过程和性能指标
              </Text>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card 
              style={{ 
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '16px',
                textAlign: 'center',
                height: '200px'
              }}
              bodyStyle={{ padding: '30px 20px' }}
            >
              <TrophyOutlined style={{ fontSize: '48px', color: '#faad14', marginBottom: '16px' }} />
              <Title level={4} style={{ color: 'white', margin: '0 0 8px 0' }}>
                性能分析
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                效率、鲁棒性、收敛性等多维度性能评估体系
              </Text>
            </Card>
          </Col>
        </Row>

        {/* 统计数据 */}
        {user && (
          <Card 
            style={{ 
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '16px',
              marginBottom: '40px'
            }}
          >
            <Row gutter={[24, 24]}>
              <Col xs={12} md={6}>
                <Statistic 
                  title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>算法模型</span>}
                  value={15} 
                  suffix="个"
                  valueStyle={{ color: 'white', fontSize: '28px' }}
                />
              </Col>
              <Col xs={12} md={6}>
                <Statistic 
                  title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>仿真实验</span>}
                  value={1247} 
                  suffix="次"
                  valueStyle={{ color: 'white', fontSize: '28px' }}
                />
              </Col>
              <Col xs={12} md={6}>
                <Statistic 
                  title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>性能提升</span>}
                  value={87.5} 
                  suffix="%"
                  valueStyle={{ color: 'white', fontSize: '28px' }}
                />
              </Col>
              <Col xs={12} md={6}>
                <Statistic 
                  title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>研究成果</span>}
                  value={23} 
                  suffix="项"
                  valueStyle={{ color: 'white', fontSize: '28px' }}
                />
              </Col>
            </Row>
          </Card>
        )}

        {/* 主要操作按钮 */}
        <div style={{ textAlign: 'center' }}>
          {!user ? (
            <Space size="large">
              <Button 
                type="primary" 
                size="large"
                icon={<UserOutlined />}
                onClick={() => setShowLogin(true)}
                style={{
                  height: '60px',
                  fontSize: '18px',
                  padding: '0 40px',
                  background: 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)',
                  border: 'none',
                  borderRadius: '30px',
                  boxShadow: '0 8px 25px rgba(252, 70, 107, 0.4)'
                }}
              >
                登录访问AI算法平台
              </Button>
              
              <Button 
                size="large"
                onClick={() => setShowLogin(true)}
                style={{
                  height: '60px',
                  fontSize: '18px',
                  padding: '0 40px',
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  borderRadius: '30px',
                  backdropFilter: 'blur(10px)'
                }}
              >
                免费注册
              </Button>
            </Space>
          ) : (
            <Button 
              type="primary" 
              size="large"
              icon={<ExperimentOutlined />}
              onClick={() => setShowAlgorithms(true)}
              style={{
                height: '60px',
                fontSize: '18px',
                padding: '0 40px',
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                border: 'none',
                borderRadius: '30px',
                boxShadow: '0 8px 25px rgba(17, 153, 142, 0.4)'
              }}
            >
              进入AI算法研究平台
            </Button>
          )}
        </div>
      </div>

      {/* 登录模态框 */}
      <LoginModal 
        visible={showLogin}
        onClose={() => setShowLogin(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
};

export default AIAlgorithmEntrance;