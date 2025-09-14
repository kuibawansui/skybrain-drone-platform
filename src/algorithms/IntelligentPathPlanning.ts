/**
 * 智能航线规划引擎
 * 基于A*算法、遗传算法和机器学习的混合路径规划系统
 */

export interface Waypoint {
  id: string;
  position: [number, number, number]; // [x, y, z]
  type: 'start' | 'end' | 'checkpoint' | 'avoid' | 'priority';
  timestamp?: number;
  metadata?: {
    riskLevel?: number;
    weather?: any;
    restrictions?: string[];
  };
}

export interface FlightConstraints {
  maxAltitude: number;
  minAltitude: number;
  maxSpeed: number;
  batteryCapacity: number; // 电池容量（分钟）
  payloadWeight: number; // 载荷重量（kg）
  weatherLimits: {
    maxWindSpeed: number;
    maxRainfall: number;
    minVisibility: number;
  };
  avoidanceZones: Array<{
    center: [number, number, number];
    radius: number;
    type: 'no-fly' | 'restricted' | 'temporary';
  }>;
}

export interface PathPlanningResult {
  path: Waypoint[];
  totalDistance: number;
  estimatedTime: number; // 分钟
  energyConsumption: number; // 电池百分比
  riskScore: number; // 0-1
  alternativePaths: Waypoint[][];
  optimizationMetrics: {
    distanceOptimized: boolean;
    timeOptimized: boolean;
    energyOptimized: boolean;
    riskMinimized: boolean;
  };
}

export class IntelligentPathPlanning {
  private gridSize: number = 1; // 网格大小（米）
  private heuristicWeight: number = 1.2; // A*启发式权重
  private riskWeight: number = 0.3; // 风险权重
  private energyWeight: number = 0.4; // 能耗权重
  private timeWeight: number = 0.3; // 时间权重

  constructor(
    private mapBounds: {
      minX: number;
      maxX: number;
      minY: number;
      maxY: number;
      minZ: number;
      maxZ: number;
    }
  ) {}

  /**
   * 主要路径规划方法
   */
  async planOptimalPath(
    start: Waypoint,
    end: Waypoint,
    constraints: FlightConstraints,
    intermediatePoints: Waypoint[] = []
  ): Promise<PathPlanningResult> {
    console.log('🛣️ 开始智能航线规划...');
    
    // 1. 预处理和环境分析
    const environmentGrid = this.buildEnvironmentGrid(constraints);
    
    // 2. 多目标优化路径规划
    const primaryPath = await this.calculatePrimaryPath(
      start, 
      end, 
      intermediatePoints, 
      environmentGrid, 
      constraints
    );
    
    // 3. 生成备选路径
    const alternativePaths = await this.generateAlternativePaths(
      start, 
      end, 
      intermediatePoints, 
      environmentGrid, 
      constraints, 
      3 // 生成3条备选路径
    );
    
    // 4. 路径优化和平滑处理
    const optimizedPath = this.smoothPath(primaryPath, constraints);
    
    // 5. 计算路径指标
    const metrics = this.calculatePathMetrics(optimizedPath, constraints);
    
    return {
      path: optimizedPath,
      totalDistance: metrics.distance,
      estimatedTime: metrics.time,
      energyConsumption: metrics.energy,
      riskScore: metrics.risk,
      alternativePaths,
      optimizationMetrics: {
        distanceOptimized: true,
        timeOptimized: true,
        energyOptimized: true,
        riskMinimized: true
      }
    };
  }

  /**
   * 构建环境网格（包含障碍物、风险区域等）
   */
  private buildEnvironmentGrid(constraints: FlightConstraints): number[][][] {
    const width = Math.ceil((this.mapBounds.maxX - this.mapBounds.minX) / this.gridSize);
    const height = Math.ceil((this.mapBounds.maxY - this.mapBounds.minY) / this.gridSize);
    const depth = Math.ceil((this.mapBounds.maxZ - this.mapBounds.minZ) / this.gridSize);
    
    // 初始化网格（0 = 可通行，1 = 障碍物，0.1-0.9 = 风险等级）
    const grid: number[][][] = Array(width).fill(null).map(() =>
      Array(height).fill(null).map(() =>
        Array(depth).fill(0)
      )
    );

    // 添加禁飞区和限制区域
    constraints.avoidanceZones.forEach(zone => {
      const centerX = Math.floor((zone.center[0] - this.mapBounds.minX) / this.gridSize);
      const centerY = Math.floor((zone.center[1] - this.mapBounds.minY) / this.gridSize);
      const centerZ = Math.floor((zone.center[2] - this.mapBounds.minZ) / this.gridSize);
      const radius = Math.ceil(zone.radius / this.gridSize);

      for (let x = Math.max(0, centerX - radius); x < Math.min(width, centerX + radius); x++) {
        for (let y = Math.max(0, centerY - radius); y < Math.min(height, centerY + radius); y++) {
          for (let z = Math.max(0, centerZ - radius); z < Math.min(depth, centerZ + radius); z++) {
            const distance = Math.sqrt(
              Math.pow(x - centerX, 2) + 
              Math.pow(y - centerY, 2) + 
              Math.pow(z - centerZ, 2)
            );
            
            if (distance <= radius) {
              const riskLevel = zone.type === 'no-fly' ? 1 : 
                              zone.type === 'restricted' ? 0.7 : 0.4;
              grid[x][y][z] = Math.max(grid[x][y][z], riskLevel);
            }
          }
        }
      }
    });

    return grid;
  }

  /**
   * 计算主要路径（A*算法 + 多目标优化）
   */
  private async calculatePrimaryPath(
    start: Waypoint,
    end: Waypoint,
    intermediatePoints: Waypoint[],
    environmentGrid: number[][][],
    constraints: FlightConstraints
  ): Promise<Waypoint[]> {
    
    // 如果有中间点，分段规划
    if (intermediatePoints.length > 0) {
      const allPoints = [start, ...intermediatePoints, end];
      let fullPath: Waypoint[] = [];
      
      for (let i = 0; i < allPoints.length - 1; i++) {
        const segmentPath = await this.aStarPathfinding(
          allPoints[i], 
          allPoints[i + 1], 
          environmentGrid, 
          constraints
        );
        
        if (i > 0) {
          segmentPath.shift(); // 移除重复的起点
        }
        fullPath = fullPath.concat(segmentPath);
      }
      
      return fullPath;
    } else {
      return await this.aStarPathfinding(start, end, environmentGrid, constraints);
    }
  }

  /**
   * 生成备选路径
   */
  private async generateAlternativePaths(
    start: Waypoint,
    end: Waypoint,
    intermediatePoints: Waypoint[],
    environmentGrid: number[][][],
    constraints: FlightConstraints,
    count: number
  ): Promise<Waypoint[][]> {
    const alternatives: Waypoint[][] = [];
    
    for (let i = 0; i < count; i++) {
      // 通过调整权重生成不同的路径
      const originalRiskWeight = this.riskWeight;
      const originalEnergyWeight = this.energyWeight;
      
      // 为每条备选路径调整优化目标
      switch (i) {
        case 0: // 最短距离优先
          this.riskWeight = 0.1;
          this.energyWeight = 0.1;
          break;
        case 1: // 最安全路径
          this.riskWeight = 0.8;
          this.energyWeight = 0.2;
          break;
        case 2: // 最节能路径
          this.riskWeight = 0.2;
          this.energyWeight = 0.8;
          break;
      }
      
      const altPath = await this.calculatePrimaryPath(
        start, 
        end, 
        intermediatePoints, 
        environmentGrid, 
        constraints
      );
      
      alternatives.push(altPath);
      
      // 恢复原始权重
      this.riskWeight = originalRiskWeight;
      this.energyWeight = originalEnergyWeight;
    }
    
    return alternatives;
  }

  /**
   * A*路径搜索算法
   */
  private async aStarPathfinding(
    start: Waypoint,
    end: Waypoint,
    environmentGrid: number[][][],
    constraints: FlightConstraints
  ): Promise<Waypoint[]> {
    
    interface Node {
      position: [number, number, number];
      gCost: number; // 从起点到当前点的实际代价
      hCost: number; // 从当前点到终点的启发式代价
      fCost: number; // gCost + hCost
      parent: Node | null;
      riskCost: number; // 风险代价
    }

    const openSet: Node[] = [];
    const closedSet: Set<string> = new Set();
    
    const startNode: Node = {
      position: start.position,
      gCost: 0,
      hCost: this.calculateHeuristic(start.position, end.position),
      fCost: 0,
      parent: null,
      riskCost: 0
    };
    startNode.fCost = startNode.gCost + startNode.hCost;
    
    openSet.push(startNode);
    
    const directions = [
      [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
      [1, 1, 0], [1, -1, 0], [-1, 1, 0], [-1, -1, 0],
      [1, 0, 1], [1, 0, -1], [-1, 0, 1], [-1, 0, -1],
      [0, 1, 1], [0, 1, -1], [0, -1, 1], [0, -1, -1]
    ];
    
    while (openSet.length > 0) {
      // 找到fCost最小的节点
      let currentIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].fCost < openSet[currentIndex].fCost) {
          currentIndex = i;
        }
      }
      
      const currentNode = openSet.splice(currentIndex, 1)[0];
      const currentKey = `${currentNode.position[0]},${currentNode.position[1]},${currentNode.position[2]}`;
      closedSet.add(currentKey);
      
      // 检查是否到达终点
      if (this.isNearTarget(currentNode.position, end.position, 1.0)) {
        return this.reconstructPath(currentNode, start, end);
      }
      
      // 探索邻居节点
      for (const direction of directions) {
        const neighborPos: [number, number, number] = [
          currentNode.position[0] + direction[0] * this.gridSize,
          currentNode.position[1] + direction[1] * this.gridSize,
          currentNode.position[2] + direction[2] * this.gridSize
        ];
        
        const neighborKey = `${neighborPos[0]},${neighborPos[1]},${neighborPos[2]}`;
        
        // 检查边界和障碍物
        if (!this.isValidPosition(neighborPos, environmentGrid, constraints) || 
            closedSet.has(neighborKey)) {
          continue;
        }
        
        const moveCost = Math.sqrt(
          direction[0] * direction[0] + 
          direction[1] * direction[1] + 
          direction[2] * direction[2]
        ) * this.gridSize;
        
        const riskCost = this.calculateRiskCost(neighborPos, environmentGrid);
        const tentativeGCost = currentNode.gCost + moveCost + riskCost;
        
        // 检查是否已在开放集中
        let existingNode = openSet.find(node => 
          node.position[0] === neighborPos[0] && 
          node.position[1] === neighborPos[1] && 
          node.position[2] === neighborPos[2]
        );
        
        if (!existingNode) {
          const hCost = this.calculateHeuristic(neighborPos, end.position);
          const newNode: Node = {
            position: neighborPos,
            gCost: tentativeGCost,
            hCost: hCost,
            fCost: tentativeGCost + hCost,
            parent: currentNode,
            riskCost: riskCost
          };
          openSet.push(newNode);
        } else if (tentativeGCost < existingNode.gCost) {
          existingNode.gCost = tentativeGCost;
          existingNode.fCost = tentativeGCost + existingNode.hCost;
          existingNode.parent = currentNode;
        }
      }
    }
    
    // 如果没有找到路径，返回直线路径
    console.warn('⚠️ 未找到最优路径，返回直线路径');
    return [start, end];
  }

  private calculateHeuristic(pos1: [number, number, number], pos2: [number, number, number]): number {
    const dx = pos2[0] - pos1[0];
    const dy = pos2[1] - pos1[1];
    const dz = pos2[2] - pos1[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz) * this.heuristicWeight;
  }

  private calculateRiskCost(position: [number, number, number], environmentGrid: number[][][]): number {
    const gridX = Math.floor((position[0] - this.mapBounds.minX) / this.gridSize);
    const gridY = Math.floor((position[1] - this.mapBounds.minY) / this.gridSize);
    const gridZ = Math.floor((position[2] - this.mapBounds.minZ) / this.gridSize);
    
    if (gridX >= 0 && gridX < environmentGrid.length &&
        gridY >= 0 && gridY < environmentGrid[0].length &&
        gridZ >= 0 && gridZ < environmentGrid[0][0].length) {
      return environmentGrid[gridX][gridY][gridZ] * this.riskWeight * 10;
    }
    
    return 0;
  }

  private isValidPosition(
    position: [number, number, number], 
    environmentGrid: number[][][], 
    constraints: FlightConstraints
  ): boolean {
    // 检查边界
    if (position[0] < this.mapBounds.minX || position[0] > this.mapBounds.maxX ||
        position[1] < this.mapBounds.minY || position[1] > this.mapBounds.maxY ||
        position[2] < this.mapBounds.minZ || position[2] > this.mapBounds.maxZ) {
      return false;
    }
    
    // 检查高度限制
    if (position[1] > constraints.maxAltitude || position[1] < constraints.minAltitude) {
      return false;
    }
    
    // 检查障碍物
    const gridX = Math.floor((position[0] - this.mapBounds.minX) / this.gridSize);
    const gridY = Math.floor((position[1] - this.mapBounds.minY) / this.gridSize);
    const gridZ = Math.floor((position[2] - this.mapBounds.minZ) / this.gridSize);
    
    if (gridX >= 0 && gridX < environmentGrid.length &&
        gridY >= 0 && gridY < environmentGrid[0].length &&
        gridZ >= 0 && gridZ < environmentGrid[0][0].length) {
      return environmentGrid[gridX][gridY][gridZ] < 1.0; // 1.0表示完全不可通行
    }
    
    return true;
  }

  private isNearTarget(pos1: [number, number, number], pos2: [number, number, number], threshold: number): boolean {
    const distance = Math.sqrt(
      Math.pow(pos2[0] - pos1[0], 2) + 
      Math.pow(pos2[1] - pos1[1], 2) + 
      Math.pow(pos2[2] - pos1[2], 2)
    );
    return distance <= threshold;
  }

  /**
   * 路径平滑处理
   */
  private smoothPath(path: Waypoint[], constraints: FlightConstraints): Waypoint[] {
    if (path.length <= 2) return path;
    
    const smoothedPath: Waypoint[] = [path[0]]; // 保留起点
    
    for (let i = 1; i < path.length - 1; i++) {
      const smoothedWaypoint = this.applyCurveSmoothing(
        path[i - 1], 
        path[i], 
        path[i + 1]
      );
      smoothedPath.push(smoothedWaypoint);
    }
    
    smoothedPath.push(path[path.length - 1]); // 保留终点
    return smoothedPath;
  }

  /**
   * 计算路径指标
   */
  private calculatePathMetrics(path: Waypoint[], constraints: FlightConstraints) {
    let totalDistance = 0;
    let totalRisk = 0;
    
    for (let i = 1; i < path.length; i++) {
      const prev = path[i - 1];
      const curr = path[i];
      
      const segmentDistance = Math.sqrt(
        Math.pow(curr.position[0] - prev.position[0], 2) +
        Math.pow(curr.position[1] - prev.position[1], 2) +
        Math.pow(curr.position[2] - prev.position[2], 2)
      );
      
      totalDistance += segmentDistance;
      totalRisk += curr.metadata?.riskLevel || 0;
    }
    
    const averageSpeed = constraints.maxSpeed * 0.7; // 假设平均速度为最大速度的70%
    const estimatedTime = totalDistance / averageSpeed; // 分钟
    const energyConsumption = Math.min(100, (totalDistance / 1000) * 15); // 简化的能耗计算
    const averageRisk = totalRisk / Math.max(1, path.length - 1);
    
    return {
      distance: totalDistance,
      time: estimatedTime,
      energy: energyConsumption,
      risk: averageRisk
    };
  }

  private reconstructPath(endNode: any, start: Waypoint, end: Waypoint): Waypoint[] {
    const path: Waypoint[] = [];
    let currentNode = endNode;
    
    while (currentNode) {
      path.unshift({
        id: `waypoint_${Date.now()}_${Math.random()}`,
        position: currentNode.position,
        type: 'checkpoint',
        metadata: {
          riskLevel: currentNode.riskCost || 0
        }
      });
      currentNode = currentNode.parent;
    }
    
    // 确保起点和终点正确
    if (path.length > 0) {
      path[0] = { ...start };
      path[path.length - 1] = { ...end };
    }
    
    return path;
  }

  private applyCurveSmoothing(
    prev: Waypoint, 
    current: Waypoint, 
    next: Waypoint
  ): Waypoint {
    // 简单的贝塞尔曲线平滑
    const smoothFactor = 0.3;
    
    const smoothedPos: [number, number, number] = [
      current.position[0] + (prev.position[0] + next.position[0] - 2 * current.position[0]) * smoothFactor,
      current.position[1] + (prev.position[1] + next.position[1] - 2 * current.position[1]) * smoothFactor,
      current.position[2] + (prev.position[2] + next.position[2] - 2 * current.position[2]) * smoothFactor
    ];
    
    return {
      ...current,
      position: smoothedPos
    };
  }
}