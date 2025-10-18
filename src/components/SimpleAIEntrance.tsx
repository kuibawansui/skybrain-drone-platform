'use client';

import React, { useState } from 'react';
import { Card, Button, Typography, Space, Modal, Form, Input, message } from 'antd';
import { UserOutlined, LockOutlined, ExperimentOutlined } from '@ant-design/icons';
import AIAlgorithmShowcase from './AIAlgorithmShowcase';

const { Title, Text } = Typography;

const SimpleAIEntrance: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAlgorithms, setShowAlgorithms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: any) => {
    setLoading(true);
    
    // 模拟登录
    setTimeout(() => {
      const userInfo = {
        username: values.username,
        role: values.username === 'admin' ? 'administrator' : 'researcher'
      };
      
      setUser(userInfo);
      message.success('登录成功！');
      setShowLogin(false);
      setLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    setUser(null);
    setShowAlgorithms(false);
  };

  if (showAlgorithms && user) {
    return (
      <div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          padding: '16px',
          background: 'rgba(0,0,0,0.1)',
          borderRadius: '8px'
        }}>
          <Title level={3} style={{ margin: 0, color: 'white' }}>
            🧠 AI算法研究平台 - 欢迎 {user.username}
          </Title>
          <Button onClick={handleLogout}>退出登录</Button>
        </div>
        <AIAlgorithmShowcase />
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '40px',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100%',
      borderRadius: '12px'
    }}>
      {/* 主标题 */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontSize: '80px', marginBottom: '20px' }}>🧠</div>
        <Title level={1} style={{ color: 'white', fontSize: '36px' }}>
          SkyBrain AI算法研究平台
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px' }}>
          探索前沿AI算法 • 验证创新理论 • 展示卓越性能
        </Text>
      </div>

      {/* 功能介绍 */}
      <div style={{ marginBottom: '40px' }}>
        <Space direction="vertical" size="large">
          <Card style={{ background: 'rgba(255,255,255,0.1)', border: 'none' }}>
            <Text style={{ color: 'white', fontSize: '16px' }}>
              🚀 <strong>算法设计</strong>: 深度Q网络、Actor-Critic、多智能体强化学习
            </Text>
          </Card>
          <Card style={{ background: 'rgba(255,255,255,0.1)', border: 'none' }}>
            <Text style={{ color: 'white', fontSize: '16px' }}>
              🔬 <strong>仿真验证</strong>: 实时仿真环境，可视化算法执行过程
            </Text>
          </Card>
          <Card style={{ background: 'rgba(255,255,255,0.1)', border: 'none' }}>
            <Text style={{ color: 'white', fontSize: '16px' }}>
              📊 <strong>性能分析</strong>: 效率、鲁棒性、收敛性多维度评估
            </Text>
          </Card>
        </Space>
      </div>

      {/* 登录按钮 */}
      {!user ? (
        <Space size="large">
          <Button 
            type="primary" 
            size="large"
            icon={<UserOutlined />}
            onClick={() => setShowLogin(true)}
            style={{
              height: '50px',
              fontSize: '16px',
              padding: '0 30px',
              background: 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)',
              border: 'none',
              borderRadius: '25px'
            }}
          >
            登录访问AI算法平台
          </Button>
        </Space>
      ) : (
        <Button 
          type="primary" 
          size="large"
          icon={<ExperimentOutlined />}
          onClick={() => setShowAlgorithms(true)}
          style={{
            height: '50px',
            fontSize: '16px',
            padding: '0 30px',
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            border: 'none',
            borderRadius: '25px'
          }}
        >
          进入AI算法研究平台
        </Button>
      )}

      {/* 登录模态框 */}
      <Modal
        title="登录到AI算法平台"
        open={showLogin}
        onCancel={() => setShowLogin(false)}
        footer={null}
        centered
      >
        <Form onFinish={handleLogin} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="输入用户名 (试试: admin 或 researcher)" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="输入密码 (任意密码)" 
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              size="large"
            >
              登录
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Space direction="vertical">
              <Button 
                type="link" 
                onClick={() => handleLogin({ username: 'admin', password: 'admin' })}
              >
                快速登录 - 管理员
              </Button>
              <Button 
                type="link" 
                onClick={() => handleLogin({ username: 'researcher', password: 'demo' })}
              >
                快速登录 - 研究员
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default SimpleAIEntrance;