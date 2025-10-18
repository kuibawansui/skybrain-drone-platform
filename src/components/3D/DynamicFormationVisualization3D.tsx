'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Text, 
  Line, 
  Sphere, 
  Box, 
  Billboard,
  Trail,
  Environment,
  PerspectiveCamera
} from '@react-three/drei';
import * as THREE from 'three';
import { Button, Card, Space, Select, Switch, Slider, Row, Col } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  ReloadOutlined,
  SettingOutlined 
} from '@ant-design/icons';

const { Option } = Select;

// 编队类型定义
type FormationType = 'line' | 'triangle' | 'diamond' | 'circle' | 'v_formation' | 'square' | 'cross' | 'spiral';

// 无人机数据接口
interface DroneData {
  id: string;
  name: string;
  position: THREE.Vector3;
  targetPosition: THREE.Vector3;
  velocity: THREE.Vector3;
  status: 'idle' | 'flying' | 'charging' | 'maintenance' | 'offline';
  battery: number;
  isLeader: boolean;
  trail: THREE.Vector3[];
}

// 编队配置接口
interface FormationConfig {
  type: FormationType;
  droneCount: number;
  spacing: number;
  speed: number;
  rotationSpeed: number;
  centerPosition: THREE.Vector3;
  isMoving: boolean;
  showTrails: boolean;
}

// 单个无人机3D模型组件
const AnimatedDrone: React.FC<{
  drone: DroneData;
  config: FormationConfig;
  index: number;
}> = ({ drone, config, index }) => {
  const meshRef = useRef<THREE.Group>(null);
  const propellerRefs = useRef<THREE.Mesh[]>([]);
  
  // 螺旋桨动画
  useFrame((state, delta) => {
    if (meshRef.current) {
      // 平滑移动到目标位置
      drone.position.lerp(drone.targetPosition, delta * config.speed);
      meshRef.current.position.copy(drone.position);
      
      // 更新轨迹
      if (config.showTrails && drone.trail.length > 0) {
        const lastTrailPoint = drone.trail[drone.trail.length - 1];
        if (lastTrailPoint.distanceTo(drone.position) > 0.5) {
          drone.trail.push(drone.position.clone());
          if (drone.trail.length > 50) {
            drone.trail.shift();
          }
        }
      }
      
      // 螺旋桨旋转
      propellerRefs.current.forEach((propeller) => {
        if (propeller) {
          propeller.rotation.y += delta * 20;
        }
      });
      
      // 机身轻微摆动
      if (config.isMoving) {
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2 + index) * 0.05;
        meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 1.5 + index) * 0.03;
      }
    }
  });

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    const colors = {
      idle: '#52c41a',
      flying: '#1890ff',
      charging: '#faad14',
      maintenance: '#fa8c16',
      offline: '#f5222d'
    };
    return colors[status as keyof typeof colors] || '#1890ff';
  };

  return (
    <group ref={meshRef}>
      {/* 无人机主体 */}
      <mesh>
        <boxGeometry args={[0.8, 0.2, 0.8]} />
        <meshStandardMaterial 
          color={drone.isLeader ? '#ff4d4f' : getStatusColor(drone.status)}
          emissive={drone.isLeader ? '#ff4d4f' : getStatusColor(drone.status)}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* 螺旋桨 */}
      {[
        [-0.4, 0.1, -0.4],
        [0.4, 0.1, -0.4],
        [-0.4, 0.1, 0.4],
        [0.4, 0.1, 0.4]
      ].map((pos, i) => (
        <mesh 
          key={i}
          ref={(el) => { if (el) propellerRefs.current[i] = el; }}
          position={pos as [number, number, number]}
        >
          <cylinderGeometry args={[0.02, 0.02, 0.6]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      ))}
      
      {/* 螺旋桨叶片 */}
      {[
        [-0.4, 0.15, -0.4],
        [0.4, 0.15, -0.4],
        [-0.4, 0.15, 0.4],
        [0.4, 0.15, 0.4]
      ].map((pos, i) => (
        <group key={`blades-${i}`} position={pos as [number, number, number]}>
          <mesh rotation={[0, 0, 0]}>
            <boxGeometry args={[0.4, 0.02, 0.05]} />
            <meshStandardMaterial color="#666666" transparent opacity={0.7} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.4, 0.02, 0.05]} />
            <meshStandardMaterial color="#666666" transparent opacity={0.7} />
          </mesh>
        </group>
      ))}
      
      {/* 状态指示灯 */}
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial 
          color={getStatusColor(drone.status)}
          emissive={getStatusColor(drone.status)}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* 队长标识 */}
      {drone.isLeader && (
        <Billboard position={[0, 0.8, 0]}>
          <Text
            fontSize={0.3}
            color="#ff4d4f"
            anchorX="center"
            anchorY="middle"
          >
            ★ 队长
          </Text>
        </Billboard>
      )}
      
      {/* 无人机名称 */}
      <Billboard position={[0, -0.5, 0]}>
        <Text
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {drone.name}
        </Text>
      </Billboard>
      
      {/* 轨迹线 */}
      {config.showTrails && drone.trail.length > 1 && (
        <Line
          points={drone.trail}
          color={getStatusColor(drone.status)}
          lineWidth={2}
          transparent
          opacity={0.6}
        />
      )}
    </group>
  );
};

// 编队计算函数
const calculateFormationPositions = (
  type: FormationType, 
  droneCount: number, 
  spacing: number, 
  center: THREE.Vector3,
  time: number = 0
): THREE.Vector3[] => {
  const positions: THREE.Vector3[] = [];
  
  switch (type) {
    case 'line':
      for (let i = 0; i < droneCount; i++) {
        const x = (i - (droneCount - 1) / 2) * spacing;
        positions.push(new THREE.Vector3(x, 0, 0).add(center));
      }
      break;
      
    case 'triangle':
      const rows = Math.ceil(Math.sqrt(droneCount));
      let droneIndex = 0;
      for (let row = 0; row < rows && droneIndex < droneCount; row++) {
        const dronesInRow = Math.min(row + 1, droneCount - droneIndex);
        for (let col = 0; col < dronesInRow; col++) {
          const x = (col - (dronesInRow - 1) / 2) * spacing;
          const z = -row * spacing * 0.866; // 60度角
          positions.push(new THREE.Vector3(x, 0, z).add(center));
          droneIndex++;
        }
      }
      break;
      
    case 'diamond':
      const diamondSize = Math.ceil(droneCount / 4);
      for (let i = 0; i < droneCount; i++) {
        const angle = (i / droneCount) * Math.PI * 2;
        const radius = spacing * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        positions.push(new THREE.Vector3(x, 0, z).add(center));
      }
      break;
      
    case 'circle':
      for (let i = 0; i < droneCount; i++) {
        const angle = (i / droneCount) * Math.PI * 2 + time * 0.5;
        const radius = spacing * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        positions.push(new THREE.Vector3(x, 0, z).add(center));
      }
      break;
      
    case 'v_formation':
      const halfCount = Math.floor(droneCount / 2);
      // 队长在前方
      positions.push(new THREE.Vector3(0, 0, spacing * 2).add(center));
      // 左翼
      for (let i = 1; i <= halfCount; i++) {
        positions.push(new THREE.Vector3(-i * spacing, 0, 0).add(center));
      }
      // 右翼
      for (let i = 1; i <= droneCount - halfCount - 1; i++) {
        positions.push(new THREE.Vector3(i * spacing, 0, 0).add(center));
      }
      break;
      
    case 'square':
      const sideLength = Math.ceil(Math.sqrt(droneCount));
      for (let i = 0; i < droneCount; i++) {
        const row = Math.floor(i / sideLength);
        const col = i % sideLength;
        const x = (col - (sideLength - 1) / 2) * spacing;
        const z = (row - (sideLength - 1) / 2) * spacing;
        positions.push(new THREE.Vector3(x, 0, z).add(center));
      }
      break;
      
    case 'cross':
      const centerIndex = Math.floor(droneCount / 2);
      for (let i = 0; i < droneCount; i++) {
        if (i < centerIndex) {
          // 水平线左侧
          positions.push(new THREE.Vector3(-(centerIndex - i) * spacing, 0, 0).add(center));
        } else if (i === centerIndex) {
          // 中心点
          positions.push(new THREE.Vector3(0, 0, 0).add(center));
        } else {
          // 垂直线或水平线右侧
          const remaining = i - centerIndex;
          if (remaining <= centerIndex) {
            positions.push(new THREE.Vector3(remaining * spacing, 0, 0).add(center));
          } else {
            const verticalIndex = remaining - centerIndex;
            positions.push(new THREE.Vector3(0, 0, verticalIndex * spacing).add(center));
          }
        }
      }
      break;
      
    case 'spiral':
      for (let i = 0; i < droneCount; i++) {
        const angle = i * 0.5 + time;
        const radius = (i * spacing) / 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = i * spacing * 0.2;
        positions.push(new THREE.Vector3(x, y, z).add(center));
      }
      break;
      
    default:
      // 默认线性排列
      for (let i = 0; i < droneCount; i++) {
        const x = (i - (droneCount - 1) / 2) * spacing;
        positions.push(new THREE.Vector3(x, 0, 0).add(center));
      }
  }
  
  return positions;
};

// 3D场景组件
const FormationScene: React.FC<{
  config: FormationConfig;
  drones: DroneData[];
  onDroneUpdate: (drones: DroneData[]) => void;
}> = ({ config, drones, onDroneUpdate }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    if (camera) {
      camera.position.set(15, 10, 15);
      camera.lookAt(0, 0, 0);
    }
  }, [camera]);

  // 更新编队位置
  useFrame((state) => {
    if (config.isMoving) {
      const time = state.clock.elapsedTime;
      const newPositions = calculateFormationPositions(
        config.type,
        config.droneCount,
        config.spacing,
        config.centerPosition,
        time * config.rotationSpeed
      );
      
      const updatedDrones = drones.map((drone, index) => {
        if (index < newPositions.length) {
          return {
            ...drone,
            targetPosition: newPositions[index]
          };
        }
        return drone;
      });
      
      onDroneUpdate(updatedDrones);
    }
  });

  return (
    <>
      {/* 环境光照 */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -10]} color="#4A90E2" intensity={0.5} />
      
      {/* 环境 */}
      <Environment preset="sunset" />
      
      {/* 地面网格 */}
      <gridHelper args={[50, 50, '#444444', '#222222']} />
      
      {/* 渲染无人机 */}
      {drones.map((drone, index) => (
        <AnimatedDrone
          key={drone.id}
          drone={drone}
          config={config}
          index={index}
        />
      ))}
      
      {/* 编队中心标记 */}
      <mesh position={config.centerPosition}>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial 
          color="#ff4d4f" 
          transparent 
          opacity={0.5}
          emissive="#ff4d4f"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* 编队名称 */}
      <Billboard position={[config.centerPosition.x, config.centerPosition.y + 5, config.centerPosition.z]}>
        <Text
          fontSize={1}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {config.type.toUpperCase()} 编队
        </Text>
      </Billboard>
      
      {/* 相机控制 */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
      />
    </>
  );
};

// 主组件
const DynamicFormationVisualization3D: React.FC = () => {
  const [config, setConfig] = useState<FormationConfig>({
    type: 'circle',
    droneCount: 8,
    spacing: 3,
    speed: 2,
    rotationSpeed: 0.5,
    centerPosition: new THREE.Vector3(0, 0, 0),
    isMoving: true,
    showTrails: true
  });
  
  const [drones, setDrones] = useState<DroneData[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);

  // 初始化无人机
  useEffect(() => {
    const initialPositions = calculateFormationPositions(
      config.type,
      config.droneCount,
      config.spacing,
      config.centerPosition
    );
    
    const newDrones: DroneData[] = Array.from({ length: config.droneCount }, (_, i) => ({
      id: `drone-${i + 1}`,
      name: `无人机-${i + 1}`,
      position: initialPositions[i] || new THREE.Vector3(0, 0, 0),
      targetPosition: initialPositions[i] || new THREE.Vector3(0, 0, 0),
      velocity: new THREE.Vector3(0, 0, 0),
      status: 'flying',
      battery: 80 + Math.random() * 20,
      isLeader: i === 0,
      trail: []
    }));
    
    setDrones(newDrones);
  }, [config.type, config.droneCount, config.spacing]);

  // 编队类型选项
  const formationOptions = [
    { value: 'line', label: '直线编队' },
    { value: 'triangle', label: '三角编队' },
    { value: 'diamond', label: '菱形编队' },
    { value: 'circle', label: '圆形编队' },
    { value: 'v_formation', label: 'V字编队' },
    { value: 'square', label: '方形编队' },
    { value: 'cross', label: '十字编队' },
    { value: 'spiral', label: '螺旋编队' }
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 控制面板 */}
      <Card size="small" style={{ marginBottom: '8px', flex: '0 0 auto' }}>
        <Row gutter={[8, 8]} align="middle">
          <Col span={6}>
            <Space>
              <span style={{ fontSize: '12px' }}>编队:</span>
              <Select
                size="small"
                value={config.type}
                onChange={(value) => setConfig(prev => ({ ...prev, type: value }))}
                style={{ width: 100 }}
              >
                {formationOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          
          <Col span={4}>
            <Space>
              <span style={{ fontSize: '12px' }}>数量:</span>
              <Slider
                size="small"
                min={3}
                max={15}
                value={config.droneCount}
                onChange={(value) => setConfig(prev => ({ ...prev, droneCount: value }))}
                style={{ width: 60 }}
              />
            </Space>
          </Col>
          
          <Col span={4}>
            <Space>
              <span style={{ fontSize: '12px' }}>间距:</span>
              <Slider
                size="small"
                min={1}
                max={8}
                step={0.5}
                value={config.spacing}
                onChange={(value) => setConfig(prev => ({ ...prev, spacing: value }))}
                style={{ width: 60 }}
              />
            </Space>
          </Col>
          
          <Col span={4}>
            <Space>
              <span style={{ fontSize: '12px' }}>速度:</span>
              <Slider
                size="small"
                min={0.1}
                max={5}
                step={0.1}
                value={config.speed}
                onChange={(value) => setConfig(prev => ({ ...prev, speed: value }))}
                style={{ width: 60 }}
              />
            </Space>
          </Col>
          
          <Col span={6}>
            <Space>
              <Button
                size="small"
                type={isPlaying ? "primary" : "default"}
                icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={() => {
                  setIsPlaying(!isPlaying);
                  setConfig(prev => ({ ...prev, isMoving: !isPlaying }));
                }}
              >
                {isPlaying ? '暂停' : '播放'}
              </Button>
              
              <Switch
                size="small"
                checked={config.showTrails}
                onChange={(checked) => setConfig(prev => ({ ...prev, showTrails: checked }))}
              />
              <span style={{ fontSize: '12px' }}>轨迹</span>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 3D场景 */}
      <div style={{ flex: 1, borderRadius: '8px', overflow: 'hidden' }}>
        <Canvas
          camera={{ position: [15, 10, 15], fov: 75 }}
          style={{ background: 'linear-gradient(to bottom, #1a1a2e 0%, #16213e 100%)' }}
        >
          <FormationScene
            config={config}
            drones={drones}
            onDroneUpdate={setDrones}
          />
        </Canvas>
      </div>
    </div>
  );
};

export default DynamicFormationVisualization3D;