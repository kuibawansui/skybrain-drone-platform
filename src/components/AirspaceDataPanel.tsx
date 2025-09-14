import React, { useState, useEffect } from 'react';
import { Card, Row, Col, List, Badge, Alert, Tag, Tooltip, Progress } from 'antd';
import { 
  RadarChartOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  AimOutlined
} from '@ant-design/icons';

// 空域限制类型
interface AirspaceRestriction {
  id: string;
  type: 'no_fly' | 'restricted' | 'controlled' | 'warning';
  name: string;
  coordinates: [number, number][];
  altitude: {
    min: number;
    max: number;
  };
  timeRestriction?: {
    start: string;
    end: string;
  };
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
}

// 空中交通信息
interface AirTraffic {
  id: string;
  type: 'commercial' | 'military' | 'drone' | 'helicopter';
  callSign: string;
  altitude: number;
  speed: number;
  heading: number;
  position: [number, number];
  distance: number;
  riskLevel: number;
}

// 空域状态
interface AirspaceStatus {
  overallSafety: number;
  activeRestrictions: number;
  nearbyTraffic: number;
  weatherImpact: number;
  recommendedAltitude: {
    min: number;
    max: number;
  };
  lastUpdated: string;
}

const AirspaceDataPanel: React.FC = () => {
  const [restrictions, setRestrictions] = useState<AirspaceRestriction[]>([]);
  const [airTraffic, setAirTraffic] = useState<AirTraffic[]>([]);
  const [airspaceStatus, setAirspaceStatus] = useState<AirspaceStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // 模拟获取空域数据
  const fetchAirspaceData = async () => {
    try {
      setLoading(true);
      
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 模拟空域限制数据
      const mockRestrictions: AirspaceRestriction[] = [
        {
          id: 'nfz_001',
          type: 'no_fly',
          name: '机场禁飞区',
          coordinates: [[116.4074, 39.9042], [116.4174, 39.9142]],
          altitude: { min: 0, max: 1000 },
          description: '首都国际机场5公里禁飞区域',
          severity: 'critical',
          isActive: true
        },
        {
          id: 'rz_002',
          type: 'restricted',
          name: '军事管制区',
          coordinates: [[116.3074, 39.8042], [116.3174, 39.8142]],
          altitude: { min: 0, max: 500 },
          timeRestriction: { start: '08:00', end: '18:00' },
          description: '工作时间内限制飞行',
          severity: 'high',
          isActive: true
        },
        {
          id: 'wz_003',
          type: 'warning',
          name: '人口密集区',
          coordinates: [[116.5074, 39.7042], [116.5174, 39.7142]],
          altitude: { min: 0, max: 120 },
          description: '建议避开人群聚集区域',
          severity: 'medium',
          isActive: true
        }
      ];

      // 模拟空中交通数据
      const mockAirTraffic: AirTraffic[] = [
        {
          id: 'ca1234',
          type: 'commercial',
          callSign: 'CA1234',
          altitude: 8000,
          speed: 450,
          heading: 270,
          position: [116.4074, 39.9042],
          distance: 12.5,
          riskLevel: 15
        },
        {
          id: 'mil_001',
          type: 'military',
          callSign: 'MIL001',
          altitude: 3000,
          speed: 300,
          heading: 180,
          position: [116.3074, 39.8042],
          distance: 8.2,
          riskLevel: 35
        },
        {
          id: 'drone_05',
          type: 'drone',
          callSign: 'DRONE05',
          altitude: 150,
          speed: 25,
          heading: 90,
          position: [116.4574, 39.9542],
          distance: 2.1,
          riskLevel: 60
        }
      ];

      // 计算空域状态
      const status: AirspaceStatus = {
        overallSafety: 75,
        activeRestrictions: mockRestrictions.filter(r => r.isActive).length,
        nearbyTraffic: mockAirTraffic.length,
        weatherImpact: 25,
        recommendedAltitude: { min: 80, max: 120 },
        lastUpdated: new Date().toLocaleString('zh-CN')
      };

      setRestrictions(mockRestrictions);
      setAirTraffic(mockAirTraffic);
      setAirspaceStatus(status);
      
    } catch (error) {
      console.error('获取空域数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取限制类型图标和颜色
  const getRestrictionStyle = (type: string, severity: string) => {
    const styles = {
      no_fly: { icon: <WarningOutlined />, color: '#f5222d', text: '禁飞区' },
      restricted: { icon: <ClockCircleOutlined />, color: '#fa8c16', text: '限制区' },
      controlled: { icon: <RadarChartOutlined />, color: '#1890ff', text: '管制区' },
      warning: { icon: <EnvironmentOutlined />, color: '#faad14', text: '警告区' }
    };
    return styles[type as keyof typeof styles] || styles.warning;
  };

  // 获取交通类型图标
  const getTrafficIcon = (type: string) => {
    const icons = {
      commercial: '✈️',
      military: '🚁',
      drone: '🚁',
      helicopter: '🚁'
    };
    return icons[type as keyof typeof icons] || '✈️';
  };

  // 获取风险等级颜色
  const getRiskColor = (risk: number) => {
    if (risk < 25) return '#52c41a';
    if (risk < 50) return '#faad14';
    if (risk < 75) return '#fa8c16';
    return '#f5222d';
  };

  useEffect(() => {
    fetchAirspaceData();
    
    // 每3分钟更新一次空域数据
    const interval = setInterval(fetchAirspaceData, 3 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card title="🛩️ 空域管制信息" style={{ height: '100%' }}>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <RadarChartOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          <p style={{ marginTop: 16, color: '#666' }}>正在获取空域管制数据...</p>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ height: '100%' }}>
      {/* 空域状态概览 */}
      <Card 
        title="🛩️ 空域安全状态" 
        extra={
          <span style={{ fontSize: '12px', color: '#666' }}>
            更新: {airspaceStatus?.lastUpdated}
          </span>
        }
        style={{ marginBottom: 16 }}
      >
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={airspaceStatus?.overallSafety}
                strokeColor={getRiskColor(100 - (airspaceStatus?.overallSafety || 0))}
                format={percent => `${percent}%`}
                size={80}
              />
              <div style={{ marginTop: 8, fontSize: '14px', color: '#666' }}>
                整体安全度
              </div>
            </div>
          </Col>
          <Col span={16}>
            <Row gutter={[16, 8]}>
              <Col span={12}>
                <div style={{ padding: '8px', background: '#f0f2f5', borderRadius: '6px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fa8c16' }}>
                    {airspaceStatus?.activeRestrictions}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>活跃限制区</div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ padding: '8px', background: '#f0f2f5', borderRadius: '6px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
                    {airspaceStatus?.nearbyTraffic}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>附近航空器</div>
                </div>
              </Col>
              <Col span={24}>
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: '12px', color: '#666' }}>建议飞行高度: </span>
                  <Tag color="green">
                    {airspaceStatus?.recommendedAltitude.min}m - {airspaceStatus?.recommendedAltitude.max}m
                  </Tag>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* 空域限制列表 */}
      <Card title="⚠️ 空域限制区域" style={{ marginBottom: 16 }}>
        <List
          size="small"
          dataSource={restrictions}
          renderItem={(item) => {
            const style = getRestrictionStyle(item.type, item.severity);
            return (
              <List.Item>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ color: style.color, marginRight: 8 }}>
                        {style.icon}
                      </span>
                      <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                      <Tag color={style.color} size="small" style={{ marginLeft: 8 }}>
                        {style.text}
                      </Tag>
                    </div>
                    <Badge 
                      status={item.isActive ? "processing" : "default"} 
                      text={item.isActive ? "活跃" : "非活跃"}
                    />
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                    {item.description} | 高度限制: {item.altitude.min}-{item.altitude.max}m
                    {item.timeRestriction && (
                      <span> | 时间: {item.timeRestriction.start}-{item.timeRestriction.end}</span>
                    )}
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
      </Card>

      {/* 空中交通信息 */}
      <Card title="✈️ 附近空中交通" style={{ marginBottom: 16 }}>
        <List
          size="small"
          dataSource={airTraffic}
          renderItem={(item) => (
            <List.Item>
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '16px', marginRight: 8 }}>
                      {getTrafficIcon(item.type)}
                    </span>
                    <span style={{ fontWeight: 'bold' }}>{item.callSign}</span>
                    <Tag size="small" style={{ marginLeft: 8 }}>
                      {item.type === 'commercial' ? '民航' : 
                       item.type === 'military' ? '军用' : 
                       item.type === 'drone' ? '无人机' : '直升机'}
                    </Tag>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Tooltip title={`风险等级: ${item.riskLevel}%`}>
                      <Progress 
                        percent={item.riskLevel} 
                        strokeColor={getRiskColor(item.riskLevel)}
                        size="small"
                        style={{ width: 60, marginRight: 8 }}
                      />
                    </Tooltip>
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      {item.distance.toFixed(1)}km
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                  高度: {item.altitude}m | 速度: {item.speed}km/h | 航向: {item.heading}°
                </div>
              </div>
            </List.Item>
          )}
        />
      </Card>

      {/* 安全建议 */}
      <Alert
        message="空域安全建议"
        description={
          <div>
            <p>• 建议在{airspaceStatus?.recommendedAltitude.min}-{airspaceStatus?.recommendedAltitude.max}米高度飞行</p>
            <p>• 避开所有禁飞区和限制区域</p>
            <p>• 与其他航空器保持安全距离</p>
            <p>• 实时监控空域变化，随时准备调整航线</p>
          </div>
        }
        type="info"
        showIcon
        icon={<AimOutlined />}
      />
    </div>
  );
};

export default AirspaceDataPanel;