import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';

// 无人机数据接口
interface DroneData {
  id: string;
  name: string;
  position: [number, number, number];
  status: 'idle' | 'flying' | 'charging' | 'maintenance' | 'offline';
  battery: number;
  isLeader?: boolean;
  groupId?: string;
}

// 群组数据接口
interface GroupData {
  id: string;
  name: string;
  formation: 'line' | 'triangle' | 'diamond' | 'circle' | 'custom';
  memberIds: string[];
  leaderId: string;
  status: 'idle' | 'active' | 'mission' | 'emergency';
}

// 单个无人机3D模型组件
const DroneModel: React.FC<{
  drone: DroneData;
  isSelected: boolean;
  onClick: () => void;
}> = ({ drone, isSelected, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // 根据状态获取颜色
  const getStatusColor = (status: string) => {
    const colors = {
      idle: '#52c41a',
      flying: '#1890ff',
      charging: '#faad14',
      maintenance: '#fa8c16',
      offline: '#f5222d'
    };
    return colors[status as keyof typeof colors] || '#52c41a';
  };

  // 动画效果
  useFrame((state) => {
    if (meshRef.current) {
      // 飞行中的无人机有轻微的上下浮动
      if (drone.status === 'flying') {
        meshRef.current.position.y = drone.position[2] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      }
      
      // 选中或悬停时的缩放效果
      const targetScale = isSelected || hovered ? 1.2 : 1.0;
      const targetVector = new THREE.Vector3(targetScale, targetScale, targetScale);
      meshRef.current.scale.lerp(targetVector, 0.1);
      
      // 队长无人机的旋转效果
      if (drone.isLeader) {
        meshRef.current.rotation.y += 0.01;
      }
    }
  });

  return (
    <group position={[drone.position[0] * 0.01, drone.position[2] * 0.01, drone.position[1] * 0.01]}>
      {/* 无人机主体 */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[0.3, 0.1, 0.3]} />
        <meshStandardMaterial 
          color={getStatusColor(drone.status)}
          emissive={getStatusColor(drone.status)}
          emissiveIntensity={isSelected ? 0.3 : 0.1}
        />
      </mesh>

      {/* 螺旋桨 */}
      {[[-0.12, 0.05, -0.12], [0.12, 0.05, -0.12], [-0.12, 0.05, 0.12], [0.12, 0.05, 0.12]].map((pos, index) => (
        <mesh key={index} position={pos}>
          <cylinderGeometry args={[0.08, 0.08, 0.02, 8]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      ))}

      {/* 队长标识 */}
      {drone.isLeader && (
        <Sphere position={[0, 0.3, 0]} args={[0.05]}>
          <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.5} />
        </Sphere>
      )}

      {/* 无人机标签 */}
      <Text
        position={[0, -0.3, 0]}
        fontSize={0.1}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {drone.name}
      </Text>

      {/* 电量指示器 */}
      <group position={[0, 0.2, 0]}>
        <Box args={[0.2, 0.03, 0.01]}>
          <meshStandardMaterial color="#333333" />
        </Box>
        <Box 
          args={[0.18 * (drone.battery / 100), 0.025, 0.015]} 
          position={[-0.09 + (0.09 * drone.battery / 100), 0, 0.01]}
        >
          <meshStandardMaterial 
            color={drone.battery > 50 ? '#52c41a' : drone.battery > 20 ? '#faad14' : '#f5222d'} 
          />
        </Box>
      </group>

      {/* 状态指示光环 */}
      {drone.status === 'flying' && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
          <ringGeometry args={[0.4, 0.45, 32]} />
          <meshStandardMaterial 
            color={getStatusColor(drone.status)} 
            transparent 
            opacity={0.3}
            emissive={getStatusColor(drone.status)}
            emissiveIntensity={0.2}
          />
        </mesh>
      )}
    </group>
  );
};

// 编队连线组件
const FormationLines: React.FC<{
  drones: DroneData[];
  group: GroupData;
}> = ({ drones, group }) => {
  const groupDrones = drones.filter(d => group.memberIds.includes(d.id));
  const leader = groupDrones.find(d => d.isLeader);
  
  if (!leader || groupDrones.length < 2) return null;

  // 生成连线点
  const lines = groupDrones
    .filter(d => !d.isLeader)
    .map(drone => {
      const leaderPos: [number, number, number] = [leader.position[0] * 0.01, leader.position[2] * 0.01, leader.position[1] * 0.01];
      const dronePos: [number, number, number] = [drone.position[0] * 0.01, drone.position[2] * 0.01, drone.position[1] * 0.01];
      return [leaderPos, dronePos];
    });

  return (
    <>
      {lines.map((points, index) => (
        <Line
          key={index}
          points={points as any}
          color="#1890ff"
          lineWidth={2}
          transparent
          opacity={0.6}
        />
      ))}
    </>
  );
};

// 编队区域指示器
const FormationArea: React.FC<{
  drones: DroneData[];
  group: GroupData;
}> = ({ drones, group }) => {
  const groupDrones = drones.filter(d => group.memberIds.includes(d.id));
  
  if (groupDrones.length < 2) return null;

  // 计算编队中心点
  const centerCalc = groupDrones.reduce(
    (acc, drone) => [
      acc[0] + drone.position[0] * 0.01,
      acc[1] + drone.position[2] * 0.01,
      acc[2] + drone.position[1] * 0.01
    ],
    [0, 0, 0]
  );
  const center: [number, number, number] = [
    centerCalc[0] / groupDrones.length,
    centerCalc[1] / groupDrones.length,
    centerCalc[2] / groupDrones.length
  ];

  // 计算编队半径
  const radius = Math.max(
    ...groupDrones.map(drone => 
      Math.sqrt(
        Math.pow(drone.position[0] * 0.01 - center[0], 2) +
        Math.pow(drone.position[1] * 0.01 - center[2], 2)
      )
    )
  ) + 0.5;

  return (
    <mesh position={center} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius, radius + 0.1, 64]} />
      <meshStandardMaterial 
        color="#722ed1" 
        transparent 
        opacity={0.2}
        emissive="#722ed1"
        emissiveIntensity={0.1}
      />
    </mesh>
  );
};

// 主要的3D编队可视化组件
const DroneFormationVisualization3D: React.FC<{
  drones?: DroneData[];
  groups?: GroupData[];
  selectedDroneId?: string;
  onDroneSelect?: (droneId: string) => void;
}> = ({ 
  drones = [], 
  groups = [], 
  selectedDroneId,
  onDroneSelect 
}) => {
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([10, 10, 10]);

  // 默认模拟数据
  const defaultDrones: DroneData[] = [
    {
      id: 'drone_001',
      name: 'SkyEye-01',
      position: [39.9042, 116.4074, 120],
      status: 'idle',
      battery: 85
    },
    {
      id: 'drone_002',
      name: 'SkyEye-02',
      position: [39.9142, 116.4174, 115],
      status: 'flying',
      battery: 72,
      isLeader: true,
      groupId: 'group_001'
    },
    {
      id: 'drone_003',
      name: 'SkyEye-03',
      position: [39.9122, 116.4154, 115],
      status: 'flying',
      battery: 68,
      groupId: 'group_001'
    },
    {
      id: 'drone_004',
      name: 'SkyEye-04',
      position: [39.9000, 116.4000, 0],
      status: 'charging',
      battery: 45
    }
  ];

  const defaultGroups: GroupData[] = [
    {
      id: 'group_001',
      name: '巡逻编队Alpha',
      formation: 'line',
      memberIds: ['drone_002', 'drone_003'],
      leaderId: 'drone_002',
      status: 'mission'
    }
  ];

  const displayDrones = drones.length > 0 ? drones : defaultDrones;
  const displayGroups = groups.length > 0 ? groups : defaultGroups;

  return (
    <div style={{ width: '100%', height: '100%', background: '#000' }}>
      <Canvas
        camera={{ position: cameraPosition, fov: 60 }}
        style={{ background: 'linear-gradient(to bottom, #001529 0%, #000000 100%)' }}
      >
        {/* 环境光 */}
        <ambientLight intensity={0.4} />
        
        {/* 主光源 */}
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {/* 点光源 */}
        <pointLight position={[0, 10, 0]} intensity={0.5} color="#1890ff" />

        {/* 地面网格 */}
        <gridHelper args={[20, 20, '#1890ff', '#333333']} position={[0, -1, 0]} />

        {/* 渲染所有无人机 */}
        {displayDrones.map(drone => (
          <DroneModel
            key={drone.id}
            drone={drone}
            isSelected={selectedDroneId === drone.id}
            onClick={() => onDroneSelect?.(drone.id)}
          />
        ))}

        {/* 渲染编队连线和区域 */}
        {displayGroups.map(group => (
          <group key={group.id}>
            <FormationLines drones={displayDrones} group={group} />
            <FormationArea drones={displayDrones} group={group} />
          </group>
        ))}

        {/* 3D文字标题 */}
        <Text
          position={[0, 8, 0]}
          fontSize={0.5}
          color="#1890ff"
          anchorX="center"
          anchorY="middle"
        >
          SkyBrain 无人机编队可视化
        </Text>

        {/* 控制器 */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>

      {/* 图例 */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '12px',
        borderRadius: '6px',
        color: 'white',
        fontSize: '12px',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>状态图例</div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
          <div style={{ width: '12px', height: '12px', background: '#52c41a', marginRight: '8px' }}></div>
          待机
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
          <div style={{ width: '12px', height: '12px', background: '#1890ff', marginRight: '8px' }}></div>
          飞行中
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
          <div style={{ width: '12px', height: '12px', background: '#faad14', marginRight: '8px' }}></div>
          充电中
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
          <div style={{ width: '12px', height: '12px', background: '#f5222d', marginRight: '8px' }}></div>
          离线
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '12px', height: '12px', background: '#ffd700', marginRight: '8px', borderRadius: '50%' }}></div>
          队长标识
        </div>
      </div>

      {/* 操作提示 */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '12px',
        borderRadius: '6px',
        color: 'white',
        fontSize: '12px',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ marginBottom: '4px' }}>🖱️ 鼠标拖拽：旋转视角</div>
        <div style={{ marginBottom: '4px' }}>🔍 滚轮：缩放视图</div>
        <div>👆 点击无人机：选择设备</div>
      </div>
    </div>
  );
};

export default DroneFormationVisualization3D;