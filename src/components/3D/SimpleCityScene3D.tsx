'use client';

import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { Button, Space, Slider } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  ReloadOutlined,
  FullscreenOutlined,
  CameraOutlined
} from '@ant-design/icons';
import * as THREE from 'three';

const SceneControls: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);

  return (
    <Html position={[-8, 6, 8]} className="select-none">
      <div className="glass-panel" style={{ padding: '16px', minWidth: '300px' }}>
        <h3 style={{ color: 'white', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>场景控制</h3>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <Button
              type={isPlaying ? 'primary' : 'default'}
              icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => setIsPlaying(!isPlaying)}
              size="small"
            >
              {isPlaying ? '暂停' : '播放'}
            </Button>
            <Button icon={<ReloadOutlined />} size="small">
              重置
            </Button>
            <Button icon={<CameraOutlined />} size="small">
              截图
            </Button>
            <Button icon={<FullscreenOutlined />} size="small">
              全屏
            </Button>
          </Space>
          
          <div style={{ width: '100%' }}>
            <div style={{ color: 'white', fontSize: '12px', marginBottom: '8px' }}>仿真速度: {speed}x</div>
            <Slider
              min={0.1}
              max={5}
              step={0.1}
              value={speed}
              onChange={setSpeed}
              style={{ width: '100%' }}
            />
          </div>
        </Space>
      </div>
    </Html>
  );
};

// 简化的建筑组件
const SimpleBuilding: React.FC<{ position: [number, number, number]; height: number; color: string }> = ({ 
  position, 
  height, 
  color 
}) => {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[2, height, 2]} />
      <meshLambertMaterial color={color} />
    </mesh>
  );
};

// 简化的无人机组件
const SimpleDrone: React.FC<{ position: [number, number, number]; id: string }> = ({ position, id }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // 简单的上下浮动动画
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* 无人机主体 */}
      <mesh>
        <boxGeometry args={[0.8, 0.2, 0.8]} />
        <meshLambertMaterial color="#1890FF" />
      </mesh>
      
      {/* 四个螺旋桨 */}
      {([
        [-0.4, 0.1, -0.4] as [number, number, number],
        [0.4, 0.1, -0.4] as [number, number, number],
        [0.4, 0.1, 0.4] as [number, number, number],
        [-0.4, 0.1, 0.4] as [number, number, number],
      ]).map((pos, index) => (
        <mesh key={index} position={pos}>
          <cylinderGeometry args={[0.15, 0.15, 0.02]} />
          <meshLambertMaterial color="#40a9ff" transparent opacity={0.7} />
        </mesh>
      ))}
      
      {/* 状态指示灯 */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.05]} />
        <meshBasicMaterial color="#52C41A" />
      </mesh>
      
      {/* 信息标签 */}
      <Html position={[0, 0.8, 0]} center>
        <div className="glass-panel" style={{ padding: '4px 8px', fontSize: '12px' }}>
          <div style={{ color: 'white', fontWeight: 600 }}>{id}</div>
          <div style={{ color: '#52C41A', fontSize: '10px' }}>正常飞行</div>
        </div>
      </Html>
    </group>
  );
};

const LoadingFallback: React.FC = () => (
  <Html center>
    <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
      <div style={{ color: 'white', fontSize: '18px', marginBottom: '8px' }}>加载3D场景中...</div>
      <div style={{ color: '#8C8C8C', fontSize: '14px' }}>正在初始化城市模型和无人机集群</div>
    </div>
  </Html>
);

export const SimpleCityScene3D: React.FC = () => {
  // 生成建筑数据
  const buildings = React.useMemo(() => {
    const buildingData = [];
    for (let x = -10; x <= 10; x += 4) {
      for (let z = -10; z <= 10; z += 4) {
        if (Math.abs(x) < 2 && Math.abs(z) < 2) continue; // 中心区域留空
        
        const height = Math.random() * 6 + 2;
        const colors = ['#34495e', '#2c3e50', '#3498db', '#2980b9'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        buildingData.push({
          position: [x, height / 2, z] as [number, number, number],
          height,
          color,
        });
      }
    }
    return buildingData;
  }, []);

  // 生成无人机数据
  const drones = React.useMemo(() => {
    const droneData = [];
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const radius = 3 + Math.random() * 4;
      const height = 4 + Math.random() * 2;
      
      droneData.push({
        id: `UAV-${String(i + 1).padStart(3, '0')}`,
        position: [
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius,
        ] as [number, number, number],
      });
    }
    return droneData;
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', border: '2px solid rgba(24, 144, 255, 0.3)', borderRadius: '12px', overflow: 'hidden' }}>
      <Canvas
        camera={{ 
          position: [15, 15, 15], 
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        shadows
        style={{ width: '100%', height: '100%' }}
      >
        {/* 环境光照 */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        
        {/* 点光源 */}
        <pointLight position={[0, 5, 0]} intensity={0.5} color="#1890FF" />

        {/* 相机控制 */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
        />

        <Suspense fallback={<LoadingFallback />}>
          {/* 地面 */}
          <mesh position={[0, -0.5, 0]} receiveShadow>
            <boxGeometry args={[30, 1, 30]} />
            <meshLambertMaterial color="#1a1a1a" />
          </mesh>
          
          {/* 地面网格 */}
          <gridHelper args={[30, 30, '#1890FF', '#404040']} position={[0, 0, 0]} />
          
          {/* 建筑群 */}
          {buildings.map((building, index) => (
            <SimpleBuilding key={index} {...building} />
          ))}
          
          {/* 无人机集群 */}
          {drones.map((drone) => (
            <SimpleDrone key={drone.id} position={drone.position} id={drone.id} />
          ))}
          
          {/* 场景控制面板 */}
          <SceneControls />
        </Suspense>

        {/* 场景标题 */}
        <Text
          position={[0, 8, -8]}
          fontSize={1}
          color="#1890FF"
          anchorX="center"
          anchorY="middle"
        >
          SkyBrain 城市低空物流仿真
        </Text>
      </Canvas>
    </div>
  );
};