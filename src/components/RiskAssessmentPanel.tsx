'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Progress, Alert, Badge, Button, Space, Statistic, Timeline, Tooltip } from 'antd';
import { 
  WarningOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  ReloadOutlined,
  BarChartOutlined,
  CloudOutlined,
  BuildOutlined,
  TeamOutlined,
  ToolOutlined,
  GlobalOutlined,
  RiseOutlined
} from '@ant-design/icons';
import { BayesianRiskEngine, RiskFactor } from '../algorithms/BayesianRiskEngine';

interface RiskAssessmentPanelProps {
  droneId?: string;
  location?: {
    lat: number;
    lng: number;
    altitude: number;
  };
}

export const RiskAssessmentPanel: React.FC<RiskAssessmentPanelProps> = ({ 
  droneId = 'UAV-001',
  location = { lat: 39.9042, lng: 116.4074, altitude: 120 }
}) => {
  const [riskEngine] = useState(() => new BayesianRiskEngine());
  const [currentRisks, setCurrentRisks] = useState<Map<string, number>>(new Map());
  const [overallRisk, setOverallRisk] = useState(0);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [confidence, setConfidence] = useState(0.8);
  const [riskTrend, setRiskTrend] = useState<Array<{ timestamp: number; risk: number }>>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  // 模拟实时数据源
  const generateRealTimeFactors = (): RiskFactor => {
    const now = Date.now();
    const timeOfDay = new Date().getHours();
    
    return {
      weather: {
        windSpeed: 5 + Math.random() * 10 + (timeOfDay > 18 ? 3 : 0), // 晚上风更大
        windDirection: Math.random() * 360,
        visibility: 8 + Math.random() * 2 - (timeOfDay < 6 ? 2 : 0), // 早晨能见度差
        precipitation: Math.random() < 0.1 ? Math.random() * 2 : 0,
        temperature: 20 + Math.random() * 15,
        pressure: 1010 + Math.random() * 20
      },
      obstacles: {
        buildings: Array.from({ length: 15 }, (_, i) => ({
          id: `building_${i}`,
          height: 20 + Math.random() * 100,
          position: { 
            x: (Math.random() - 0.5) * 1000, 
            y: (Math.random() - 0.5) * 1000, 
            z: 0 
          },
          type: Math.random() > 0.5 ? 'commercial' : 'residential' as const
        })),
        powerLines: Array.from({ length: 3 }, (_, i) => ({
          id: `powerline_${i}`,
          height: 15 + Math.random() * 10,
          path: [
            { x: Math.random() * 500, y: Math.random() * 500, z: 15 },
            { x: Math.random() * 500, y: Math.random() * 500, z: 15 }
          ]
        })),
        temporaryObstacles: Math.random() > 0.7 ? [{
          id: 'temp_construction',
          type: 'construction' as const,
          position: { x: Math.random() * 200, y: Math.random() * 200, z: 0 },
          radius: 50
        }] : []
      },
      population: {
        density: 100 + Math.random() * 400 + (timeOfDay >= 8 && timeOfDay <= 18 ? 200 : 0), // 工作时间人群密度高
        events: Math.random() > 0.8 ? [{
          type: 'gathering' as const,
          location: { lat: location.lat + Math.random() * 0.01, lng: location.lng + Math.random() * 0.01 },
          intensity: Math.random() * 100
        }] : []
      },
      equipment: {
        droneId,
        batteryLevel: 60 + Math.random() * 40,
        signalStrength: 70 + Math.random() * 30,
        systemHealth: 80 + Math.random() * 20,
        sensorStatus: {
          gps: Math.random() > 0.02,
          camera: Math.random() > 0.01,
          lidar: Math.random() > 0.03,
          communication: Math.random() > 0.01
        }
      },
      airspace: {
        restrictedZones: Math.random() > 0.9 ? [{
          id: 'temp_restriction',
          type: 'emergency' as const,
          boundary: [
            { lat: location.lat + 0.005, lng: location.lng + 0.005 },
            { lat: location.lat - 0.005, lng: location.lng - 0.005 }
          ],
          altitude: { min: 0, max: 200 }
        }] : [],
        trafficDensity: Math.random() * 5 + (timeOfDay >= 7 && timeOfDay <= 19 ? 3 : 0)
      }
    };
  };

  // 更新风险评估
  const updateRiskAssessment = async () => {
    setIsUpdating(true);
    
    try {
      const factors = generateRealTimeFactors();
      const assessment = riskEngine.getRegionRisk(
        location.lat,
        location.lng,
        location.altitude,
        factors
      );

      setCurrentRisks(assessment.riskBreakdown);
      setOverallRisk(assessment.overallRisk);
      setRecommendations(assessment.recommendations);
      setConfidence(assessment.confidence);

      // 获取风险趋势 - 生成更多数据点用于预测显示
      const trend = riskEngine.predictRiskTrend(factors, 3600);
      
      // 如果趋势数据为空，生成模拟预测数据
      if (trend.length === 0) {
        const currentTime = Date.now();
        const simulatedTrend = [];
        for (let i = 0; i <= 12; i++) { // 未来1小时，每5分钟一个点
          const timeOffset = i * 5 * 60 * 1000; // 5分钟间隔
          const baseRisk = assessment.overallRisk;
          const variation = (Math.sin(i * 0.5) * 0.1) + (Math.random() - 0.5) * 0.05;
          const predictedRisk = Math.max(0, Math.min(1, baseRisk + variation));
          
          simulatedTrend.push({
            timestamp: currentTime + timeOffset,
            risk: predictedRisk
          });
        }
        setRiskTrend(simulatedTrend);
      } else {
        setRiskTrend(trend);
      }

    } catch (error) {
      console.error('风险评估更新失败:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 初始化和定时更新
  useEffect(() => {
    updateRiskAssessment();
    
    // 每30秒更新一次
    intervalRef.current = setInterval(updateRiskAssessment, 30000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [location, droneId]);

  // 获取风险等级颜色和文本
  const getRiskLevel = (risk: number) => {
    if (risk >= 0.7) return { level: 'high', color: '#FF4D4F', text: '高风险', icon: <ExclamationCircleOutlined /> };
    if (risk >= 0.4) return { level: 'medium', color: '#FAAD14', text: '中风险', icon: <WarningOutlined /> };
    if (risk >= 0.2) return { level: 'low', color: '#1890FF', text: '低风险', icon: <WarningOutlined /> };
    return { level: 'safe', color: '#52C41A', text: '安全', icon: <CheckCircleOutlined /> };
  };

  const overallRiskInfo = getRiskLevel(overallRisk);

  // 风险类型图标映射
  const riskIcons = {
    weather: <CloudOutlined />,
    obstacle: <BuildOutlined />,
    population: <TeamOutlined />,
    equipment: <ToolOutlined />,
    airspace: <GlobalOutlined />
  };

  // 风险类型名称映射
  const riskNames = {
    weather: '天气风险',
    obstacle: '障碍物风险',
    population: '人群密度风险',
    equipment: '设备状态风险',
    airspace: '空域管制风险'
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'auto' }}>
      {/* 综合风险评估 */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#1890FF', fontWeight: 'bold', fontSize: '14px' }}>
              🧠 智能风险评估 - {droneId}
            </span>
            <Button 
              icon={<ReloadOutlined />} 
              size="small" 
              loading={isUpdating}
              onClick={updateRiskAssessment}
            >
              刷新
            </Button>
          </div>
        }
        className="glass-panel glow-blue"
        size="small"
        bodyStyle={{ padding: '12px' }}
      >
        <Row gutter={[12, 12]}>
          <Col span={24}>
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: 'bold', 
                color: overallRiskInfo.color,
                textShadow: `0 0 15px ${overallRiskInfo.color}`,
                marginBottom: '6px'
              }}>
                {Math.round(overallRisk * 100)}%
              </div>
              <Badge 
                color={overallRiskInfo.color} 
                text={
                  <span style={{ 
                    color: overallRiskInfo.color, 
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}>
                    {overallRiskInfo.icon} {overallRiskInfo.text}
                  </span>
                } 
              />
            </div>
          </Col>
          <Col span={8}>
            <Statistic
              title="置信度"
              value={Math.round(confidence * 100)}
              suffix="%"
              valueStyle={{ color: confidence > 0.8 ? '#52C41A' : '#FAAD14', fontSize: '16px' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="飞行高度"
              value={location.altitude}
              suffix="m"
              valueStyle={{ fontSize: '16px', color: '#1890FF' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="更新时间"
              value={new Date().toLocaleTimeString()}
              valueStyle={{ fontSize: '12px', color: '#8C8C8C' }}
            />
          </Col>
        </Row>

        {/* 风险警报 */}
        {overallRisk >= 0.4 && (
          <Alert
            message="风险警告"
            description={`当前区域风险等级为${overallRiskInfo.text}，建议谨慎操作或调整飞行计划。`}
            type={overallRisk >= 0.7 ? 'error' : 'warning'}
            showIcon
            style={{ marginTop: '16px' }}
          />
        )}
      </Card>

      {/* 详细风险分析 */}
      <Card 
        title="📊 风险因子分析" 
        className="glass-panel glow-blue"
        size="small"
        bodyStyle={{ padding: '12px' }}
      >
        <Row gutter={[8, 8]}>
          {Array.from(currentRisks.entries())
            .filter(([type]) => type !== 'overall')
            .map(([type, risk]) => {
              const riskInfo = getRiskLevel(risk);
              return (
                <Col span={24} key={type}>
                  <div className="data-card" style={{ padding: '8px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      marginBottom: '6px'
                    }}>
                      <Space size="small">
                        {riskIcons[type as keyof typeof riskIcons]}
                        <span style={{ fontSize: '11px', color: 'white' }}>
                          {riskNames[type as keyof typeof riskNames]}
                        </span>
                      </Space>
                      <span style={{ fontSize: '11px', color: riskInfo.color, fontWeight: 'bold' }}>
                        {Math.round(risk * 100)}%
                      </span>
                    </div>
                    <Progress
                      percent={Math.round(risk * 100)}
                      strokeColor={{
                        '0%': riskInfo.color,
                        '100%': riskInfo.color,
                      }}
                      size="small"
                      showInfo={false}
                    />
                  </div>
                </Col>
              );
            })}
        </Row>
      </Card>

      {/* 智能建议 */}
      {recommendations.length > 0 && (
        <Card 
          title="💡 智能建议" 
          className="glass-panel glow-orange"
          size="small"
          bodyStyle={{ padding: '12px' }}
        >
          <Timeline
            items={recommendations.slice(0, 3).map((rec, index) => ({
              color: index === 0 ? '#FF4D4F' : index === 1 ? '#FAAD14' : '#1890FF',
              children: (
                <div style={{ fontSize: '11px', color: 'white', lineHeight: '1.4' }}>
                  {rec}
                </div>
              )
            }))}
          />
        </Card>
      )}

      {/* 风险趋势预测 */}
      <Card 
        title={
          <Space size="small">
            <RiseOutlined />
            <span style={{ fontSize: '12px' }}>风险趋势预测（未来1小时）</span>
          </Space>
        }
        className="glass-panel glow-blue"
        size="small"
        bodyStyle={{ padding: '12px' }}
      >
        <div style={{ height: '140px', position: 'relative' }}>
          <svg width="100%" height="100%" style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '6px', border: '1px solid rgba(24,144,255,0.3)' }}>
            {/* 背景网格 */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(24,144,255,0.1)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* 绘制趋势线 */}
            {riskTrend.length > 1 && (
              <>
                {/* 渐变填充区域 */}
                <defs>
                  <linearGradient id="riskGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1890FF" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#1890FF" stopOpacity="0.1"/>
                  </linearGradient>
                </defs>
                <polygon
                  fill="url(#riskGradient)"
                  points={`0,100 ${riskTrend.map((point, index) => {
                    const x = (index / (riskTrend.length - 1)) * 100;
                    const y = 100 - (point.risk * 80);
                    return `${x},${y}`;
                  }).join(' ')} 100,100`}
                />
                
                {/* 趋势线 */}
                <polyline
                  fill="none"
                  stroke="#1890FF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  points={riskTrend.map((point, index) => {
                    const x = (index / (riskTrend.length - 1)) * 100;
                    const y = 100 - (point.risk * 80);
                    return `${x},${y}`;
                  }).join(' ')}
                />
              </>
            )}
            
            {/* 绘制数据点 */}
            {riskTrend.map((point, index) => {
              const x = (index / (riskTrend.length - 1)) * 100;
              const y = 100 - (point.risk * 80);
              const riskInfo = getRiskLevel(point.risk);
              
              return (
                <g key={index}>
                  <circle
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="4"
                    fill={riskInfo.color}
                    stroke="white"
                    strokeWidth="2"
                    opacity="0.9"
                  />
                  {/* 数据点光晕效果 */}
                  <circle
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="8"
                    fill={riskInfo.color}
                    opacity="0.2"
                  />
                </g>
              );
            })}
            
            {/* 风险等级参考线 */}
            <line x1="0%" y1="20%" x2="100%" y2="20%" stroke="#FF4D4F" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
            <line x1="0%" y1="40%" x2="100%" y2="40%" stroke="#FAAD14" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
            <line x1="0%" y1="60%" x2="100%" y2="60%" stroke="#1890FF" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
            
            {/* Y轴标签 */}
            <text x="5" y="25" fill="#FF4D4F" fontSize="8" opacity="0.8">高</text>
            <text x="5" y="45" fill="#FAAD14" fontSize="8" opacity="0.8">中</text>
            <text x="5" y="65" fill="#1890FF" fontSize="8" opacity="0.8">低</text>
          </svg>
          
          {/* 当前风险值显示 */}
          <div style={{ 
            position: 'absolute', 
            top: '8px', 
            right: '8px', 
            background: 'rgba(0,0,0,0.7)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            color: overallRiskInfo.color,
            fontWeight: 'bold',
            border: `1px solid ${overallRiskInfo.color}`
          }}>
            当前: {Math.round(overallRisk * 100)}%
          </div>
          
          {/* 时间轴标签 */}
          <div style={{ 
            position: 'absolute', 
            bottom: '4px', 
            left: '8px', 
            fontSize: '8px',
            color: '#8C8C8C'
          }}>
            现在
          </div>
          <div style={{ 
            position: 'absolute', 
            bottom: '4px', 
            right: '8px', 
            fontSize: '8px',
            color: '#8C8C8C'
          }}>
            +1小时
          </div>
        </div>
        
        {/* 预测摘要 */}
        <div style={{ 
          marginTop: '8px', 
          padding: '6px', 
          background: 'rgba(24,144,255,0.1)', 
          borderRadius: '4px',
          fontSize: '10px',
          color: '#8C8C8C'
        }}>
          {riskTrend.length > 0 && (
            <>
              预测趋势: {riskTrend[riskTrend.length - 1]?.risk > overallRisk ? 
                <span style={{ color: '#FF4D4F' }}>⬆️ 风险上升</span> : 
                <span style={{ color: '#52C41A' }}>⬇️ 风险下降</span>
              } | 
              最高风险: <span style={{ color: '#FAAD14' }}>
                {Math.round(Math.max(...riskTrend.map(t => t.risk)) * 100)}%
              </span>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};