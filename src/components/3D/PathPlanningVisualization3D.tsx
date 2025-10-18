'use client';

import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Line, Html, Text } from '@react-three/drei';
import { Button, Space, Badge, Card, Select, Tooltip, Progress, Slider } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  ReloadOutlined,
  AimOutlined,
  EnvironmentOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  FastForwardOutlined,
  StepForwardOutlined
} from '@ant-design/icons';
import * as THREE from 'three';
import { PathPlanningResult, Waypoint } from '../../algorithms/IntelligentPathPlanning';

// 区域预警类型定义
interface ZoneAlert {
  type: 'no-fly' | 'restricted' | 'temporary';
  level: 'warning' | 'danger' | 'critical';
  message: string;
  distance: number;
}

// 禁飞区域类型
interface NoFlyZone {
  id: string;
  type: 'no-fly' | 'restricted' | 'temporary';
  center: [number, number, number];
  radius: number;
  name: string;
  description: string;
}

const { Option } = Select;

interface PathPlanningVisualization3DProps {
  planningResult?: PathPlanningResult | null;
  currentDronePosition?: [number, number, number];
  onWaypointClick?: (waypoint: Waypoint) => void;
  onPathGenerated?: (result: PathPlanningResult) => void;
  showAlternativePaths?: boolean;
}

// 飞行中的无人机组件
const FlyingDrone: React.FC<{ 
  path: Waypoint[];
  isFlying: boolean;
  speed: number;
  noFlyZones?: NoFlyZone[];
  onWaypointReached?: (waypointIndex: number) => void;
  onFlightComplete?: () => void;
  onZoneAlert?: (alert: ZoneAlert | null) => void;
}> = ({ path, isFlying, speed, noFlyZones = [], onWaypointReached, onFlightComplete, onZoneAlert }) => {
  const droneRef = useRef<THREE.Group>(null);
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<THREE.Vector3>(
    new THREE.Vector3(...(path[0]?.position || [0, 0, 0]))
  );
  const [rotationTime, setRotationTime] = useState(0);
  const [currentAlert, setCurrentAlert] = useState<ZoneAlert | null>(null);

  // 检测区域预警
  const checkZoneAlerts = (position: THREE.Vector3) => {
    let closestAlert: ZoneAlert | null = null;
    let minDistance = Infinity;

    noFlyZones.forEach(zone => {
      const zoneCenter = new THREE.Vector3(...zone.center);
      const distance = position.distanceTo(zoneCenter);
      const relativeDistance = distance - zone.radius;

      if (distance < minDistance) {
        minDistance = distance;

        // 根据区域类型和距离确定预警等级
        let alert: ZoneAlert | null = null;

        if (relativeDistance <= 0) {
          // 已进入区域
          switch (zone.type) {
            case 'no-fly':
              alert = {
                type: zone.type,
                level: 'critical',
                message: '🚨 严重警告：已进入禁飞区域！立即返航！',
                distance: relativeDistance
              };
              break;
            case 'restricted':
              alert = {
                type: zone.type,
                level: 'danger',
                message: '⚠️ 危险：已进入限制区域！请谨慎飞行！',
                distance: relativeDistance
              };
              break;
            case 'temporary':
              alert = {
                type: zone.type,
                level: 'warning',
                message: '⚡ 注意：已进入临时管制区域！',
                distance: relativeDistance
              };
              break;
          }
        } else if (relativeDistance <= 0.5) {
          // 接近区域（0.5km内）
          switch (zone.type) {
            case 'no-fly':
              alert = {
                type: zone.type,
                level: 'danger',
                message: `🚨 警告：接近禁飞区域！距离${relativeDistance.toFixed(1)}km`,
                distance: relativeDistance
              };
              break;
            case 'restricted':
              alert = {
                type: zone.type,
                level: 'warning',
                message: `⚠️ 提醒：接近限制区域！距离${relativeDistance.toFixed(1)}km`,
                distance: relativeDistance
              };
              break;
            case 'temporary':
              alert = {
                type: zone.type,
                level: 'warning',
                message: `⚡ 提醒：接近临时管制区域！距离${relativeDistance.toFixed(1)}km`,
                distance: relativeDistance
              };
              break;
          }
        }

        if (alert) {
          closestAlert = alert;
        }
      }
    });

    // 更新预警状态
    if (JSON.stringify(closestAlert) !== JSON.stringify(currentAlert)) {
      setCurrentAlert(closestAlert);
      onZoneAlert?.(closestAlert);
    }
  };

  useFrame((state, delta) => {
    // 更新旋转时间
    setRotationTime(prev => prev + delta);
    if (!droneRef.current || !isFlying || path.length < 2) return;

    const currentWaypoint = path[currentWaypointIndex];
    const nextWaypoint = path[currentWaypointIndex + 1];

    if (!currentWaypoint || !nextWaypoint) {
      // 飞行完成
      if (currentWaypointIndex >= path.length - 1) {
        onFlightComplete?.();
      }
      return;
    }

    // 计算当前位置到下一个航点的距离和方向
    const currentPos = new THREE.Vector3(...currentWaypoint.position);
    const nextPos = new THREE.Vector3(...nextWaypoint.position);
    const direction = nextPos.clone().sub(currentPos).normalize();
    const distance = currentPos.distanceTo(nextPos);

    // 更新进度
    const moveDistance = speed * delta;
    const newProgress = progress + (moveDistance / distance);

    if (newProgress >= 1) {
      // 到达下一个航点
      setCurrentPosition(nextPos.clone());
      setCurrentWaypointIndex(prev => prev + 1);
      setProgress(0);
      onWaypointReached?.(currentWaypointIndex + 1);
    } else {
      // 在两个航点之间移动
      const interpolatedPos = currentPos.clone().lerp(nextPos, newProgress);
      setCurrentPosition(interpolatedPos);
      setProgress(newProgress);
    }

    // 更新无人机位置和朝向
    droneRef.current.position.copy(currentPosition);
    
    // 让无人机朝向飞行方向
    if (direction.length() > 0) {
      droneRef.current.lookAt(
        currentPosition.x + direction.x,
        currentPosition.y + direction.y,
        currentPosition.z + direction.z
      );
    }

    // 检测区域预警
    checkZoneAlerts(currentPosition);

    // 添加飞行时的轻微摇摆
    const time = state.clock.getElapsedTime();
    droneRef.current.rotation.z = Math.sin(time * 8) * 0.05;
    droneRef.current.rotation.x = Math.sin(time * 6) * 0.03;
  });

  return (
    <group ref={droneRef}>
      {/* 无人机主体 */}
      <mesh>
        <boxGeometry args={[0.8, 0.15, 0.8]} />
        <meshStandardMaterial 
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* 螺旋桨 */}
      {[[-0.3, 0.1, -0.3], [0.3, 0.1, -0.3], [-0.3, 0.1, 0.3], [0.3, 0.1, 0.3]].map((pos, i) => (
        <group key={i} position={pos}>
          <mesh rotation={[0, rotationTime * 20, 0]}>
            <boxGeometry args={[0.4, 0.02, 0.05]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </group>
      ))}
      
      {/* LED指示灯 */}
      <mesh position={[0, 0.1, 0.4]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial 
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={0.8}
        />
      </mesh>
      
      <mesh position={[0, 0.1, -0.4]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial 
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* 飞行信息显示 */}
      <Html position={[0, 0.8, 0]} center>
        <div style={{
          background: 'rgba(0, 255, 136, 0.9)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          textAlign: 'center',
          border: '1px solid #00ff88',
          boxShadow: '0 0 10px rgba(0, 255, 136, 0.5)'
        }}>
          <div>飞行中</div>
          <div>航点: {currentWaypointIndex + 1}/{path.length}</div>
          <div>进度: {Math.round(progress * 100)}%</div>
        </div>
      </Html>
    </group>
  );
};

// 动态路径绘制组件
const AnimatedPathLine: React.FC<{ 
  points: [number, number, number][]; 
  color?: string;
  animated?: boolean;
  drawProgress?: number;
}> = ({ points, color = '#1890FF', animated = true, drawProgress = 1 }) => {
  const lineRef = useRef<THREE.Line>(null);
  const [visiblePoints, setVisiblePoints] = useState<[number, number, number][]>([]);

  useEffect(() => {
    if (points.length === 0) return;
    
    const pointCount = Math.floor(points.length * drawProgress);
    setVisiblePoints(points.slice(0, Math.max(2, pointCount)));
  }, [points, drawProgress]);

  useFrame((state) => {
    if (lineRef.current && lineRef.current.material && animated) {
      const time = state.clock.getElapsedTime();
      const material = lineRef.current.material as THREE.LineBasicMaterial;
      
      // 流动效果
      const dashOffset = (time * 2) % 1;
      if (material.userData) {
        material.userData.dashOffset = dashOffset;
      }
      
      // 呼吸效果
      material.opacity = 0.6 + Math.sin(time * 3) * 0.3;
    }
  });

  if (visiblePoints.length < 2) return null;

  return (
    <Line
      ref={lineRef}
      points={visiblePoints}
      color={color}
      lineWidth={4}
      transparent
      opacity={0.8}
      dashed
      dashSize={0.3}
      gapSize={0.1}
    />
  );
};

// 航点标记组件（增强版）
const WaypointMarker: React.FC<{ 
  waypoint: Waypoint; 
  index: number;
  isActive?: boolean;
  isReached?: boolean;
  isNext?: boolean;
  onClick?: () => void;
}> = ({ waypoint, index, isActive = false, isReached = false, isNext = false, onClick }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      
      // 不同状态的动画效果
      if (isNext) {
        // 下一个航点：快速脉冲
        meshRef.current.scale.setScalar(1 + Math.sin(time * 8) * 0.2);
        meshRef.current.rotation.y = time * 4;
      } else if (isReached) {
        // 已到达：缓慢旋转
        meshRef.current.rotation.y = time * 0.5;
        meshRef.current.scale.setScalar(0.8);
      } else if (isActive) {
        // 活跃状态：中等脉冲
        meshRef.current.scale.setScalar(1 + Math.sin(time * 4) * 0.1);
        meshRef.current.rotation.y = time * 2;
      } else {
        // 默认状态：轻微浮动
        meshRef.current.position.y = waypoint.position[1] + Math.sin(time * 2 + index) * 0.05;
        meshRef.current.rotation.y = time * 0.5;
      }
      
      meshRef.current.position.x = waypoint.position[0];
      meshRef.current.position.z = waypoint.position[2];
    }
  });

  // 根据航点状态获取样式
  const getWaypointStyle = () => {
    if (isReached) {
      return { color: '#52C41A', size: 0.25, intensity: 0.6, opacity: 0.7 };
    } else if (isNext) {
      return { color: '#FAAD14', size: 0.35, intensity: 1.2, opacity: 1.0 };
    } else if (waypoint.type === 'start') {
      return { color: '#52C41A', size: 0.3, intensity: 1.0, opacity: 0.9 };
    } else if (waypoint.type === 'end') {
      return { color: '#FF4D4F', size: 0.3, intensity: 1.0, opacity: 0.9 };
    } else {
      return { color: '#1890FF', size: 0.2, intensity: 0.8, opacity: 0.8 };
    }
  };

  const style = getWaypointStyle();
  const riskLevel = waypoint.metadata?.riskLevel || 0;
  const riskColor = riskLevel > 0.6 ? '#FF4D4F' : riskLevel > 0.3 ? '#FAAD14' : '#52C41A';

  return (
    <group ref={meshRef} position={waypoint.position} onClick={onClick}>
      {/* 主标记 */}
      <mesh>
        <sphereGeometry args={[style.size, 16, 16]} />
        <meshStandardMaterial 
          color={style.color}
          emissive={style.color}
          emissiveIntensity={style.intensity}
          transparent
          opacity={style.opacity}
        />
      </mesh>
      
      {/* 状态指示环 */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <ringGeometry args={[style.size + 0.1, style.size + 0.15, 16]} />
        <meshBasicMaterial 
          color={isReached ? '#52C41A' : isNext ? '#FAAD14' : style.color}
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {/* 到达效果 */}
      {isReached && (
        <mesh>
          <sphereGeometry args={[style.size * 3, 16, 16]} />
          <meshBasicMaterial 
            color="#52C41A"
            transparent
            opacity={0.1}
          />
        </mesh>
      )}

      {/* 航点信息 */}
      <Html position={[0, style.size + 0.4, 0]} center>
        <div style={{
          background: isReached ? 'rgba(82, 196, 26, 0.9)' : 
                     isNext ? 'rgba(250, 173, 20, 0.9)' : 
                     'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '3px 8px',
          borderRadius: '4px',
          fontSize: '9px',
          whiteSpace: 'nowrap',
          border: `1px solid ${style.color}`,
          boxShadow: `0 0 8px ${style.color}50`,
          textAlign: 'center'
        }}>
          <div>
            {waypoint.type === 'start' ? '🚁 起点' :
             waypoint.type === 'end' ? '🎯 终点' :
             `📍 航点${index + 1}`}
          </div>
          {isReached && <div style={{ fontSize: '8px', color: '#52C41A' }}>✅ 已到达</div>}
          {isNext && <div style={{ fontSize: '8px', color: '#FAAD14' }}>⏭️ 下一个</div>}
          {riskLevel > 0 && (
            <div style={{ fontSize: '7px', color: riskColor }}>
              ⚠️ 风险: {Math.round(riskLevel * 100)}%
            </div>
          )}
        </div>
      </Html>
    </group>
  );
};

// 禁飞区域组件
const NoFlyZone: React.FC<{ 
  center: [number, number, number]; 
  radius: number; 
  type: 'no-fly' | 'restricted' | 'temporary';
}> = ({ center, radius, type }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.rotation.y = time * 0.5;
      
      if (meshRef.current.material) {
        const material = meshRef.current.material as THREE.MeshBasicMaterial;
        material.opacity = 0.1 + Math.sin(time * 2) * 0.05;
      }
    }
  });

  const getZoneColor = () => {
    switch (type) {
      case 'no-fly': return '#FF4D4F';
      case 'restricted': return '#FAAD14';
      case 'temporary': return '#722ED1';
      default: return '#FF4D4F';
    }
  };

  const color = getZoneColor();

  return (
    <group position={center}>
      {/* 禁飞区域球体 */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshBasicMaterial 
          color={color}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* 边界线框 */}
      <mesh>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshBasicMaterial 
          color={color}
          transparent
          opacity={0.4}
          wireframe
        />
      </mesh>
      
      {/* 警告标识 */}
      <Html position={[0, radius + 0.5, 0]} center>
        <div style={{
          background: `${color}20`,
          color: color,
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '8px',
          border: `1px solid ${color}`,
          textAlign: 'center'
        }}>
          <WarningOutlined />
          <div>
            {type === 'no-fly' ? '禁飞区' :
             type === 'restricted' ? '限制区' : '临时管制'}
          </div>
        </div>
      </Html>
    </group>
  );
};

// 主场景组件
const PathPlanningScene: React.FC<{
  planningResult?: PathPlanningResult | null;
  currentDronePosition: [number, number, number];
  showAlternativePaths: boolean;
  selectedPathIndex: number;
  isFlying: boolean;
  flightSpeed: number;
  reachedWaypoints: number[];
  nextWaypoint: number;
  pathDrawProgress: number;
  noFlyZones: NoFlyZone[];
  onWaypointClick?: (waypoint: Waypoint) => void;
  onWaypointReached?: (waypointIndex: number) => void;
  onFlightComplete?: () => void;
  onZoneAlert?: (alert: ZoneAlert | null) => void;
}> = ({ 
  planningResult, 
  currentDronePosition, 
  showAlternativePaths, 
  selectedPathIndex,
  isFlying,
  flightSpeed,
  reachedWaypoints,
  nextWaypoint,
  pathDrawProgress,
  noFlyZones,
  onWaypointClick,
  onWaypointReached,
  onFlightComplete,
  onZoneAlert
}) => {
  return (
    <>
      {/* 环境光照 */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1.0} />
      <pointLight position={[0, 8, 0]} intensity={0.6} color="#1890FF" />

      {/* 地面网格 */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial 
          color="#0a1628" 
          transparent 
          opacity={0.8}
          wireframe
        />
      </mesh>

      {/* 坐标轴标注 (1km单位) */}
      {/* X轴 (东西方向) */}
      <Line
        points={[new THREE.Vector3(-10, 0, 0), new THREE.Vector3(10, 0, 0)]}
        color="#ff0000"
        lineWidth={2}
      />
      <Text
        position={[10.5, 0.5, 0]}
        fontSize={0.8}
        color="#ff0000"
        anchorX="left"
        anchorY="middle"
      >
        X轴 (东西) +10km
      </Text>
      <Text
        position={[-10.5, 0.5, 0]}
        fontSize={0.8}
        color="#ff0000"
        anchorX="right"
        anchorY="middle"
      >
        -10km
      </Text>

      {/* Y轴 (高度) */}
      <Line
        points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 10, 0)]}
        color="#00ff00"
        lineWidth={2}
      />
      <Text
        position={[0.5, 10.5, 0]}
        fontSize={0.8}
        color="#00ff00"
        anchorX="left"
        anchorY="middle"
      >
        Y轴 (高度) +10km
      </Text>

      {/* Z轴 (南北方向) */}
      <Line
        points={[new THREE.Vector3(0, 0, -10), new THREE.Vector3(0, 0, 10)]}
        color="#0000ff"
        lineWidth={2}
      />
      <Text
        position={[0, 0.5, 10.5]}
        fontSize={0.8}
        color="#0000ff"
        anchorX="left"
        anchorY="middle"
      >
        Z轴 (南北) +10km
      </Text>
      <Text
        position={[0, 0.5, -10.5]}
        fontSize={0.8}
        color="#0000ff"
        anchorX="right"
        anchorY="middle"
      >
        -10km
      </Text>

      {/* 刻度标记 */}
      {[-5, -2.5, 2.5, 5].map((pos) => (
        <React.Fragment key={pos}>
          {/* X轴刻度 */}
          <Line
            points={[new THREE.Vector3(pos, 0, -0.2), new THREE.Vector3(pos, 0, 0.2)]}
            color="#ff0000"
            lineWidth={1}
          />
          <Text
            position={[pos, 0.3, 0]}
            fontSize={0.4}
            color="#ff0000"
            anchorX="center"
            anchorY="middle"
          >
            {pos}km
          </Text>
          
          {/* Z轴刻度 */}
          <Line
            points={[new THREE.Vector3(-0.2, 0, pos), new THREE.Vector3(0.2, 0, pos)]}
            color="#0000ff"
            lineWidth={1}
          />
          <Text
            position={[0, 0.3, pos]}
            fontSize={0.4}
            color="#0000ff"
            anchorX="center"
            anchorY="middle"
          >
            {pos}km
          </Text>
        </React.Fragment>
      ))}

      {/* Y轴刻度 (高度) */}
      {[2.5, 5, 7.5].map((pos) => (
        <React.Fragment key={pos}>
          <Line
            points={[new THREE.Vector3(-0.2, pos, 0), new THREE.Vector3(0.2, pos, 0)]}
            color="#00ff00"
            lineWidth={1}
          />
          <Text
            position={[0.3, pos, 0]}
            fontSize={0.4}
            color="#00ff00"
            anchorX="left"
            anchorY="middle"
          >
            {pos}km
          </Text>
        </React.Fragment>
      ))}

      {/* 禁飞区域 */}
      {noFlyZones.map((zone, index) => (
        <NoFlyZone
          key={index}
          center={zone.center}
          radius={zone.radius}
          type={zone.type}
        />
      ))}

      {/* 飞行中的无人机 */}
      {isFlying && planningResult && planningResult.path.length > 0 && (
        <FlyingDrone
          path={planningResult.path}
          isFlying={isFlying}
          speed={flightSpeed}
          noFlyZones={noFlyZones}
          onWaypointReached={onWaypointReached}
          onFlightComplete={onFlightComplete}
          onZoneAlert={onZoneAlert}
        />
      )}

      {/* 静态无人机位置（未飞行时） */}
      {!isFlying && (
        <group position={currentDronePosition}>
          <mesh>
            <boxGeometry args={[0.6, 0.2, 0.6]} />
            <meshStandardMaterial 
              color="#00ff88"
              emissive="#00ff88"
              emissiveIntensity={0.5}
            />
          </mesh>
          <Html position={[0, 0.5, 0]} center>
            <div style={{
              background: 'rgba(0, 255, 136, 0.2)',
              color: '#00ff88',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '8px',
              border: '1px solid #00ff88'
            }}>
              待命中
            </div>
          </Html>
        </group>
      )}

      {/* 主要规划路径 */}
      {planningResult && planningResult.path.length > 0 && (
        <>
          {/* 动态路径线 */}
          <AnimatedPathLine
            points={planningResult.path.map(wp => wp.position)}
            color="#1890FF"
            animated={true}
            drawProgress={pathDrawProgress}
          />
          
          {/* 航点标记 */}
          {planningResult.path.map((waypoint, index) => (
            <WaypointMarker
              key={waypoint.id}
              waypoint={waypoint}
              index={index}
              isActive={true}
              isReached={reachedWaypoints.includes(index)}
              isNext={index === nextWaypoint}
              onClick={() => onWaypointClick?.(waypoint)}
            />
          ))}
        </>
      )}

      {/* 备选路径 */}
      {showAlternativePaths && planningResult?.alternativePaths && (
        <>
          {planningResult.alternativePaths.map((altPath, pathIndex) => (
            <React.Fragment key={`alt-path-${pathIndex}`}>
              <AnimatedPathLine
                points={altPath.map(wp => wp.position)}
                color={pathIndex === selectedPathIndex ? '#52C41A' : '#FAAD14'}
                animated={pathIndex === selectedPathIndex}
                drawProgress={1}
              />
              
              {/* 只显示选中备选路径的航点 */}
              {pathIndex === selectedPathIndex && altPath.map((waypoint, index) => (
                <WaypointMarker
                  key={`alt-${pathIndex}-${waypoint.id}`}
                  waypoint={waypoint}
                  index={index}
                  isActive={false}
                  onClick={() => onWaypointClick?.(waypoint)}
                />
              ))}
            </React.Fragment>
          ))}
        </>
      )}

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
export const PathPlanningVisualization3D: React.FC<PathPlanningVisualization3DProps> = ({
  planningResult,
  currentDronePosition = [0, 3, 0],
  onWaypointClick,
  onPathGenerated,
  showAlternativePaths = false
}) => {
  const [isClient, setIsClient] = useState(false);
  const [selectedPathIndex, setSelectedPathIndex] = useState(0);
  const [showPaths, setShowPaths] = useState(true);
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([8, 6, 8]);
  
  // 飞行控制状态
  const [isFlying, setIsFlying] = useState(false);
  const [flightSpeed, setFlightSpeed] = useState(2.0);
  const [reachedWaypoints, setReachedWaypoints] = useState<number[]>([]);
  const [nextWaypoint, setNextWaypoint] = useState(1);
  const [pathDrawProgress, setPathDrawProgress] = useState(1);
  const [flightProgress, setFlightProgress] = useState(0);
  const [currentAlert, setCurrentAlert] = useState<ZoneAlert | null>(null);

  // 示例禁飞区域数据
  const noFlyZones: NoFlyZone[] = [
    {
      id: 'airport-zone',
      type: 'no-fly',
      center: [3, 2, 2],
      radius: 1.5,
      name: '机场禁飞区',
      description: '机场周边严格禁飞区域'
    },
    {
      id: 'military-zone',
      type: 'restricted',
      center: [-2, 3, 4],
      radius: 2.0,
      name: '军事限制区',
      description: '军事设施周边限制飞行区域'
    },
    {
      id: 'temp-control',
      type: 'temporary',
      center: [1, 4, 6],
      radius: 1.2,
      name: '临时管制区',
      description: '活动期间临时管制区域'
    }
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 处理区域预警
  const handleZoneAlert = (alert: ZoneAlert | null) => {
    setCurrentAlert(alert);
    if (alert) {
      console.log(`🚨 区域预警: ${alert.message}`);
      // 这里可以添加更多预警处理逻辑，比如：
      // - 显示弹窗警告
      // - 自动调整飞行路径
      // - 记录预警日志
      // - 发送通知给操作员
    }
  };

  // 开始飞行
  const startFlight = () => {
    console.log('🚁 尝试开始飞行，planningResult:', planningResult);
    
    // 如果没有规划结果，创建默认演示路径
    if (!planningResult || !planningResult.path || planningResult.path.length < 2) {
      console.warn('路径数据不足，创建默认演示路径');
      
      // 创建默认路径用于演示
      const defaultPath = [
        { position: [0, 2, 0], type: 'start' as const, id: 'start' },
        { position: [2, 3, 20], type: 'checkpoint' as const, id: 'wp1' },
        { position: [4, 4, 40], type: 'checkpoint' as const, id: 'wp2' },
        { position: [6, 3, 60], type: 'checkpoint' as const, id: 'wp3' },
        { position: [8, 2, 80], type: 'end' as const, id: 'end' }
      ];
      
      // 临时设置默认规划结果用于演示
      const tempResult = {
        path: defaultPath,
        totalDistance: 100,
        estimatedTime: 300,
        riskScore: 0.2,
        fuelConsumption: 15,
        waypoints: defaultPath
      };
      
      // 如果有回调函数，通知父组件
      if (onPathGenerated) {
        onPathGenerated(tempResult);
      }
    }
    
    setIsFlying(true);
    setReachedWaypoints([0]); // 起点已到达
    setNextWaypoint(1);
    setFlightProgress(0);
    console.log('🚁 飞行开始！');
  };

  // 暂停/继续飞行
  const toggleFlight = () => {
    setIsFlying(!isFlying);
  };

  // 重置飞行
  const resetFlight = () => {
    setIsFlying(false);
    setReachedWaypoints([]);
    setNextWaypoint(1);
    setFlightProgress(0);
    setPathDrawProgress(1);
  };

  // 航点到达处理
  const handleWaypointReached = (waypointIndex: number) => {
    setReachedWaypoints(prev => [...prev, waypointIndex]);
    setNextWaypoint(waypointIndex + 1);
    
    if (planningResult) {
      const progress = waypointIndex / (planningResult.path.length - 1);
      setFlightProgress(progress);
    }
  };

  // 飞行完成处理
  const handleFlightComplete = () => {
    setIsFlying(false);
    setFlightProgress(1);
    
    // 显示完成通知
    setTimeout(() => {
      alert('🎉 飞行任务完成！');
    }, 500);
  };

  // 动态绘制路径
  const startPathDrawing = () => {
    setPathDrawProgress(0);
    const interval = setInterval(() => {
      setPathDrawProgress(prev => {
        if (prev >= 1) {
          clearInterval(interval);
          return 1;
        }
        return prev + 0.02;
      });
    }, 50);
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
      case 'follow':
        setCameraPosition([5, 3, 5]);
        break;
      default:
        setCameraPosition([8, 6, 8]);
    }
  };

  const getPathStatus = () => {
    if (!planningResult) return { color: '#8C8C8C', text: '未规划路径' };
    
    const riskScore = planningResult.riskScore;
    if (riskScore < 0.3) return { color: '#52C41A', text: '安全路径' };
    if (riskScore < 0.6) return { color: '#FAAD14', text: '中等风险' };
    return { color: '#FF4D4F', text: '高风险路径' };
  };

  const pathStatus = getPathStatus();

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* 飞行控制面板 */}
      <Card
        size="small"
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 10,
          width: '280px',
          background: 'rgba(0, 0, 0, 0.9)',
          border: '1px solid rgba(24, 144, 255, 0.3)'
        }}
        bodyStyle={{ padding: '12px' }}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {/* 飞行控制按钮 */}
          <div style={{ textAlign: 'center' }}>
            <Space>
              {!isFlying ? (
                <Button 
                  type="primary" 
                  icon={<PlayCircleOutlined />}
                  onClick={startFlight}
                  disabled={!planningResult || planningResult.path.length < 2}
                >
                  开始飞行
                </Button>
              ) : (
                <Button 
                  icon={<PauseCircleOutlined />}
                  onClick={toggleFlight}
                >
                  暂停
                </Button>
              )}
              <Button 
                icon={<ReloadOutlined />}
                onClick={resetFlight}
              >
                重置
              </Button>
              <Button 
                icon={<StepForwardOutlined />}
                onClick={startPathDrawing}
                size="small"
              >
                绘制路径
              </Button>
            </Space>
          </div>

          {/* 飞行进度 */}
          {planningResult && (
            <div>
              <div style={{ color: 'white', fontSize: '12px', marginBottom: '4px' }}>
                飞行进度: {Math.round(flightProgress * 100)}%
              </div>
              <Progress 
                percent={flightProgress * 100} 
                size="small"
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
              <div style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>
                已到达: {reachedWaypoints.length}/{planningResult.path.length} 个航点
              </div>
            </div>
          )}

          {/* 飞行速度控制 */}
          <div>
            <div style={{ color: 'white', fontSize: '12px', marginBottom: '4px' }}>
              飞行速度: {flightSpeed.toFixed(1)}x
            </div>
            <Slider
              min={0.5}
              max={5.0}
              step={0.1}
              value={flightSpeed}
              onChange={setFlightSpeed}
              disabled={isFlying}
            />
          </div>

          {/* 路径状态 */}
          <div style={{ textAlign: 'center' }}>
            <Badge 
              color={pathStatus.color} 
              text={
                <span style={{ color: pathStatus.color, fontWeight: 'bold', fontSize: '12px' }}>
                  {pathStatus.text}
                </span>
              }
            />
          </div>
        </Space>
      </Card>

      {/* 区域预警面板 */}
      {currentAlert && (
        <Card
          size="small"
          style={{
            position: 'absolute',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 30,
            width: '420px',
            maxWidth: 'calc(100vw - 40px)',
            background: currentAlert.level === 'critical' ? 'rgba(255, 77, 79, 0.98)' :
                       currentAlert.level === 'danger' ? 'rgba(250, 173, 20, 0.98)' :
                       'rgba(114, 46, 209, 0.98)',
            border: `3px solid ${
              currentAlert.level === 'critical' ? '#FF4D4F' :
              currentAlert.level === 'danger' ? '#FAAD14' :
              '#722ED1'
            }`,
            borderRadius: '12px',
            boxShadow: `0 8px 32px ${
              currentAlert.level === 'critical' ? '#FF4D4F' :
              currentAlert.level === 'danger' ? '#FAAD14' :
              '#722ED1'
            }60`,
            animation: currentAlert.level === 'critical' ? 'alertPulse 1.5s ease-in-out infinite' : 'none'
          }}
          bodyStyle={{ padding: '20px' }}
        >
          <div style={{ 
            color: 'white', 
            textAlign: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
            lineHeight: '1.4',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}>
            {currentAlert.message}
          </div>
          <div style={{ 
            color: 'rgba(255, 255, 255, 0.9)', 
            textAlign: 'center',
            fontSize: '13px',
            marginTop: '12px',
            padding: '8px',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '6px'
          }}>
            <div style={{ marginBottom: '4px' }}>
              区域类型: <strong>{
                currentAlert.type === 'no-fly' ? '🚫 禁飞区' :
                currentAlert.type === 'restricted' ? '⚠️ 限制区' :
                '⚡ 临时管制区'
              }</strong>
            </div>
            <div>
              预警等级: <strong style={{ 
                color: currentAlert.level === 'critical' ? '#FFE58F' :
                       currentAlert.level === 'danger' ? '#FFF1B8' :
                       '#F9F0FF'
              }}>
                {currentAlert.level === 'critical' ? '🔴 严重' :
                 currentAlert.level === 'danger' ? '🟡 危险' :
                 '🟣 警告'}
              </strong>
            </div>
            {currentAlert.distance < 0 && (
              <div style={{ 
                marginTop: '8px', 
                color: '#fff',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                📍 已进入区域 {Math.abs(currentAlert.distance).toFixed(1)}km
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 添加CSS动画样式 */}
      <style jsx>{`
        @keyframes alertPulse {
          0%, 100% { 
            transform: translateX(-50%) scale(1);
            box-shadow: 0 8px 32px rgba(255, 77, 79, 0.6);
          }
          50% { 
            transform: translateX(-50%) scale(1.02);
            box-shadow: 0 12px 40px rgba(255, 77, 79, 0.8);
          }
        }
      `}</style>

      {/* 路径信息面板 */}
      <Card
        size="small"
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 10,
          width: '260px',
          background: 'rgba(0, 0, 0, 0.9)',
          border: '1px solid rgba(24, 144, 255, 0.3)'
        }}
        bodyStyle={{ padding: '12px' }}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {/* 路径信息 */}
          {planningResult && (
            <div style={{ 
              padding: '8px',
              background: 'rgba(24, 144, 255, 0.1)',
              borderRadius: '4px',
              fontSize: '10px',
              color: 'white'
            }}>
              <div>总距离: {planningResult.totalDistance.toFixed(1)}m</div>
              <div>预计时间: {planningResult.estimatedTime.toFixed(1)}min</div>
              <div>能耗: {planningResult.energyConsumption.toFixed(1)}%</div>
              <div>航点数: {planningResult.path.length}</div>
            </div>
          )}

          {/* 备选路径选择 */}
          {showAlternativePaths && planningResult?.alternativePaths && planningResult.alternativePaths.length > 0 && (
            <div>
              <div style={{ color: 'white', fontSize: '12px', marginBottom: '4px' }}>备选路径</div>
              <Select
                value={selectedPathIndex}
                onChange={setSelectedPathIndex}
                style={{ width: '100%' }}
                size="small"
              >
                <Option value={-1}>主路径</Option>
                {planningResult.alternativePaths.map((_, index) => (
                  <Option key={index} value={index}>
                    备选路径 {index + 1}
                  </Option>
                ))}
              </Select>
            </div>
          )}

          {/* 视角控制 */}
          <div>
            <div style={{ color: 'white', fontSize: '12px', marginBottom: '4px' }}>视角切换</div>
            <Space wrap>
              <Button size="small" onClick={() => handleViewChange('top')}>俯视</Button>
              <Button size="small" onClick={() => handleViewChange('side')}>侧视</Button>
              <Button size="small" onClick={() => handleViewChange('follow')}>跟随</Button>
              <Button size="small" onClick={() => handleViewChange('default')}>默认</Button>
            </Space>
          </div>
        </Space>
      </Card>

      {/* 路径图例 */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        zIndex: 10,
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '12px',
        borderRadius: '6px',
        border: '1px solid rgba(24, 144, 255, 0.3)',
        fontSize: '10px',
        color: 'white'
      }}>
        <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>图例</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
          <div style={{ width: '12px', height: '12px', background: '#52C41A', borderRadius: '50%' }}></div>
          <span>起点/已到达</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
          <div style={{ width: '12px', height: '12px', background: '#FAAD14', borderRadius: '50%' }}></div>
          <span>下一个航点</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
          <div style={{ width: '12px', height: '12px', background: '#FF4D4F', borderRadius: '50%' }}></div>
          <span>终点/禁飞区</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '2px', background: '#1890FF' }}></div>
          <span>飞行路径</span>
        </div>
      </div>

      {/* 3D Canvas */}
      {isClient && (
        <Canvas
          key={`camera-${cameraPosition.join('-')}`}
          camera={{ position: cameraPosition, fov: 60 }}
          style={{ width: '100%', height: '100%' }}
        >
          <Suspense fallback={null}>
            <PathPlanningScene
              planningResult={planningResult}
              currentDronePosition={currentDronePosition}
              showAlternativePaths={showAlternativePaths}
              selectedPathIndex={selectedPathIndex}
              isFlying={isFlying}
              flightSpeed={flightSpeed}
              reachedWaypoints={reachedWaypoints}
              nextWaypoint={nextWaypoint}
              pathDrawProgress={pathDrawProgress}
              noFlyZones={noFlyZones}
              onWaypointClick={onWaypointClick}
              onWaypointReached={handleWaypointReached}
              onFlightComplete={handleFlightComplete}
              onZoneAlert={handleZoneAlert}
            />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
};