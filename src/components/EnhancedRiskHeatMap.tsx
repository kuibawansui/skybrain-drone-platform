'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, Select, Slider, Space, Button, Row, Col, Statistic, Badge } from 'antd';
import { 
  ReloadOutlined, 
  DownloadOutlined, 
  EyeOutlined,
  WarningOutlined,
  FireOutlined,
  CloudOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';

const { Option } = Select;

export const EnhancedRiskHeatMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [timeRange, setTimeRange] = useState(60);
  const [riskType, setRiskType] = useState('all');
  const [isAnimating, setIsAnimating] = useState(true);
  const [riskStats, setRiskStats] = useState({
    highRisk: 3,
    mediumRisk: 8,
    lowRisk: 15,
    safeZones: 24
  });

  // 风险区域数据
  const riskZones = [
    { id: 1, name: 'CBD核心区', level: 'high', x: 200, y: 150, radius: 60, type: 'weather' },
    { id: 2, name: '机场周边', level: 'high', x: 600, y: 100, radius: 80, type: 'restricted' },
    { id: 3, name: '居民区A', level: 'medium', x: 150, y: 250, radius: 45, type: 'population' },
    { id: 4, name: '工业园区', level: 'medium', x: 500, y: 280, radius: 55, type: 'obstacle' },
    { id: 5, name: '公园绿地', level: 'low', x: 350, y: 200, radius: 70, type: 'safe' },
    { id: 6, name: '强风区域', level: 'high', x: 400, y: 120, radius: 40, type: 'weather' },
  ];

  // 生成动态热力图
  const generateHeatMap = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 创建渐变背景
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, 'rgba(10, 22, 40, 0.8)');
    bgGradient.addColorStop(1, 'rgba(26, 35, 50, 0.8)');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 绘制网格
    ctx.strokeStyle = 'rgba(24, 144, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 绘制风险区域 - 根据选择的风险类型过滤
    const filteredZones = riskType === 'all' ? riskZones : riskZones.filter(zone => zone.type === riskType);
    
    filteredZones.forEach((zone, index) => {
      const animationOffset = Math.sin(time * 0.002 + index) * 10;
      const currentRadius = zone.radius + animationOffset;
      
      // 根据风险类型调整颜色强度
      const typeIntensity = riskType === 'all' ? 1 : 1.5; // 单一类型时增强显示
      
      // 风险等级颜色
      let colors = {
        high: [`rgba(255, 77, 79, ${0.6 * typeIntensity})`, `rgba(255, 77, 79, ${0.1 * typeIntensity})`],
        medium: [`rgba(250, 173, 20, ${0.5 * typeIntensity})`, `rgba(250, 173, 20, ${0.1 * typeIntensity})`],
        low: [`rgba(82, 196, 26, ${0.4 * typeIntensity})`, `rgba(82, 196, 26, ${0.1 * typeIntensity})`]
      };

      const zoneColors = colors[zone.level as keyof typeof colors];
      
      // 创建径向渐变
      const gradient = ctx.createRadialGradient(
        zone.x, zone.y, 0,
        zone.x, zone.y, currentRadius
      );
      gradient.addColorStop(0, zoneColors[0]);
      gradient.addColorStop(1, zoneColors[1]);

      // 绘制风险区域
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(zone.x, zone.y, currentRadius, 0, Math.PI * 2);
      ctx.fill();

      // 绘制边界
      ctx.strokeStyle = zoneColors[0];
      ctx.lineWidth = 2;
      ctx.stroke();

      // 绘制中心点
      ctx.fillStyle = zoneColors[0];
      ctx.beginPath();
      ctx.arc(zone.x, zone.y, 3, 0, Math.PI * 2);
      ctx.fill();

      // 绘制标签
      ctx.fillStyle = 'white';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(zone.name, zone.x, zone.y - currentRadius - 10);
      
      // 绘制风险等级标识
      const levelText = zone.level === 'high' ? '高风险' : 
                       zone.level === 'medium' ? '中风险' : '低风险';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillStyle = zoneColors[0];
      ctx.fillText(levelText, zone.x, zone.y - currentRadius + 5);
    });

    // 绘制无人机位置
    const dronePositions = [
      { x: 300, y: 180, status: 'normal' },
      { x: 450, y: 220, status: 'warning' },
      { x: 180, y: 120, status: 'normal' },
      { x: 520, y: 160, status: 'emergency' },
      { x: 380, y: 280, status: 'normal' },
    ];

    dronePositions.forEach((drone, index) => {
      const pulse = Math.sin(time * 0.005 + index * 0.5) * 0.5 + 0.5;
      
      let color = drone.status === 'emergency' ? '#FF4D4F' :
                  drone.status === 'warning' ? '#FAAD14' : '#52C41A';
      
      // 绘制无人机光晕
      const haloGradient = ctx.createRadialGradient(
        drone.x, drone.y, 0,
        drone.x, drone.y, 15 + pulse * 5
      );
      haloGradient.addColorStop(0, `${color}80`);
      haloGradient.addColorStop(1, `${color}00`);
      
      ctx.fillStyle = haloGradient;
      ctx.beginPath();
      ctx.arc(drone.x, drone.y, 15 + pulse * 5, 0, Math.PI * 2);
      ctx.fill();

      // 绘制无人机图标
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(drone.x, drone.y, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制无人机编号
      ctx.fillStyle = 'white';
      ctx.font = '8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`UAV-${index + 1}`, drone.x, drone.y - 20);
    });

    // 绘制图例
    const legendX = width - 150;
    const legendY = 20;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(legendX - 10, legendY - 10, 140, 100);
    
    ctx.strokeStyle = 'rgba(24, 144, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX - 10, legendY - 10, 140, 100);
    
    const legendItems = [
      { color: 'rgba(255, 77, 79, 0.8)', text: '高风险区域' },
      { color: 'rgba(250, 173, 20, 0.8)', text: '中风险区域' },
      { color: 'rgba(82, 196, 26, 0.8)', text: '低风险区域' },
    ];
    
    legendItems.forEach((item, index) => {
      const y = legendY + index * 20;
      
      ctx.fillStyle = item.color;
      ctx.fillRect(legendX, y, 12, 12);
      
      ctx.fillStyle = 'white';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(item.text, legendX + 20, y + 9);
    });
  };

  // 动画循环 - 添加风险类型变化时的重新渲染
  useEffect(() => {
    if (!isAnimating) return;

    const animate = (time: number) => {
      generateHeatMap(time);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, riskType, timeRange]);

  // 风险类型变化时立即更新统计数据和重新渲染
  useEffect(() => {
    const filteredZones = riskType === 'all' ? riskZones : riskZones.filter(zone => zone.type === riskType);
    
    // 更新风险统计
    const newStats = {
      highRisk: filteredZones.filter(zone => zone.level === 'high').length,
      mediumRisk: filteredZones.filter(zone => zone.level === 'medium').length,
      lowRisk: filteredZones.filter(zone => zone.level === 'low').length,
      safeZones: Math.max(0, 24 - filteredZones.length)
    };
    
    setRiskStats(newStats);
    
    // 立即重新渲染热力图
    if (canvasRef.current) {
      generateHeatMap(Date.now());
    }
  }, [riskType]);

  // 初始化画布
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 800;
      canvas.height = 400;
      generateHeatMap(0);
    }
  }, []);

  const getRiskTypeIcon = (type: string) => {
    switch (type) {
      case 'weather': return <CloudOutlined />;
      case 'obstacle': return <WarningOutlined />;
      case 'population': return <FireOutlined />;
      case 'restricted': return <ThunderboltOutlined />;
      default: return <EyeOutlined />;
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 控制面板 */}
      <div style={{ 
        padding: '16px', 
        background: 'rgba(0, 0, 0, 0.3)', 
        borderBottom: '1px solid rgba(24, 144, 255, 0.3)',
        borderRadius: '12px 12px 0 0'
      }}>
        <Row gutter={[16, 8]} align="middle">
          <Col span={6}>
            <div>
              <label style={{ color: 'white', fontSize: '12px', marginBottom: '4px', display: 'block' }}>
                风险类型
              </label>
              <Select
                value={riskType}
                onChange={setRiskType}
                size="small"
                style={{ width: '100%' }}
              >
                <Option value="all">🌐 全部风险</Option>
                <Option value="weather">🌤️ 天气风险</Option>
                <Option value="obstacle">🏢 障碍物风险</Option>
                <Option value="population">👥 人群密度</Option>
                <Option value="restricted">🚫 禁飞区域</Option>
              </Select>
            </div>
          </Col>
          
          <Col span={6}>
            <div>
              <label style={{ color: 'white', fontSize: '12px', marginBottom: '4px', display: 'block' }}>
                时间范围: {timeRange}分钟
              </label>
              <Slider
                min={15}
                max={180}
                value={timeRange}
                onChange={setTimeRange}
                trackStyle={{ backgroundColor: '#1890FF' }}
                handleStyle={{ borderColor: '#1890FF' }}
              />
            </div>
          </Col>
          
          <Col span={6}>
            <Space>
              <Button
                type={isAnimating ? 'primary' : 'default'}
                size="small"
                onClick={() => setIsAnimating(!isAnimating)}
              >
                {isAnimating ? '⏸️ 暂停' : '▶️ 播放'}
              </Button>
              <Button icon={<ReloadOutlined />} size="small">
                刷新
              </Button>
              <Button icon={<DownloadOutlined />} size="small">
                导出
              </Button>
            </Space>
          </Col>
          
          <Col span={6}>
            <Row gutter={8}>
              <Col span={12}>
                <Statistic
                  title="高风险区"
                  value={riskStats.highRisk}
                  valueStyle={{ fontSize: '16px', color: '#FF4D4F' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="安全区域"
                  value={riskStats.safeZones}
                  valueStyle={{ fontSize: '16px', color: '#52C41A' }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </div>

      {/* 热力图画布 */}
      <div style={{ 
        flex: 1, 
        position: 'relative',
        background: 'linear-gradient(135deg, #0a1628 0%, #1a2332 100%)',
        borderRadius: '0 0 12px 12px',
        overflow: 'hidden'
      }}>
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            border: '2px solid rgba(24, 144, 255, 0.3)',
            borderRadius: '8px'
          }}
        />
        
        {/* 实时风险警报覆盖层 */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '12px',
          borderRadius: '8px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 77, 79, 0.3)'
        }}>
          <div style={{ color: '#FF4D4F', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
            🚨 实时风险警报
          </div>
          <div style={{ fontSize: '10px', color: 'white', lineHeight: '1.4' }}>
            <div>• CBD核心区检测到强风</div>
            <div>• 机场周边限制飞行</div>
            <div>• UAV-004 进入高风险区域</div>
          </div>
        </div>

        {/* 风险统计覆盖层 */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '12px',
          borderRadius: '8px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(24, 144, 255, 0.3)'
        }}>
          <Row gutter={16}>
            <Col>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#FF4D4F', fontSize: '18px', fontWeight: 'bold' }}>
                  {riskStats.highRisk}
                </div>
                <div style={{ color: '#8C8C8C', fontSize: '10px' }}>高风险</div>
              </div>
            </Col>
            <Col>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#FAAD14', fontSize: '18px', fontWeight: 'bold' }}>
                  {riskStats.mediumRisk}
                </div>
                <div style={{ color: '#8C8C8C', fontSize: '10px' }}>中风险</div>
              </div>
            </Col>
            <Col>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#52C41A', fontSize: '18px', fontWeight: 'bold' }}>
                  {riskStats.lowRisk}
                </div>
                <div style={{ color: '#8C8C8C', fontSize: '10px' }}>低风险</div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};