'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Tabs, 
  Button, 
  Space, 
  Statistic, 
  Progress, 
  Tag, 
  Alert,
  Divider,
  Typography,
  Select,
  Slider,
  Switch,
  Table,
  Timeline,
  Badge
} from 'antd';
import { 
  ExperimentOutlined,
  ThunderboltOutlined,
  RobotOutlined,
  BarChartOutlined,
  BulbOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  TrophyOutlined,
  RocketOutlined,
  BranchesOutlined
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar
} from 'recharts';

const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// 算法性能数据接口
interface AlgorithmPerformance {
  algorithm: string;
  efficiency: number;
  robustness: number;
  convergence: number;
  accuracy: number;
  adaptability: number;
  scalability: number;
}

// 仿真数据接口
interface SimulationData {
  iteration: number;
  reward: number;
  loss: number;
  accuracy: number;
  convergenceRate: number;
  explorationRate: number;
}

// 强化学习算法展示组件
const ReinforcementLearningDemo: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [learningRate, setLearningRate] = useState(0.001);
  const [epsilon, setEpsilon] = useState(0.1);
  const [simulationData, setSimulationData] = useState<SimulationData[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 模拟强化学习训练过程
  const runSimulation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      setCurrentEpisode(prev => {
        const newEpisode = prev + 1;
        
        // 模拟Q-Learning算法的收敛过程
        const baseReward = Math.log(newEpisode + 1) * 10;
        const noise = (Math.random() - 0.5) * 5;
        const reward = Math.max(0, baseReward + noise);
        
        const loss = Math.max(0, 100 * Math.exp(-newEpisode / 100) + Math.random() * 10);
        const accuracy = Math.min(100, (1 - Math.exp(-newEpisode / 50)) * 100);
        const convergenceRate = Math.min(100, newEpisode / 2);
        const explorationRate = Math.max(5, epsilon * 100 * Math.exp(-newEpisode / 200));

        const newData: SimulationData = {
          iteration: newEpisode,
          reward,
          loss,
          accuracy,
          convergenceRate,
          explorationRate
        };

        setSimulationData(prev => {
          const updated = [...prev, newData];
          return updated.slice(-100); // 保持最近100个数据点
        });

        if (newEpisode >= 500) {
          setIsRunning(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
        }

        return newEpisode;
      });
    }, 50);
  };

  const startSimulation = () => {
    setIsRunning(true);
    runSimulation();
  };

  const stopSimulation = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setCurrentEpisode(0);
    setSimulationData([]);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div>
      {/* 算法理论 */}
      <Card title="🧠 Deep Q-Network (DQN) 算法理论" style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Title level={5}>核心创新点</Title>
            <ul>
              <li><strong>经验回放机制</strong>: 打破数据相关性，提高学习效率</li>
              <li><strong>目标网络</strong>: 稳定训练过程，避免发散</li>
              <li><strong>ε-贪婪策略</strong>: 平衡探索与利用</li>
              <li><strong>神经网络逼近</strong>: 处理高维状态空间</li>
            </ul>
            
            <Title level={5} style={{ color: '#1890ff' }}>数学推导</Title>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                padding: '15px', 
                borderRadius: '8px', 
                fontFamily: 'monospace',
                fontSize: '16px',
                color: 'white',
                fontWeight: 'bold',
                marginBottom: '8px',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}>
                Q*(s,a) = E[r + γ max Q*(s',a') | s,a]
              </div>
              <div style={{ 
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', 
                padding: '15px', 
                borderRadius: '8px', 
                fontFamily: 'monospace',
                fontSize: '16px',
                color: 'white',
                fontWeight: 'bold',
                marginBottom: '8px',
                boxShadow: '0 4px 15px rgba(17, 153, 142, 0.4)'
              }}>
                Loss = E[(r + γ max Q(s',a';θ⁻) - Q(s,a;θ))²]
              </div>
              <div style={{ 
                background: 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)', 
                padding: '15px', 
                borderRadius: '8px', 
                fontFamily: 'monospace',
                fontSize: '16px',
                color: 'white',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(252, 70, 107, 0.4)'
              }}>
                θ ← θ - α∇θ Loss
              </div>
            </div>
          </Col>
          
          <Col span={12}>
            <Title level={5}>算法优势</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Tag color="green">✓ 无需环境模型</Tag>
              <Tag color="green">✓ 处理连续状态空间</Tag>
              <Tag color="green">✓ 端到端学习</Tag>
              <Tag color="green">✓ 泛化能力强</Tag>
              <Tag color="blue">✓ 收敛性保证</Tag>
              <Tag color="blue">✓ 样本效率高</Tag>
            </Space>
            
            <Divider />
            
            <Title level={5}>性能指标</Title>
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <Statistic title="收敛速度" value={95} suffix="%" />
              </Col>
              <Col span={12}>
                <Statistic title="样本效率" value={87} suffix="%" />
              </Col>
              <Col span={12}>
                <Statistic title="鲁棒性" value={92} suffix="%" />
              </Col>
              <Col span={12}>
                <Statistic title="泛化能力" value={89} suffix="%" />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* 仿真控制面板 */}
      <Card title="🎮 实时仿真控制" style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col span={8}>
            <Space>
              <Button 
                type="primary" 
                icon={<PlayCircleOutlined />}
                onClick={startSimulation}
                disabled={isRunning}
              >
                开始训练
              </Button>
              <Button 
                icon={<PauseCircleOutlined />}
                onClick={stopSimulation}
                disabled={!isRunning}
              >
                暂停
              </Button>
              <Button 
                icon={<ReloadOutlined />}
                onClick={resetSimulation}
              >
                重置
              </Button>
            </Space>
          </Col>
          
          <Col span={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text>学习率: {learningRate}</Text>
                <Slider
                  min={0.0001}
                  max={0.01}
                  step={0.0001}
                  value={learningRate}
                  onChange={setLearningRate}
                />
              </div>
            </Space>
          </Col>
          
          <Col span={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text>探索率: {epsilon}</Text>
                <Slider
                  min={0.01}
                  max={1}
                  step={0.01}
                  value={epsilon}
                  onChange={setEpsilon}
                />
              </div>
            </Space>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col span={6}>
            <Statistic 
              title="当前回合" 
              value={currentEpisode} 
              suffix={isRunning ? <Badge status="processing" /> : <Badge status="default" />}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="累积奖励" 
              value={simulationData.length > 0 ? simulationData[simulationData.length - 1]?.reward.toFixed(2) : 0} 
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="准确率" 
              value={simulationData.length > 0 ? simulationData[simulationData.length - 1]?.accuracy.toFixed(1) : 0}
              suffix="%" 
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="收敛进度" 
              value={simulationData.length > 0 ? simulationData[simulationData.length - 1]?.convergenceRate.toFixed(1) : 0}
              suffix="%" 
            />
          </Col>
        </Row>
      </Card>

      {/* 实时训练曲线 */}
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="📈 奖励收敛曲线" size="small">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={simulationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="iteration" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="reward" 
                  stroke="#52c41a" 
                  strokeWidth={2}
                  name="累积奖励"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="📉 损失函数曲线" size="small">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={simulationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="iteration" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="loss" 
                  stroke="#ff4d4f" 
                  strokeWidth={2}
                  name="训练损失"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="🎯 准确率提升" size="small">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={simulationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="iteration" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#1890ff" 
                  fill="#1890ff"
                  fillOpacity={0.3}
                  name="准确率 (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="🔍 探索率衰减" size="small">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={simulationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="iteration" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="explorationRate" 
                  stroke="#722ed1" 
                  strokeWidth={2}
                  name="探索率 (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// 群体智能算法展示组件
const SwarmIntelligenceDemo: React.FC = () => {
  const [algorithm, setAlgorithm] = useState<'pso' | 'aco' | 'abc'>('pso');
  const [isRunning, setIsRunning] = useState(false);
  const [iteration, setIteration] = useState(0);
  const [particles, setParticles] = useState<any[]>([]);
  const [bestFitness, setBestFitness] = useState<number[]>([]);

  // 粒子群优化算法
  const runPSO = () => {
    // PSO算法实现逻辑
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      fitness: Math.random() * 100,
      velocity: { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 }
    }));
    setParticles(newParticles);
  };

  const algorithmInfo = {
    pso: {
      name: "粒子群优化 (PSO)",
      description: "模拟鸟群觅食行为的群体智能算法",
      formula: "v(t+1) = w*v(t) + c1*r1*(pbest - x(t)) + c2*r2*(gbest - x(t))",
      advantages: ["全局搜索能力强", "参数少易调节", "收敛速度快", "适用性广"]
    },
    aco: {
      name: "蚁群优化 (ACO)",
      description: "模拟蚂蚁觅食路径选择的优化算法",
      formula: "τ(t+1) = (1-ρ)*τ(t) + Δτ",
      advantages: ["路径优化效果好", "分布式计算", "正反馈机制", "鲁棒性强"]
    },
    abc: {
      name: "人工蜂群 (ABC)",
      description: "模拟蜜蜂采蜜行为的优化算法",
      formula: "x_new = x_old + φ*(x_old - x_neighbor)",
      advantages: ["局部搜索精度高", "自适应性强", "平衡探索利用", "简单高效"]
    }
  };

  return (
    <div>
      <Card title="🐝 群体智能算法对比" style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Select 
              value={algorithm} 
              onChange={setAlgorithm}
              style={{ width: '100%', marginBottom: '16px' }}
            >
              <Option value="pso">粒子群优化 (PSO)</Option>
              <Option value="aco">蚁群优化 (ACO)</Option>
              <Option value="abc">人工蜂群 (ABC)</Option>
            </Select>
            
            <Title level={5}>{algorithmInfo[algorithm].name}</Title>
            <Paragraph>{algorithmInfo[algorithm].description}</Paragraph>
            
            <div style={{ 
              background: algorithm === 'pso' 
                ? 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)' 
                : algorithm === 'aco' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', 
              padding: '15px', 
              borderRadius: '8px', 
              fontFamily: 'monospace',
              fontSize: '16px',
              color: 'white',
              fontWeight: 'bold',
              textAlign: 'center',
              boxShadow: algorithm === 'pso' 
                ? '0 4px 15px rgba(252, 70, 107, 0.4)'
                : algorithm === 'aco' 
                ? '0 4px 15px rgba(102, 126, 234, 0.4)'
                : '0 4px 15px rgba(17, 153, 142, 0.4)'
            }}>
              {algorithmInfo[algorithm].formula}
            </div>
          </Col>
          
          <Col span={16}>
            <Title level={5}>算法优势</Title>
            <Space wrap>
              {algorithmInfo[algorithm].advantages.map((advantage, index) => (
                <Tag key={index} color="blue">{advantage}</Tag>
              ))}
            </Space>
            
            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small">
                  <Statistic title="收敛代数" value={150} suffix="代" />
                  <Progress percent={75} size="small" />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic title="最优解精度" value={99.2} suffix="%" />
                  <Progress percent={99} size="small" strokeColor="#52c41a" />
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* 算法性能对比 */}
      <Card title="📊 性能指标对比">
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={[
            { subject: '收敛速度', PSO: 85, ACO: 70, ABC: 80, fullMark: 100 },
            { subject: '全局搜索', PSO: 90, ACO: 85, ABC: 75, fullMark: 100 },
            { subject: '局部精度', PSO: 75, ACO: 80, ABC: 90, fullMark: 100 },
            { subject: '鲁棒性', PSO: 80, ACO: 90, ABC: 85, fullMark: 100 },
            { subject: '计算效率', PSO: 85, ACO: 70, ABC: 88, fullMark: 100 },
            { subject: '参数敏感性', PSO: 70, ACO: 75, ABC: 85, fullMark: 100 }
          ]}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar name="PSO" dataKey="PSO" stroke="#1890ff" fill="#1890ff" fillOpacity={0.3} />
            <Radar name="ACO" dataKey="ACO" stroke="#52c41a" fill="#52c41a" fillOpacity={0.3} />
            <Radar name="ABC" dataKey="ABC" stroke="#fa8c16" fill="#fa8c16" fillOpacity={0.3} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

// 博弈论算法展示组件
const GameTheoryDemo: React.FC = () => {
  const [gameType, setGameType] = useState<'nash' | 'stackelberg' | 'auction'>('nash');
  const [players, setPlayers] = useState(2);
  const [iterations, setIterations] = useState(0);
  const [equilibrium, setEquilibrium] = useState<any>(null);

  const gameInfo = {
    nash: {
      name: "纳什均衡",
      description: "多智能体系统中的策略均衡点",
      application: "无人机编队协调、资源分配优化",
      complexity: "O(n^k) - 指数复杂度"
    },
    stackelberg: {
      name: "斯塔克尔伯格博弈",
      description: "领导者-跟随者层次化决策模型",
      application: "分层控制、主从协调",
      complexity: "O(n²) - 多项式复杂度"
    },
    auction: {
      name: "拍卖机制设计",
      description: "基于竞价的资源分配机制",
      application: "任务分配、频谱分配",
      complexity: "O(n log n) - 近线性复杂度"
    }
  };

  return (
    <div>
      <Card title="🎯 博弈论算法设计" style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Select 
              value={gameType} 
              onChange={setGameType}
              style={{ width: '100%', marginBottom: '16px' }}
            >
              <Option value="nash">纳什均衡</Option>
              <Option value="stackelberg">斯塔克尔伯格博弈</Option>
              <Option value="auction">拍卖机制</Option>
            </Select>
            
            <Title level={5}>{gameInfo[gameType].name}</Title>
            <Paragraph>{gameInfo[gameType].description}</Paragraph>
            
            <Space direction="vertical" style={{ width: '100%' }}>
              <div><strong>应用场景:</strong> {gameInfo[gameType].application}</div>
              <div><strong>计算复杂度:</strong> {gameInfo[gameType].complexity}</div>
            </Space>
          </Col>
          
          <Col span={12}>
            <Title level={5}>博弈矩阵</Title>
            <Table
              size="small"
              dataSource={[
                { key: '1', strategy: '合作', player1: '3,3', player2: '0,5' },
                { key: '2', strategy: '背叛', player1: '5,0', player2: '1,1' }
              ]}
              columns={[
                { title: '策略', dataIndex: 'strategy', key: 'strategy' },
                { title: '玩家1收益', dataIndex: 'player1', key: 'player1' },
                { title: '玩家2收益', dataIndex: 'player2', key: 'player2' }
              ]}
              pagination={false}
            />
            
            <Alert
              message="纳什均衡点: (背叛, 背叛)"
              description="在此策略组合下，任何玩家单方面改变策略都不会获得更高收益"
              type="success"
              style={{ marginTop: '16px' }}
            />
          </Col>
        </Row>
      </Card>

      <Card title="🏆 算法性能评估">
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card size="small">
              <Statistic 
                title="收敛时间" 
                value={2.3} 
                suffix="秒"
                prefix={<ThunderboltOutlined />}
              />
              <Progress percent={92} size="small" strokeColor="#52c41a" />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic 
                title="策略稳定性" 
                value={96.8} 
                suffix="%"
                prefix={<TrophyOutlined />}
              />
              <Progress percent={97} size="small" strokeColor="#1890ff" />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic 
                title="帕累托效率" 
                value={89.5} 
                suffix="%"
                prefix={<RocketOutlined />}
              />
              <Progress percent={90} size="small" strokeColor="#fa8c16" />
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

// 主组件
const AIAlgorithmShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState('reinforcement');

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <Card 
        title={
          <Space>
            <BulbOutlined />
            <span>AI算法创新展示平台</span>
            <Badge count="NEW" style={{ backgroundColor: '#52c41a' }} />
          </Space>
        }
        extra={
          <Space>
            <Tag color="blue">强化学习</Tag>
            <Tag color="green">群体智能</Tag>
            <Tag color="orange">博弈论</Tag>
          </Space>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
          <TabPane 
            tab={
              <Space>
                <RobotOutlined />
                <span>强化学习</span>
              </Space>
            } 
            key="reinforcement"
          >
            <ReinforcementLearningDemo />
          </TabPane>
          
          <TabPane 
            tab={
              <Space>
                <BranchesOutlined />
                <span>群体智能</span>
              </Space>
            } 
            key="swarm"
          >
            <SwarmIntelligenceDemo />
          </TabPane>
          
          <TabPane 
            tab={
              <Space>
                <TrophyOutlined />
                <span>博弈论</span>
              </Space>
            } 
            key="game"
          >
            <GameTheoryDemo />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default AIAlgorithmShowcase;