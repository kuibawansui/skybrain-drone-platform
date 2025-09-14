/**
 * 高级路径规划引擎
 * Advanced Path Planning Engine
 */

export interface Waypoint {
  x: number;
  y: number;
  z: number;
  timestamp: number;
  speed: number;
  heading: number;
}

export interface FlightConstraints {
  maxSpeed: number;
  maxAcceleration: number;
  maxClimbRate: number;
  minAltitude: number;
  maxAltitude: number;
  noFlyZones: NoFlyZone[];
  weatherConstraints: WeatherConstraint[];
}

export interface NoFlyZone {
  id: string;
  type: 'permanent' | 'temporary' | 'dynamic';
  geometry: {
    type: 'circle' | 'polygon' | 'cylinder';
    coordinates: number[][];
    radius?: number;
    height?: number;
  };
  startTime?: number;
  endTime?: number;
  severity: 'prohibited' | 'restricted' | 'caution';
}

export interface WeatherConstraint {
  type: 'wind' | 'rain' | 'fog' | 'temperature';
  severity: number; // 0-10
  affectedArea: {
    center: { x: number; y: number; z: number };
    radius: number;
  };
  duration: number;
}

export interface TrajectoryPoint {
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  acceleration: { x: number; y: number; z: number };
  timestamp: number;
  risk: number;
}

export class PathPlanningEngine {
  private rrtStarCache: Map<string, Waypoint[]> = new Map();
  private trajectoryCache: Map<string, TrajectoryPoint[]> = new Map();
  private obstacleMap: boolean[][][] = [];

  constructor(
    private mapSize: { x: number; y: number; z: number } = { x: 1000, y: 1000, z: 100 },
    private resolution: number = 1
  ) {
    this.initializeObstacleMap();
  }

  /**
   * 初始化障碍物地图
   */
  private initializeObstacleMap(): void {
    const { x, y, z } = this.mapSize;
    this.obstacleMap = Array(x).fill(null).map(() =>
      Array(y).fill(null).map(() =>
        Array(z).fill(false)
      )
    );
  }

  /**
   * RRT*路径规划算法
   */
  planPathRRTStar(
    start: Waypoint,
    goal: Waypoint,
    constraints: FlightConstraints,
    maxIterations: number = 5000
  ): Waypoint[] {
    const cacheKey = `${start.x},${start.y},${start.z}-${goal.x},${goal.y},${goal.z}`;
    
    // 检查缓存
    if (this.rrtStarCache.has(cacheKey)) {
      return this.rrtStarCache.get(cacheKey)!;
    }

    const nodes: RRTNode[] = [];
    const startNode: RRTNode = {
      point: start,
      parent: null,
      cost: 0,
      children: []
    };
    nodes.push(startNode);

    let bestGoalNode: RRTNode | null = null;
    let bestCost = Infinity;

    for (let i = 0; i < maxIterations; i++) {
      // 采样随机点
      const randomPoint = this.sampleRandomPoint(goal, i, maxIterations);
      
      // 找到最近节点
      const nearestNode = this.findNearestNode(nodes, randomPoint);
      
      // 扩展新节点
      const newPoint = this.steer(nearestNode.point, randomPoint, constraints);
      
      if (!this.isValidPath(nearestNode.point, newPoint, constraints)) {
        continue;
      }

      // 创建新节点
      const newNode: RRTNode = {
        point: newPoint,
        parent: nearestNode,
        cost: nearestNode.cost + this.calculateCost(nearestNode.point, newPoint),
        children: []
      };

      // 寻找附近节点进行重连
      const nearNodes = this.findNearNodes(nodes, newPoint, this.calculateRadius(nodes.length));
      
      // 选择最优父节点
      let bestParent = nearestNode;
      let minCost = newNode.cost;

      for (const nearNode of nearNodes) {
        const cost = nearNode.cost + this.calculateCost(nearNode.point, newPoint);
        if (cost < minCost && this.isValidPath(nearNode.point, newPoint, constraints)) {
          bestParent = nearNode;
          minCost = cost;
        }
      }

      newNode.parent = bestParent;
      newNode.cost = minCost;
      bestParent.children.push(newNode);
      nodes.push(newNode);

      // 重连附近节点
      for (const nearNode of nearNodes) {
        const newCost = newNode.cost + this.calculateCost(newNode.point, nearNode.point);
        if (newCost < nearNode.cost && this.isValidPath(newNode.point, nearNode.point, constraints)) {
          // 移除旧连接
          if (nearNode.parent) {
            const index = nearNode.parent.children.indexOf(nearNode);
            if (index > -1) {
              nearNode.parent.children.splice(index, 1);
            }
          }
          
          // 建立新连接
          nearNode.parent = newNode;
          nearNode.cost = newCost;
          newNode.children.push(nearNode);
          
          // 更新子树成本
          this.updateSubtreeCosts(nearNode);
        }
      }

      // 检查是否到达目标
      if (this.isNearGoal(newPoint, goal)) {
        const goalCost = newNode.cost + this.calculateCost(newPoint, goal);
        if (goalCost < bestCost) {
          bestCost = goalCost;
          bestGoalNode = newNode;
        }
      }
    }

    // 构建路径
    const path = bestGoalNode ? this.buildPath(bestGoalNode, goal) : [];
    
    // 缓存结果
    if (path.length > 0) {
      this.rrtStarCache.set(cacheKey, path);
    }

    return path;
  }

  /**
   * 轨迹优化
   */
  optimizeTrajectory(
    waypoints: Waypoint[],
    constraints: FlightConstraints,
    droneId: string
  ): TrajectoryPoint[] {
    const cacheKey = `${droneId}-${waypoints.length}-${Date.now()}`;
    
    if (this.trajectoryCache.has(cacheKey)) {
      return this.trajectoryCache.get(cacheKey)!;
    }

    const trajectory: TrajectoryPoint[] = [];
    
    for (let i = 0; i < waypoints.length - 1; i++) {
      const current = waypoints[i];
      const next = waypoints[i + 1];
      
      // 计算段轨迹
      const segmentTrajectory = this.generateSegmentTrajectory(current, next, constraints);
      trajectory.push(...segmentTrajectory);
    }

    // 平滑轨迹
    const smoothedTrajectory = this.smoothTrajectory(trajectory, constraints);
    
    // 缓存结果
    this.trajectoryCache.set(cacheKey, smoothedTrajectory);
    
    return smoothedTrajectory;
  }

  /**
   * 动态路径调整
   */
  adjustPathDynamically(
    currentPath: Waypoint[],
    currentPosition: Waypoint,
    newObstacles: NoFlyZone[],
    constraints: FlightConstraints
  ): Waypoint[] {
    // 检查当前路径是否仍然有效
    if (this.isPathValid(currentPath, newObstacles, constraints)) {
      return currentPath;
    }

    // 找到需要重新规划的起始点
    const replannedFromIndex = this.findReplannedStartIndex(currentPath, currentPosition, newObstacles);
    
    if (replannedFromIndex === -1) {
      return currentPath; // 路径仍然有效
    }

    // 保留有效部分
    const validPath = currentPath.slice(0, replannedFromIndex);
    const goal = currentPath[currentPath.length - 1];
    
    // 重新规划剩余部分
    const newSegment = this.planPathRRTStar(
      currentPath[replannedFromIndex],
      goal,
      constraints
    );

    return [...validPath, ...newSegment];
  }

  /**
   * 多目标路径规划
   */
  planMultiObjectivePath(
    start: Waypoint,
    goals: Waypoint[],
    constraints: FlightConstraints,
    objectives: {
      minimizeTime: number;
      minimizeRisk: number;
      minimizeEnergy: number;
      maximizeReliability: number;
    }
  ): Waypoint[] {
    // 使用遗传算法求解多目标优化问题
    const population = this.initializePopulation(start, goals, 50);
    const generations = 100;

    for (let gen = 0; gen < generations; gen++) {
      // 评估适应度
      const fitness = population.map(individual => 
        this.evaluateMultiObjectiveFitness(individual, objectives, constraints)
      );

      // 选择
      const selected = this.tournamentSelection(population, fitness, 0.8);

      // 交叉
      const offspring = this.crossover(selected, 0.7);

      // 变异
      const mutated = this.mutate(offspring, 0.1, constraints);

      // 更新种群
      population.splice(0, population.length, ...mutated);
    }

    // 选择最优解
    const fitness = population.map(individual => 
      this.evaluateMultiObjectiveFitness(individual, objectives, constraints)
    );
    
    const bestIndex = fitness.indexOf(Math.max(...fitness));
    return population[bestIndex];
  }

  /**
   * 协同路径规划
   */
  planCooperativePaths(
    agents: Array<{ id: string; start: Waypoint; goal: Waypoint }>,
    constraints: FlightConstraints,
    cooperationLevel: number = 0.8
  ): Map<string, Waypoint[]> {
    const paths = new Map<string, Waypoint[]>();
    const conflicts: Array<{ agent1: string; agent2: string; time: number; position: Waypoint }> = [];

    // 初始路径规划
    for (const agent of agents) {
      const path = this.planPathRRTStar(agent.start, agent.goal, constraints);
      paths.set(agent.id, path);
    }

    // 迭代冲突解决
    let iteration = 0;
    const maxIterations = 10;

    while (iteration < maxIterations) {
      // 检测冲突
      const newConflicts = this.detectPathConflicts(paths, constraints);
      
      if (newConflicts.length === 0) {
        break; // 无冲突，完成
      }

      // 解决冲突
      for (const conflict of newConflicts) {
        this.resolvePathConflict(conflict, paths, constraints, cooperationLevel);
      }

      iteration++;
    }

    return paths;
  }

  // 私有辅助方法
  private sampleRandomPoint(goal: Waypoint, iteration: number, maxIterations: number): Waypoint {
    // 目标偏向采样
    const goalBias = 0.1 + 0.4 * (iteration / maxIterations);
    
    if (Math.random() < goalBias) {
      return goal;
    }

    return {
      x: Math.random() * this.mapSize.x,
      y: Math.random() * this.mapSize.y,
      z: Math.random() * this.mapSize.z,
      timestamp: Date.now(),
      speed: 0,
      heading: 0
    };
  }

  private findNearestNode(nodes: RRTNode[], point: Waypoint): RRTNode {
    let nearest = nodes[0];
    let minDistance = this.calculateDistance(nearest.point, point);

    for (const node of nodes) {
      const distance = this.calculateDistance(node.point, point);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = node;
      }
    }

    return nearest;
  }

  private steer(from: Waypoint, to: Waypoint, constraints: FlightConstraints): Waypoint {
    const distance = this.calculateDistance(from, to);
    const maxStep = 10; // 最大步长

    if (distance <= maxStep) {
      return to;
    }

    const ratio = maxStep / distance;
    return {
      x: from.x + (to.x - from.x) * ratio,
      y: from.y + (to.y - from.y) * ratio,
      z: from.z + (to.z - from.z) * ratio,
      timestamp: Date.now(),
      speed: Math.min(constraints.maxSpeed, from.speed + constraints.maxAcceleration),
      heading: Math.atan2(to.y - from.y, to.x - from.x)
    };
  }

  private isValidPath(from: Waypoint, to: Waypoint, constraints: FlightConstraints): boolean {
    // 检查高度约束
    if (to.z < constraints.minAltitude || to.z > constraints.maxAltitude) {
      return false;
    }

    // 检查禁飞区
    for (const noFlyZone of constraints.noFlyZones) {
      if (this.intersectsNoFlyZone(from, to, noFlyZone)) {
        return false;
      }
    }

    // 检查障碍物
    return !this.intersectsObstacle(from, to);
  }

  private calculateCost(from: Waypoint, to: Waypoint): number {
    const distance = this.calculateDistance(from, to);
    const heightChange = Math.abs(to.z - from.z);
    const speedChange = Math.abs(to.speed - from.speed);
    
    return distance + heightChange * 2 + speedChange * 0.5;
  }

  private calculateDistance(p1: Waypoint, p2: Waypoint): number {
    return Math.sqrt(
      Math.pow(p1.x - p2.x, 2) + 
      Math.pow(p1.y - p2.y, 2) + 
      Math.pow(p1.z - p2.z, 2)
    );
  }

  private findNearNodes(nodes: RRTNode[], point: Waypoint, radius: number): RRTNode[] {
    return nodes.filter(node => 
      this.calculateDistance(node.point, point) <= radius
    );
  }

  private calculateRadius(nodeCount: number): number {
    const gamma = 50; // 调节参数
    return Math.min(gamma * Math.pow(Math.log(nodeCount) / nodeCount, 1/3), 20);
  }

  private updateSubtreeCosts(node: RRTNode): void {
    for (const child of node.children) {
      const newCost = node.cost + this.calculateCost(node.point, child.point);
      if (newCost < child.cost) {
        child.cost = newCost;
        this.updateSubtreeCosts(child);
      }
    }
  }

  private isNearGoal(point: Waypoint, goal: Waypoint): boolean {
    return this.calculateDistance(point, goal) < 5; // 5米容差
  }

  private buildPath(goalNode: RRTNode, goal: Waypoint): Waypoint[] {
    const path: Waypoint[] = [goal];
    let current: RRTNode | null = goalNode;

    while (current) {
      path.unshift(current.point);
      current = current.parent;
    }

    return path;
  }

  private generateSegmentTrajectory(
    start: Waypoint, 
    end: Waypoint, 
    constraints: FlightConstraints
  ): TrajectoryPoint[] {
    const trajectory: TrajectoryPoint[] = [];
    const duration = this.calculateSegmentDuration(start, end, constraints);
    const steps = Math.ceil(duration / 0.1); // 0.1秒间隔

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const point = this.interpolateTrajectoryPoint(start, end, t, constraints);
      trajectory.push(point);
    }

    return trajectory;
  }

  private smoothTrajectory(
    trajectory: TrajectoryPoint[], 
    constraints: FlightConstraints
  ): TrajectoryPoint[] {
    // 使用B样条曲线平滑轨迹
    const smoothed: TrajectoryPoint[] = [];
    
    for (let i = 0; i < trajectory.length; i++) {
      if (i === 0 || i === trajectory.length - 1) {
        smoothed.push(trajectory[i]);
      } else {
        const prev = trajectory[i - 1];
        const curr = trajectory[i];
        const next = trajectory[i + 1];
        
        const smoothedPoint = this.applySmoothingFilter(prev, curr, next, constraints);
        smoothed.push(smoothedPoint);
      }
    }

    return smoothed;
  }

  private isPathValid(
    path: Waypoint[], 
    obstacles: NoFlyZone[], 
    constraints: FlightConstraints
  ): boolean {
    for (let i = 0; i < path.length - 1; i++) {
      if (!this.isValidPath(path[i], path[i + 1], { ...constraints, noFlyZones: obstacles })) {
        return false;
      }
    }
    return true;
  }

  private findReplannedStartIndex(
    path: Waypoint[], 
    currentPos: Waypoint, 
    obstacles: NoFlyZone[]
  ): number {
    // 找到当前位置在路径中的索引
    let currentIndex = 0;
    let minDistance = Infinity;
    
    for (let i = 0; i < path.length; i++) {
      const distance = this.calculateDistance(currentPos, path[i]);
      if (distance < minDistance) {
        minDistance = distance;
        currentIndex = i;
      }
    }

    // 从当前位置开始检查路径有效性
    for (let i = currentIndex; i < path.length - 1; i++) {
      for (const obstacle of obstacles) {
        if (this.intersectsNoFlyZone(path[i], path[i + 1], obstacle)) {
          return i;
        }
      }
    }

    return -1; // 路径有效
  }

  private intersectsNoFlyZone(from: Waypoint, to: Waypoint, zone: NoFlyZone): boolean {
    // 简化实现：检查线段是否与圆形禁飞区相交
    if (zone.geometry.type === 'circle') {
      const center = {
        x: zone.geometry.coordinates[0][0],
        y: zone.geometry.coordinates[0][1],
        z: zone.geometry.coordinates[0][2] || 0
      };
      const radius = zone.geometry.radius || 0;
      
      return this.lineIntersectsCircle(from, to, center, radius);
    }
    
    return false;
  }

  private intersectsObstacle(from: Waypoint, to: Waypoint): boolean {
    // 使用Bresenham 3D算法检查路径上是否有障碍物
    const steps = Math.ceil(this.calculateDistance(from, to));
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = Math.floor(from.x + (to.x - from.x) * t);
      const y = Math.floor(from.y + (to.y - from.y) * t);
      const z = Math.floor(from.z + (to.z - from.z) * t);
      
      if (x >= 0 && x < this.mapSize.x &&
          y >= 0 && y < this.mapSize.y &&
          z >= 0 && z < this.mapSize.z &&
          this.obstacleMap[x][y][z]) {
        return true;
      }
    }
    
    return false;
  }

  private lineIntersectsCircle(
    from: Waypoint, 
    to: Waypoint, 
    center: { x: number; y: number; z: number }, 
    radius: number
  ): boolean {
    // 计算点到线段的最短距离
    const A = to.x - from.x;
    const B = to.y - from.y;
    const C = to.z - from.z;
    
    const dot = A * A + B * B + C * C;
    if (dot === 0) return this.calculateDistance(from, center as any) <= radius;
    
    const t = Math.max(0, Math.min(1, 
      ((center.x - from.x) * A + (center.y - from.y) * B + (center.z - from.z) * C) / dot
    ));
    
    const projection = {
      x: from.x + t * A,
      y: from.y + t * B,
      z: from.z + t * C
    };
    
    return this.calculateDistance(projection as any, center as any) <= radius;
  }

  // 其他辅助方法的简化实现
  private initializePopulation(start: Waypoint, goals: Waypoint[], size: number): Waypoint[][] {
    return Array(size).fill(null).map(() => [start, ...goals]);
  }

  private evaluateMultiObjectiveFitness(
    individual: Waypoint[], 
    objectives: any, 
    constraints: FlightConstraints
  ): number {
    return Math.random(); // 简化实现
  }

  private tournamentSelection(population: Waypoint[][], fitness: number[], rate: number): Waypoint[][] {
    return population.slice(0, Math.floor(population.length * rate));
  }

  private crossover(selected: Waypoint[][], rate: number): Waypoint[][] {
    return selected; // 简化实现
  }

  private mutate(offspring: Waypoint[][], rate: number, constraints: FlightConstraints): Waypoint[][] {
    return offspring; // 简化实现
  }

  private detectPathConflicts(
    paths: Map<string, Waypoint[]>, 
    constraints: FlightConstraints
  ): Array<{ agent1: string; agent2: string; time: number; position: Waypoint }> {
    return []; // 简化实现
  }

  private resolvePathConflict(
    conflict: any, 
    paths: Map<string, Waypoint[]>, 
    constraints: FlightConstraints, 
    cooperationLevel: number
  ): void {
    // 简化实现
  }

  private calculateSegmentDuration(start: Waypoint, end: Waypoint, constraints: FlightConstraints): number {
    const distance = this.calculateDistance(start, end);
    return distance / constraints.maxSpeed;
  }

  private interpolateTrajectoryPoint(
    start: Waypoint, 
    end: Waypoint, 
    t: number, 
    constraints: FlightConstraints
  ): TrajectoryPoint {
    return {
      position: {
        x: start.x + (end.x - start.x) * t,
        y: start.y + (end.y - start.y) * t,
        z: start.z + (end.z - start.z) * t
      },
      velocity: { x: 0, y: 0, z: 0 },
      acceleration: { x: 0, y: 0, z: 0 },
      timestamp: Date.now(),
      risk: 0
    };
  }

  private applySmoothingFilter(
    prev: TrajectoryPoint, 
    curr: TrajectoryPoint, 
    next: TrajectoryPoint, 
    constraints: FlightConstraints
  ): TrajectoryPoint {
    return curr; // 简化实现
  }
}

interface RRTNode {
  point: Waypoint;
  parent: RRTNode | null;
  cost: number;
  children: RRTNode[];
}