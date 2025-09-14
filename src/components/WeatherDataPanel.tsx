import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Alert, Spin, Progress, Tag } from 'antd';
import { 
  CloudOutlined, 
  ThunderboltOutlined, 
  EyeOutlined,
  DashboardOutlined,
  EnvironmentOutlined,
  WarningOutlined
} from '@ant-design/icons';

// 气象数据接口
interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  pressure: number;
  weatherCondition: string;
  uvIndex: number;
  precipitation: number;
  cloudCover: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: string;
}

// 飞行风险评估
interface FlightRisk {
  overall: number;
  windRisk: number;
  visibilityRisk: number;
  weatherRisk: number;
  recommendation: string;
}

const WeatherDataPanel: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [flightRisk, setFlightRisk] = useState<FlightRisk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 模拟获取气象数据
  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟真实气象数据
      const mockWeatherData: WeatherData = {
        temperature: 22 + Math.random() * 10,
        humidity: 45 + Math.random() * 30,
        windSpeed: Math.random() * 15,
        windDirection: Math.random() * 360,
        visibility: 8 + Math.random() * 7,
        pressure: 1010 + Math.random() * 20,
        weatherCondition: ['晴朗', '多云', '阴天', '小雨'][Math.floor(Math.random() * 4)],
        uvIndex: Math.random() * 10,
        precipitation: Math.random() * 5,
        cloudCover: Math.random() * 100,
        riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
        lastUpdated: new Date().toLocaleString('zh-CN')
      };

      setWeatherData(mockWeatherData);
      
      // 计算飞行风险
      const risk = calculateFlightRisk(mockWeatherData);
      setFlightRisk(risk);
      
    } catch (err) {
      setError('获取气象数据失败，请稍后重试');
      console.error('Weather data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 计算飞行风险
  const calculateFlightRisk = (data: WeatherData): FlightRisk => {
    // 风速风险评估
    let windRisk = 0;
    if (data.windSpeed > 12) windRisk = 90;
    else if (data.windSpeed > 8) windRisk = 60;
    else if (data.windSpeed > 5) windRisk = 30;
    else windRisk = 10;

    // 能见度风险评估
    let visibilityRisk = 0;
    if (data.visibility < 3) visibilityRisk = 85;
    else if (data.visibility < 5) visibilityRisk = 50;
    else if (data.visibility < 8) visibilityRisk = 25;
    else visibilityRisk = 5;

    // 天气条件风险评估
    let weatherRisk = 0;
    switch (data.weatherCondition) {
      case '晴朗': weatherRisk = 5; break;
      case '多云': weatherRisk = 15; break;
      case '阴天': weatherRisk = 35; break;
      case '小雨': weatherRisk = 70; break;
      default: weatherRisk = 50;
    }

    // 综合风险评估
    const overall = Math.round((windRisk + visibilityRisk + weatherRisk) / 3);
    
    let recommendation = '';
    if (overall < 25) recommendation = '✅ 飞行条件优良，建议正常执行任务';
    else if (overall < 50) recommendation = '⚠️ 飞行条件一般，建议谨慎飞行';
    else if (overall < 75) recommendation = '🚨 飞行条件较差，建议推迟任务';
    else recommendation = '❌ 飞行条件危险，严禁起飞';

    return {
      overall,
      windRisk,
      visibilityRisk,
      weatherRisk,
      recommendation
    };
  };

  // 获取风险等级颜色
  const getRiskColor = (risk: number) => {
    if (risk < 25) return '#52c41a';
    if (risk < 50) return '#faad14';
    if (risk < 75) return '#fa8c16';
    return '#f5222d';
  };

  // 获取风险等级标签
  const getRiskTag = (risk: number) => {
    if (risk < 25) return <Tag color="green">低风险</Tag>;
    if (risk < 50) return <Tag color="orange">中等风险</Tag>;
    if (risk < 75) return <Tag color="red">高风险</Tag>;
    return <Tag color="red">极高风险</Tag>;
  };

  useEffect(() => {
    fetchWeatherData();
    
    // 每5分钟更新一次数据
    const interval = setInterval(fetchWeatherData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card title="🌤️ 实时气象数据" style={{ height: '100%' }}>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16, color: '#666' }}>正在获取最新气象数据...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="🌤️ 实时气象数据" style={{ height: '100%' }}>
        <Alert
          message="数据获取失败"
          description={error}
          type="error"
          showIcon
          action={
            <button 
              onClick={fetchWeatherData}
              style={{
                background: '#1890ff',
                color: 'white',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              重试
            </button>
          }
        />
      </Card>
    );
  }

  return (
    <div style={{ height: '100%' }}>
      {/* 气象数据概览 */}
      <Card 
        title="🌤️ 实时气象数据" 
        extra={
          <span style={{ fontSize: '12px', color: '#666' }}>
            更新时间: {weatherData?.lastUpdated}
          </span>
        }
        style={{ marginBottom: 16 }}
      >
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Statistic
              title="温度"
              value={weatherData?.temperature}
              precision={1}
              suffix="°C"
              prefix={<DashboardOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="湿度"
              value={weatherData?.humidity}
              precision={0}
              suffix="%"
              prefix={<CloudOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="风速"
              value={weatherData?.windSpeed}
              precision={1}
              suffix="m/s"
              prefix={<ThunderboltOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="能见度"
              value={weatherData?.visibility}
              precision={1}
              suffix="km"
              prefix={<EyeOutlined />}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: 4 }}>天气状况</div>
              <Tag color="blue" style={{ fontSize: '14px' }}>
                {weatherData?.weatherCondition}
              </Tag>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: 4 }}>气压</div>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {weatherData?.pressure.toFixed(1)} hPa
              </span>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: 4 }}>云量</div>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {weatherData?.cloudCover.toFixed(0)}%
              </span>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 飞行风险评估 */}
      <Card title="🎯 飞行风险评估" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', marginBottom: 8 }}>综合风险指数</div>
              <Progress
                type="circle"
                percent={flightRisk?.overall}
                strokeColor={getRiskColor(flightRisk?.overall || 0)}
                format={percent => `${percent}%`}
                size={120}
              />
              <div style={{ marginTop: 8 }}>
                {getRiskTag(flightRisk?.overall || 0)}
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ padding: '0 16px' }}>
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: '14px', color: '#666' }}>风速风险:</span>
                <Progress 
                  percent={flightRisk?.windRisk} 
                  strokeColor={getRiskColor(flightRisk?.windRisk || 0)}
                  size="small"
                  style={{ marginLeft: 8 }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: '14px', color: '#666' }}>能见度风险:</span>
                <Progress 
                  percent={flightRisk?.visibilityRisk} 
                  strokeColor={getRiskColor(flightRisk?.visibilityRisk || 0)}
                  size="small"
                  style={{ marginLeft: 8 }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: '14px', color: '#666' }}>天气风险:</span>
                <Progress 
                  percent={flightRisk?.weatherRisk} 
                  strokeColor={getRiskColor(flightRisk?.weatherRisk || 0)}
                  size="small"
                  style={{ marginLeft: 8 }}
                />
              </div>
            </div>
          </Col>
        </Row>

        <Alert
          message="飞行建议"
          description={flightRisk?.recommendation}
          type={flightRisk?.overall && flightRisk.overall < 50 ? "success" : "warning"}
          showIcon
          style={{ marginTop: 16 }}
          icon={<WarningOutlined />}
        />
      </Card>

      {/* 刷新按钮 */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={fetchWeatherData}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '8px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🔄 刷新气象数据
        </button>
      </div>
    </div>
  );
};

export default WeatherDataPanel;