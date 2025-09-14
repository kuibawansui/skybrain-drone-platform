'use client';

import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html, Environment, Stars, Line } from '@react-three/drei';
import { Button, Space, Slider, Badge, Card, Row, Col, Switch, Tooltip } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  ReloadOutlined,
  FullscreenOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ThunderboltOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import * as THREE from 'three';
import { useWebSocket } from '../../hooks/useWebSocket';

// 风险数据接口
interface RiskData {
  overallRisk: number;
  riskBreakdown: {
    weather: number;
    obstacle: number;
    population: number;
    equipment: number;
    airspace: number;
  };
  riskZones?: Array<{
    position: [number, number, number];
    radius: number;
    riskLevel: number;
    type: string;
  }>;
}

// 无人机数据接口
interface DroneData {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  status: 'active' | 'inactive' | 'warning' | 'emergency';
  battery: number;
  signal: number;
  speed: number;
  altitude: number;
  riskLevel: number;
  flightPath?: [number, number, number][];
}

// 风险热力图组件
const RiskHeatMap: React.FC<{ riskZones: RiskData['riskZones']; visible: boolean }> = ({ 
  riskZones = [], 
  visible 
}) => {
  if (!visible || !riskZones.length) return null;

  return (
    <group>
      {riskZones.map((zone, index) => {
        const color = zone.riskLevel > 0.7 ? '#FF4D4F' : 
                     zone.riskLevel > 0.4 ? '#FAAD14' : '#1890FF';
        
        return (
          <mesh key={index} position={zone.position}>
            <sphereGeometry args={[zone.radius, 16, 16]} />
            <meshBasicMaterial 
              color={color}
              transparent
              opacity={0.2 + zone.riskLevel * 0.3}
              side={THREE.DoubleSide}
            />
            {/* 风险区域边界 */}
            <mesh>
              <ringGeometry args={[zone.radius * 0.95, zone.radius, 32]} />
              <meshBasicMaterial 
                color={color}
                transparent
                opacity={0.6}
                side={THREE.DoubleSide}
              />
            </mesh>
          </mesh>
        );
      })}
    </group>
  );
};

// 增强的无人机组件
const EnhancedDrone: React.FC<{ 
  drone: DroneData;
  showPath: boolean;
  showInfo: boolean;
}> = ({ drone, showPath, showInfo }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [animationPhase, setAnimationPhase] = useState(0);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      
      // 根据状态调整动画
      if (drone.status === 'active') {
        meshRef.current.rotation.y += 0.02;
        meshRef.current.position.y = drone.position[1] + Math.sin(time * 3) * 0.05;
      } else if (drone.status === 'warning') {
        meshRef.current.rotation.y += 0.04;
        meshRef.current.position.y = drone.position[1] + Math.sin(time * 6) * 0.1;
      } else if (drone.status === 'emergency') {
        meshRef.current.rotation.y += 0.08;
        meshRef.current.position.y = drone.position[1] + Math.sin(time * 10) * 0.2;
      }
      
      meshRef.current.position.x = drone.position[0];
      meshRef.current.position.z = drone.position[2];
    }
  });

  // 状态颜色映射
  const getStatusColor = () => {
    switch (drone.status) {
      case 'active': return '#00ff88';
      case 'warning': return '#FAAD14';
      case 'emergency': return '#FF4D4F';
      default: return '#00aaff';
    }
  };

  const statusColor = getStatusColor();

  return (
    <group>
      {/* 飞行路径 */}
      {showPath && drone.flightPath && drone.flightPath.length > 1 && (
        <Line
          points={drone.flightPath}
          color={statusColor}
          lineWidth={2}
          transparent
          opacity={0.6}
        />
      )}

      {/* 无人机主体 */}
      <group ref={meshRef} position={drone.position}>
        {/* 主体框架 */}
        <mesh>
          <boxGeometry args={[0.8, 0.15, 0.8]} />
          <meshStandardMaterial 
            color={statusColor}
            emissive={statusColor}
            emissiveIntensity={0.3}
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>

        {/* 螺旋桨臂 */}
        {[[-0.4, 0, -0.4], [0.4, 0, -0.4], [-0.4, 0, 0.4], [0.4, 0, 0.4]].map((pos, i) => (
          <group key={i}>
            {/* 螺旋桨电机 */}
            <mesh position={pos as [number, number, number]}>
              <cylinderGeometry args={[0.08, 0.08, 0.1]} />
              <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* 螺旋桨 */}
            <mesh position={[pos[0], pos[1] + 0.08, pos[2]]}>
              <cylinderGeometry args={[0.15, 0.15, 0.02]} />
              <meshStandardMaterial 
                color="#666666" 
                transparent 
                opacity={drone.status === 'active' ? 0.3 : 0.8}
              />
            </mesh>
          </group>
        ))}

        {/* 状态指示灯 */}
        <mesh position={[0, 0.12, 0]}>
          <sphereGeometry args={[0.05]} />
          <meshStandardMaterial 
            color={statusColor}
            emissive={statusColor}
            emissiveIntensity={1.0}
          />
        </mesh>

        {/* 摄像头 */}
        <mesh position={[0, -0.1, 0.3]}>
          <sphereGeometry args={[0.06]} />
          <meshStandardMaterial color="#222222" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* 风险等级指示环 */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
          <ringGeometry args={[0.5, 0.55, 32]} />
          <meshBasicMaterial 
            color={drone.riskLevel > 0.7 ? '#FF4D4F' : drone.riskLevel > 0.4 ? '#FAAD14' : '#52C41A'}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* 信息面板 */}
        {showInfo && (
          <Html position={[0, 0.8, 0]} center>
            <div style={{
              background: 'rgba(0, 0, 0, 0.9)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '10px',
              whiteSpace: 'nowrap',
              border: `2px solid ${statusColor}`,
              boxShadow: `0 0 10px ${statusColor}50`,
              minWidth: '120px'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px', color: statusColor }}>
                {drone.id}
              </div>
              <div>电量: {drone.battery}%</div>
              <div>信号: {drone.signal}%</div>
              <div>速度: {drone.speed.toFixed(1)} m/s</div>
              <div>高度: {drone.altitude.toFixed(1)} m</div>
              <div>风险: {Math.round(drone.riskLevel * 100)}%</div>
            </div>
          </Html>
        )}
      </group>
    </group>
  );
};

// 城市建筑组件
const CityBuilding: React.FC<{ 
  position: [number, number, number]; 
  height: number; 
  color: string;
  riskLevel?: number;
}> = ({ position, height, color, riskLevel = 0 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && meshRef.current.material) {
      const time = state.clock.getElapsedTime();
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      
      // 根据风险等级调整发光强度
      const baseIntensity = 0.1;
      const riskIntensity = riskLevel * 0.3;
      const pulseIntensity = Math.sin(time * 2) * 0.1;
      
      material.emissiveIntensity = baseIntensity + riskIntensity + pulseIntensity;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1.5, height * 1.5, 1.5]} />
      <meshStandardMaterial 
        color={color}
        emissive={riskLevel > 0.5 ? '#FF4D4F' : color}
        emissiveIntensity={0.2}
        metalness={0.3}
        roughness={0.1}
      />
    </mesh>
  );
};

// 主场景组件
const Scene3D: React.FC<{ 
  drones: DroneData[];
  riskData: RiskData;
  showPaths: boolean;
  showRiskZones: boolean;
  showDroneInfo: boolean;
  animationSpeed: number;
}> = ({ drones, riskData, showPaths, showRiskZones, showDroneInfo, animationSpeed }) => {
  
  // 建筑数据
  const buildings = useMemo(() => [
    { position: [-4, 1, -4], height: 2, color: '#2c5aa0' },
    { position: [-2, 1.5, -4], height: 3, color: '#1e3a8a' },
    { position: [0, 1, -4], height: 2, color: '#3b82f6' },
    { position: [2, 2, -4], height: 4, color: '#1d4ed8' },
    { position: [4, 1.5, -4], height: 3, color: '#2563eb' },
    { position: [-4, 1.5, -2], height: 3, color: '#2563eb' },
    { position: [-2, 2.5, -2], height: 5, color: '#1e40af' },
    { position: [0, 1.5, -2], height: 3, color: '#3b82f6' },
    { position: [2, 1, -2], height: 2, color: '#60a5fa' },
    { position: [4, 2, -2], height: 4, color: '#1e40af' },
    { position: [-4, 2, 0], height: 4, color: '#1e40af' },
    { position: [-2, 1, 0], height: 2, color: '#3b82f6' },
    { position: [0, 2.5, 0], height: 5, color: '#1d4ed8' },
    { position: [2, 1.5, 0], height: 3, color: '#2563eb' },
    { position: [4, 1, 0], height: 2, color: '#60a5fa' },
    { position: [-4, 1, 2], height: 2, color: '#60a5fa' },
    { position: [-2, 2, 2], height: 4, color: '#2c5aa0' },
    { position: [0, 1, 2], height: 2, color: '#3b82f6' },
    { position: [2, 1.5, 2], height: 3, color: '#1e3a8a' },
    { position: [4, 2.5, 2], height: 5, color: '#1d4ed8' },
    { position: [-4, 1.5, 4], height: 3, color: '#2563eb' },
    { position: [-2, 1, 4], height: 2, color: '#3b82f6' },
    { position: [0, 2, 4], height: 4, color: '#1e40af' },
    { position: [2, 1, 4], height: 2, color: '#60a5fa' },
    { position: [4, 1.5, 4], height: 3, color: '#2c5aa0' },
  ], []);

  return (
    <>
      {/* 环境光照 */}
      <ambientLight intensity={0.4} />
      
      {/* 主光源 */}
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.2} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* 动态点光源 */}
      <pointLight position={[0, 8, 0]} intensity={0.8} color="#00aaff" />
      <pointLight position={[5, 6, 5]} intensity={0.6} color="#00ff88" />
      <pointLight position={[-5, 6, -5]} intensity={0.6} color="#ffaa00" />

      {/* 星空背景 */}
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade />

      {/* 地面 */}
      <mesh position={[0, 0, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial 
          color="#0a1628" 
          metalness={0.1} 
          roughness={0.8}
        />
      </mesh>

      {/* 城市建筑 */}
      {buildings.map((building, index) => (
        <CityBuilding
          key={index}
          position={building.position as [number, number, number]}
          height={building.height}
          color={building.color}
          riskLevel={riskData.overallRisk}
        />
      ))}

      {/* 风险热力图 */}
      <RiskHeatMap riskZones={riskData.riskZones} visible={showRiskZones} />

      {/* 无人机群 */}
      {drones.map((drone) => (
        <EnhancedDrone
          key={drone.id}
          drone={drone}
          showPath={showPaths}
          showInfo={showDroneInfo}
        />
      ))}

      {/* 控制器 */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
        minDistance={3}
        maxDistance={25}
      />
    </>
  );
};

// 主组件
export const IntegratedDroneVisualization: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [showPaths, setShowPaths] = useState(true);
  const [showRiskZones, setShowRiskZones] = useState(true);
  const [showDroneInfo, setShowDroneInfo] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([10, 8, 10]);

  // 实时数据状态
  const [riskData, setRiskData] = useState<RiskData>({
    overallRisk: 0.3,
    riskBreakdown: {
      weather: 0.2,
      obstacle: 0.3,
      population: 0.4,
      equipment: 0.1,
      airspace: 0.2
    },
    riskZones: [
      { position: [2, 1, 2], radius: 1.5, riskLevel: 0.8, type: 'weather' },
      { position: [-3, 1, -1], radius: 2, riskLevel: 0.6, type: 'population' },
      { position: [1, 1, -3], radius: 1, riskLevel: 0.4, type: 'obstacle' }
    ]
  });

  const [drones, setDrones] = useState<DroneData[]>([
    {
      id: 'UAV-001',
      position: [-2, 3, -2],
      rotation: [0, 0, 0],
      status: 'active',
      battery: 85,
      signal: 92,
      speed: 5.2,
      altitude: 120,
      riskLevel: 0.2,
      flightPath: [[-2, 3, -2], [0, 3.5, 0], [2, 3, 2], [-2, 3, -2]]
    },
    {
      id: 'UAV-002',
      position: [3, 3.5, -1],
      rotation: [0, 0, 0],
      status: 'warning',
      battery: 45,
      signal: 78,
      speed: 3.8,
      altitude: 135,
      riskLevel: 0.6,
      flightPath: [[3, 3.5, -1], [-1, 4, 1], [1, 3.5, 2], [3, 3.5, -1]]
    },
    {
      id: 'UAV-003',
      position: [0, 4, 3],
      rotation: [0, 0, 0],
      status: 'active',
      battery: 92,
      signal: 88,
      speed: 6.1,
      altitude: 150,
      riskLevel: 0.3,
      flightPath: [[0, 4, 3], [-2, 3.5, 0], [2, 4, -1], [0, 4, 3]]
    },
    {
      id: 'UAV-004',
      position: [-1, 3.5, 1],
      rotation: [0, 0, 0],
      status: 'emergency',
      battery: 15,
      signal: 45,
      speed: 1.2,
      altitude: 80,
      riskLevel: 0.9,
      flightPath: [[-1, 3.5, 1], [0, 2, 1], [-1, 3.5, 1]]
    }
  ]);

  // WebSocket连接获取实时数据
  const { isConnected } = useWebSocket({
    onMessage: (message) => {
      if (message.type === 'drone_update') {
        setDrones(message.data.drones);
      } else if (message.type === 'risk_update') {
        setRiskData(message.data);
      }
    }
  });

  // 确保只在客户端渲染
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 模拟数据更新
  useEffect(() => {
    if (!isConnected) {
      const interval = setInterval(() => {
        // 更新无人机数据
        setDrones(prev => prev.map(drone => ({
          ...drone,
          battery: Math.max(0, drone.battery - Math.random() * 0.5),
          signal: Math.max(30, Math.min(100, drone.signal + (Math.random() - 0.5) * 10)),
          speed: Math.max(0, drone.speed + (Math.random() - 0.5) * 2),
          riskLevel: Math.max(0, Math.min(1, drone.riskLevel + (Math.random() - 0.5) * 0.1))
        })));

        // 更新风险数据
        setRiskData(prev => ({
          ...prev,
          overallRisk: Math.max(0, Math.min(1, prev.overallRisk + (Math.random() - 0.5) * 0.1)),
          riskZones: prev.riskZones?.map(zone => ({
            ...zone,
            riskLevel: Math.max(0, Math.min(1, zone.riskLevel + (Math.random() - 0.5) * 0.1))
          }))
        }));
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const handleViewChange = (view: string) => {
    switch (view) {
      case 'top':
        setCameraPosition([0, 20, 0]);
        break;
      case 'side':
        setCameraPosition([20, 8, 0]);
        break;
      case 'front':
        setCameraPosition([0, 8, 20]);
        break;
      default:
        setCameraPosition([10, 8, 10]);
    }
  };

  const activeDrones = drones.filter(d => d.status === 'active').length;
  const warningDrones = drones.filter(d => d.status === 'warning').length;
  const emergencyDrones = drones.filter(d => d.status === 'emergency').length;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* 控制面板 */}
      <Card
        size="small"
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 10,
          width: '280px',
          background: 'rgba(0, 0, 0, 0.9)',
          border: '1px solid rgba(24, 144, 255, 0.3)'
        }}
        bodyStyle={{ padding: '12px' }}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {/* 播放控制 */}
          <Row gutter={8}>
            <Col span={12}>
              <Button 
                size="small" 
                block
                icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? '暂停' : '播放'}
              </Button>
            </Col>
            <Col span={12}>
              <Button 
                size="small" 
                block
                icon={<ReloadOutlined />}
                onClick={() => setCameraPosition([10, 8, 10])}
              >
                重置视角
              </Button>
            </Col>
          </Row>

          {/* 视角切换 */}
          <Row gutter={4}>
            <Col span={6}>
              <Button size="small" block onClick={() => handleViewChange('top')}>俯视</Button>
            </Col>
            <Col span={6}>
              <Button size="small" block onClick={() => handleViewChange('side')}>侧视</Button>
            </Col>
            <Col span={6}>
              <Button size="small" block onClick={() => handleViewChange('front')}>正视</Button>
            </Col>
            <Col span={6}>
              <Button size="small" block onClick={() => handleViewChange('default')}>默认</Button>
            </Col>
          </Row>

          {/* 显示选项 */}
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'white', fontSize: '12px' }}>飞行路径</span>
              <Switch size="small" checked={showPaths} onChange={setShowPaths} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'white', fontSize: '12px' }}>风险区域</span>
              <Switch size="small" checked={showRiskZones} onChange={setShowRiskZones} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'white', fontSize: '12px' }}>无人机信息</span>
              <Switch size="small" checked={showDroneInfo} onChange={setShowDroneInfo} />
            </div>
          </Space>

          {/* 动画速度 */}
          <div>
            <div style={{ color: 'white', fontSize: '12px', marginBottom: '4px' }}>
              动画速度: {animationSpeed}x
            </div>
            <Slider
              min={0.1}
              max={3}
              step={0.1}
              value={animationSpeed}
              onChange={setAnimationSpeed}
            />
          </div>
        </Space>
      </Card>

      {/* 状态面板 */}
      <Card
        size="small"
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 10,
          width: '200px',
          background: 'rgba(0, 0, 0, 0.9)',
          border: '1px solid rgba(24, 144, 255, 0.3)'
        }}
        bodyStyle={{ padding: '12px' }}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
            <ThunderboltOutlined /> 系统状态
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#52C41A', fontSize: '11px' }}>正常: {activeDrones}</span>
            <span style={{ color: '#FAAD14', fontSize: '11px' }}>警告: {warningDrones}</span>
            <span style={{ color: '#FF4D4F', fontSize: '11px' }}>紧急: {emergencyDrones}</span>
          </div>

          <div style={{ color: 'white', fontSize: '11px' }}>
            总体风险: <span style={{ 
              color: riskData.overallRisk > 0.7 ? '#FF4D4F' : 
                     riskData.overallRisk > 0.4 ? '#FAAD14' : '#52C41A',
              fontWeight: 'bold'
            }}>
              {Math.round(riskData.overallRisk * 100)}%
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Badge status={isConnected ? 'processing' : 'error'} />
            <span style={{ color: 'white', fontSize: '10px' }}>
              {isConnected ? '实时连接' : '模拟模式'}
            </span>
          </div>
        </Space>
      </Card>

      {/* 3D Canvas */}
      {isClient && (
        <Canvas
          camera={{ position: cameraPosition, fov: 60 }}
          style={{ width: '100%', height: '100%' }}
          shadows
        >
          <Suspense fallback={null}>
            <Scene3D 
              drones={drones}
              riskData={riskData}
              showPaths={showPaths}
              showRiskZones={showRiskZones}
              showDroneInfo={showDroneInfo}
              animationSpeed={isPlaying ? animationSpeed : 0}
            />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
};