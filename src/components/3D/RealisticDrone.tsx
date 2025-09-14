'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RealisticDroneProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  color?: string;
  isFlying?: boolean;
}

export const RealisticDrone: React.FC<RealisticDroneProps> = ({
  position,
  rotation = [0, 0, 0],
  scale = 1,
  color = '#2196F3',
  isFlying = true
}) => {
  const droneRef = useRef<THREE.Group>(null);
  const propellerRefs = useRef<THREE.Mesh[]>([]);
  const timeRef = useRef(0);

  // 无人机材质
  const materials = useMemo(() => ({
    body: new THREE.MeshLambertMaterial({ color: color }),
    propeller: new THREE.MeshLambertMaterial({ color: '#333333' }),
    arm: new THREE.MeshLambertMaterial({ color: '#666666' }),
    camera: new THREE.MeshLambertMaterial({ color: '#000000' }),
    led: new THREE.MeshLambertMaterial({ color: '#00ff00', emissive: '#004400' })
  }), [color]);

  // 动画效果
  useFrame((state, delta) => {
    timeRef.current += delta;
    
    if (droneRef.current && isFlying) {
      // 轻微的悬浮效果
      droneRef.current.position.y = position[1] + Math.sin(timeRef.current * 2) * 0.1;
      
      // 轻微的摇摆效果
      droneRef.current.rotation.x = Math.sin(timeRef.current * 1.5) * 0.02;
      droneRef.current.rotation.z = Math.cos(timeRef.current * 1.2) * 0.02;
    }

    // 螺旋桨旋转
    propellerRefs.current.forEach((propeller, index) => {
      if (propeller) {
        propeller.rotation.y += delta * 50 * (index % 2 === 0 ? 1 : -1);
      }
    });
  });

  return (
    <group ref={droneRef} position={position} rotation={rotation} scale={scale}>
      {/* 主体机身 */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.8, 0.3, 0.8]} />
        <primitive object={materials.body} />
      </mesh>

      {/* 顶部摄像头云台 */}
      <mesh position={[0, 0.2, 0.2]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <primitive object={materials.camera} />
      </mesh>

      {/* 摄像头镜头 */}
      <mesh position={[0, 0.15, 0.35]}>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
        <primitive object={materials.camera} />
      </mesh>

      {/* 四个机臂 */}
      {[
        { pos: [0.6, 0, 0.6], rot: [0, Math.PI / 4, 0] },
        { pos: [-0.6, 0, 0.6], rot: [0, -Math.PI / 4, 0] },
        { pos: [-0.6, 0, -0.6], rot: [0, Math.PI * 3 / 4, 0] },
        { pos: [0.6, 0, -0.6], rot: [0, -Math.PI * 3 / 4, 0] }
      ].map((arm, index) => (
        <group key={`arm-${index}`} position={arm.pos as [number, number, number]} rotation={arm.rot as [number, number, number]}>
          {/* 机臂 */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.8, 0.1, 0.1]} />
            <primitive object={materials.arm} />
          </mesh>
          
          {/* 电机 */}
          <mesh position={[0.35, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.2, 16]} />
            <primitive object={materials.arm} />
          </mesh>
          
          {/* 螺旋桨 */}
          <mesh 
            ref={(el) => {
              if (el) propellerRefs.current[index] = el;
            }}
            position={[0.35, 0.15, 0]}
          >
            <group>
              {/* 螺旋桨叶片 */}
              <mesh position={[0.25, 0, 0]}>
                <boxGeometry args={[0.5, 0.02, 0.08]} />
                <primitive object={materials.propeller} />
              </mesh>
              <mesh position={[-0.25, 0, 0]}>
                <boxGeometry args={[0.5, 0.02, 0.08]} />
                <primitive object={materials.propeller} />
              </mesh>
              <mesh position={[0, 0, 0.25]}>
                <boxGeometry args={[0.08, 0.02, 0.5]} />
                <primitive object={materials.propeller} />
              </mesh>
              <mesh position={[0, 0, -0.25]}>
                <boxGeometry args={[0.08, 0.02, 0.5]} />
                <primitive object={materials.propeller} />
              </mesh>
            </group>
          </mesh>
        </group>
      ))}

      {/* 起落架 */}
      {[
        [0.4, -0.3, 0.4],
        [-0.4, -0.3, 0.4],
        [-0.4, -0.3, -0.4],
        [0.4, -0.3, -0.4]
      ].map((legPos, index) => (
        <group key={`leg-${index}`}>
          {/* 起落架支柱 */}
          <mesh position={legPos as [number, number, number]}>
            <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
            <primitive object={materials.arm} />
          </mesh>
          {/* 起落架脚垫 */}
          <mesh position={[legPos[0], legPos[1] - 0.15, legPos[2]]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <primitive object={materials.arm} />
          </mesh>
        </group>
      ))}

      {/* LED指示灯 */}
      <mesh position={[0, 0.1, -0.4]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <primitive object={materials.led} />
      </mesh>
      
      {/* 前置LED灯 */}
      <mesh position={[0, 0.1, 0.4]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshLambertMaterial color="#ffffff" emissive="#444444" />
      </mesh>

      {/* 天线 */}
      <mesh position={[0, 0.4, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.3, 8]} />
        <primitive object={materials.arm} />
      </mesh>

      {/* 电池仓 */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[0.6, 0.15, 0.4]} />
        <meshLambertMaterial color="#ff4444" />
      </mesh>

      {/* 传感器模块 */}
      <mesh position={[0, 0.05, -0.3]}>
        <boxGeometry args={[0.2, 0.1, 0.1]} />
        <primitive object={materials.camera} />
      </mesh>
    </group>
  );
};

export default RealisticDrone;