'use client';

import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html, Environment, Stars } from '@react-three/drei';
import { Button, Space, Slider, Badge } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  ReloadOutlined,
  FullscreenOutlined,
  CameraOutlined
} from '@ant-design/icons';
import * as THREE from 'three';
import { RealisticDrone } from './RealisticDrone';

// 城市建筑组件
const CityBuilding: React.FC<{ position: [number, number, number]; height: number; color: string }> = ({ 
  position, 
  height, 
  color 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && meshRef.current.material) {
      // 添加微妙的发光效果
      const time = state.clock.getElapsedTime();
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.emissive.setHex(
        Math.sin(time * 0.5) > 0.8 ? 0x001122 : 0x000000
      );
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1.5, height * 1.5, 1.5]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color}
        emissiveIntensity={0.4}
        metalness={0.3}
        roughness={0.1}
      />
    </mesh>
  );
};

// 无人机组件
const Drone: React.FC<{ 
  position: [number, number, number]; 
  id: string; 
  isActive: boolean;
  path?: [number, number, number][];
}> = ({ position, id, isActive, path }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [animatedPosition, setAnimatedPosition] = useState<[number, number, number]>(position);

  // 路径动画
  useEffect(() => {
    if (path && path.length > 1 && isActive) {
      const interval = setInterval(() => {
        setCurrentPathIndex((prev) => (prev + 1) % path.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [path, isActive]);

  useEffect(() => {
    if (path && path[currentPathIndex]) {
      setAnimatedPosition(path[currentPathIndex]);
    }
  }, [currentPathIndex, path]);

  useFrame((state) => {
    if (meshRef.current) {
      // 旋转动画
      meshRef.current.rotation.y += isActive ? 0.02 : 0.005;
      
      // 上下浮动
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y = animatedPosition[1] + Math.sin(time * 2) * 0.1;
      meshRef.current.position.x = animatedPosition[0];
      meshRef.current.position.z = animatedPosition[2];
    }
  });

  return (
    <group ref={meshRef} position={animatedPosition}>
      {/* 无人机主体 */}
      <mesh>
        <boxGeometry args={[0.6, 0.2, 0.6]} />
        <meshStandardMaterial 
          color={isActive ? '#00ff88' : '#00aaff'} 
          emissive={isActive ? '#00ff88' : '#00aaff'}
          emissiveIntensity={0.6}
          metalness={0.2}
          roughness={0.1}
        />
      </mesh>
      
      {/* 螺旋桨 */}
      {[[-0.3, 0.1, -0.3], [0.3, 0.1, -0.3], [-0.3, 0.1, 0.3], [0.3, 0.1, 0.3]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.1, 0.1, 0.04]} />
          <meshStandardMaterial 
            color="#ffaa00" 
            emissive="#ffaa00"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
      
      {/* 状态指示灯 */}
      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.04]} />
        <meshStandardMaterial 
          color={isActive ? '#00ff00' : '#ff0000'} 
          emissive={isActive ? '#00ff00' : '#ff0000'}
          emissiveIntensity={1.0}
        />
      </mesh>

      {/* 无人机标签 */}
      <Html position={[0, 0.5, 0]} center>
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '1px 4px',
          borderRadius: '3px',
          fontSize: '8px',
          whiteSpace: 'nowrap',
          border: `1px solid ${isActive ? '#00ff88' : '#00aaff'}`
        }}>
          {id}
        </div>
      </Html>
    </group>
  );
};

// 飞行路径组件
const FlightPath: React.FC<{ points: number[][] }> = ({ points }) => {
  const lineRef = useRef<THREE.Line>(null);

  useFrame((state) => {
    if (lineRef.current && lineRef.current.material) {
      const time = state.clock.getElapsedTime();
      const material = lineRef.current.material as THREE.LineBasicMaterial;
      material.opacity = 0.3 + Math.sin(time * 2) * 0.2;
    }
  });

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry().setFromPoints(
      points.map(point => new THREE.Vector3(point[0] || 0, point[1] || 0, point[2] || 0))
    );
    return geom;
  }, [points]);

  return (
    <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ 
      color: "#00ffff", 
      transparent: true, 
      opacity: 0.5 
    }))} ref={lineRef} />
  );
};

// 主场景组件
const Scene3D: React.FC<{ 
  animationSpeed: number; 
  showPaths: boolean; 
  cameraPosition: [number, number, number] 
}> = ({ animationSpeed, showPaths, cameraPosition }) => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(...cameraPosition);
  }, [camera, cameraPosition]);

  // 建筑数据
  const buildings = [
    { position: [-3, 1, -3], height: 2, color: '#2c5aa0' },
    { position: [-1, 1.5, -3], height: 3, color: '#1e3a8a' },
    { position: [1, 1, -3], height: 2, color: '#3b82f6' },
    { position: [3, 2, -3], height: 4, color: '#1d4ed8' },
    { position: [-3, 1.5, -1], height: 3, color: '#2563eb' },
    { position: [-1, 2.5, -1], height: 5, color: '#1e40af' },
    { position: [1, 1.5, -1], height: 3, color: '#3b82f6' },
    { position: [3, 1, -1], height: 2, color: '#60a5fa' },
    { position: [-3, 2, 1], height: 4, color: '#1e40af' },
    { position: [-1, 1, 1], height: 2, color: '#3b82f6' },
    { position: [1, 2.5, 1], height: 5, color: '#1d4ed8' },
    { position: [3, 1.5, 1], height: 3, color: '#2563eb' },
    { position: [-3, 1, 3], height: 2, color: '#60a5fa' },
    { position: [-1, 2, 3], height: 4, color: '#2c5aa0' },
    { position: [1, 1, 3], height: 2, color: '#3b82f6' },
    { position: [3, 1.5, 3], height: 3, color: '#1e3a8a' },
  ];

  // 无人机数据和路径
  const drones = [
    {
      id: 'UAV-001',
      position: [-2, 3, -2] as [number, number, number],
      isActive: true,
      path: [[-2, 3, -2], [0, 3.5, 0], [2, 3, 2], [-2, 3, -2]]
    },
    {
      id: 'UAV-002',
      position: [2, 3.5, -1] as [number, number, number],
      isActive: true,
      path: [[2, 3.5, -1], [-1, 4, 1], [1, 3.5, 2], [2, 3.5, -1]]
    },
    {
      id: 'UAV-003',
      position: [0, 4, 2] as [number, number, number],
      isActive: false,
      path: [[0, 4, 2], [-2, 3.5, 0], [2, 4, -1], [0, 4, 2]]
    },
    {
      id: 'UAV-004',
      position: [-1, 3.5, 0] as [number, number, number],
      isActive: true,
      path: [[-1, 3.5, 0], [1, 4, -2], [-1, 3.5, 2], [-1, 3.5, 0]]
    },
    {
      id: 'UAV-005',
      position: [1, 3, 1] as [number, number, number],
      isActive: false,
      path: [[1, 3, 1], [-2, 3.5, -1], [2, 3, 0], [1, 3, 1]]
    }
  ];

  return (
    <>
      {/* 环境光 */}
      <ambientLight intensity={0.6} />
      
      {/* 主光源 */}
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.5} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* 点光源 */}
      <pointLight position={[0, 8, 0]} intensity={1.0} color="#00aaff" />
      <pointLight position={[5, 6, 5]} intensity={0.8} color="#00ff88" />
      <pointLight position={[-5, 6, -5]} intensity={0.8} color="#ffaa00" />

      {/* 星空背景 */}
      <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade />

      {/* 地面 */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
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
        />
      ))}

      {/* 无人机 */}
      {drones.map((drone) => (
        <RealisticDrone
          key={drone.id}
          position={drone.position}
          color={drone.isActive ? '#00ff88' : '#00aaff'}
          scale={0.8}
          isFlying={drone.isActive}
        />
      ))}

      {/* 飞行路径 */}
      {showPaths && drones.map((drone) => (
        drone.path && (
          <FlightPath
            key={`path-${drone.id}`}
            points={drone.path}
          />
        )
      ))}

      {/* 控制器 */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
        minDistance={5}
        maxDistance={20}
      />
    </>
  );
};

// 主组件
export const EnhancedCityScene3D: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [showPaths, setShowPaths] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([8, 6, 8]);

  // 确保只在客户端渲染3D内容
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCameraReset = () => {
    setCameraPosition([8, 6, 8]);
  };

  const handleViewChange = (view: string) => {
    switch (view) {
      case 'top':
        setCameraPosition([0, 15, 0]);
        break;
      case 'side':
        setCameraPosition([15, 5, 0]);
        break;
      case 'front':
        setCameraPosition([0, 5, 15]);
        break;
      default:
        setCameraPosition([8, 6, 8]);
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* 控制面板 */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        zIndex: 10,
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid rgba(24, 144, 255, 0.3)'
      }}>
        <Space direction="vertical" size="small">
          <Space>
            <Button 
              size="small" 
              icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? '暂停' : '播放'}
            </Button>
            <Button 
              size="small" 
              icon={<ReloadOutlined />}
              onClick={handleCameraReset}
            >
              重置
            </Button>
          </Space>
          
          <div style={{ color: 'white', fontSize: '12px' }}>
            动画速度: {animationSpeed}x
          </div>
          <Slider
            min={0.1}
            max={3}
            step={0.1}
            value={animationSpeed}
            onChange={setAnimationSpeed}
            style={{ width: '120px' }}
          />
          
          <Space>
            <Button size="small" onClick={() => handleViewChange('top')}>俯视</Button>
            <Button size="small" onClick={() => handleViewChange('side')}>侧视</Button>
            <Button size="small" onClick={() => handleViewChange('front')}>正视</Button>
          </Space>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={showPaths}
              onChange={(e) => setShowPaths(e.target.checked)}
            />
            <span style={{ color: 'white', fontSize: '12px' }}>显示路径</span>
          </div>
        </Space>
      </div>

      {/* 状态信息 */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        zIndex: 10,
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid rgba(24, 144, 255, 0.3)',
        color: 'white',
        fontSize: '12px'
      }}>
        <div style={{ marginBottom: '8px' }}>
          <Badge status="processing" text="活跃无人机: 5" />
        </div>
        <div style={{ marginBottom: '8px' }}>
          <Badge status="success" text="监控区域: CBD核心区" />
        </div>
        <div>
          <Badge status="default" text="系统状态: 正常运行" />
        </div>
      </div>

      {/* 3D Canvas */}
      {isClient && (
        <Canvas
          camera={{ position: cameraPosition, fov: 60 }}
          style={{ width: '100%', height: '100%' }}
          shadows
        >
          <Suspense fallback={null}>
            <Scene3D 
              animationSpeed={isPlaying ? animationSpeed : 0}
              showPaths={showPaths}
              cameraPosition={cameraPosition}
            />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
};