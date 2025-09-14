/**
 * 多智能体协同决策系统
 * Multi-Agent Collaborative Decision System
 */

export interface DroneAgent {
  id: string;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  destination: { x: number; y: number; z: number };
  batteryLevel: number;
  payload: number;
  priority: number;
  status: 'idle' | 'flying' | 'delivering' | 'returning' | 'emergency';
  capabilities: string[];
  communicationRange: number;
  lastUpdate: number;
}

export interface PathNode {
  x: number;
  y: number;
  z: number;
  cost: number;
  risk: number;
  timestamp: number;
}

export interface CollaborativeTask {
  id: string;
  type: 'delivery' | 'surveillance' | 'emergency' | 'maintenance';
  priority: number;
  requiredAgents: number;
  assignedAgents: string[];
  deadline: number;
  location: { x: number; y: number; z: number };
  payload: number;
  status: 'pending' | 'assigned' | 'executing' | 'completed' | 'failed';
}

export interface CommunicationMessage {
  from: string;
  to: string | 'broadcast';
  type: 'position' | 'intention' | 'warning' | 'coordination' | 'emergency';
  content: any;
  timestamp: number;
  priority: number;
}

export class MultiAgentDecisionEngine {
  private agents: Map<string, DroneAgent> = new Map();
  private tasks: Map<string, CollaborativeTask> = new Map();
  private messageQueue: CommunicationMessage[] = [];
  private airspaceGrid: number[][][] = [];
  private conflictResolutionHistory: Map<string, any> = new Map();

  constructor(
    private gridSize: { x: number; y: number; z: number } = { x: 100, y: 100, z: 20 },
    private cellSize: number = 10
  ) {
    this.initializeAirspaceGrid();
  }

  /**
   * 初始化空域网格
   */
  private initializeAirspaceGrid(): void {
    const { x, y, z } = this.gridSize;
    this.airspaceGrid = Array(x).fill(null).map(() =>
      Array(y).fill(null).map(() =>
        Array(z).fill(0)
      )
    );
  }

  /**
   * 注册无人机智能体
   */
  registerAgent(agent: DroneAgent): void {
    this.agents.set(agent.id, agent);
    console.log(`Agent ${agent.id} registered in multi-agent system`);
  }

  /**
   * 移除智能体
   */
  unregisterAgent(agentId: string): void {
    this.agents.delete(agentId);
    console.log(`Agent ${agentId} unregistered from multi-agent system`);
  }

  /**
   * 更新智能体状态
   */
  updateAgentState(agentId: string, updates: Partial<DroneAgent>): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      Object.assign(agent, updates, { lastUpdate: Date.now() });
      this.agents.set(agentId, agent);
    }
  }

  /**
   * 协同路径规划 - A*算法改进版
   */
  collaborativePathPlanning(
    agentId: string,
    start: PathNode,
    goal: PathNode,
    riskMap: number[][][]
  ): PathNode[] {
    const agent = this.agents.get(agentId);
    if (!agent) return [];

    // 考虑其他智能体的路径和意图
    const otherAgentPaths = this.getOtherAgentPaths(agentId);
    const dynamicObstacles = this.predictDynamicObstacles(otherAgentPaths);

    return this.aStarWithCollaboration(start, goal, riskMap, dynamicObstacles, agent);
  }

  /**
   * 改进的A*算法，考虑协同因素
   */
  private aStarWithCollaboration(
    start: PathNode,
    goal: PathNode,
    riskMap: number[][][],
    dynamicObstacles: Set<string>,
    agent: DroneAgent
  ): PathNode[] {
    const openSet: PathNode[] = [start];
    const closedSet = new Set<string>();
    const cameFrom = new Map<string, PathNode>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();

    const getKey = (node: PathNode) => `${node.x},${node.y},${node.z}`;
    
    gScore.set(getKey(start), 0);
    fScore.set(getKey(start), this.heuristic(start, goal));

    while (openSet.length > 0) {
      // 选择f值最小的节点
      openSet.sort((a, b) => (fScore.get(getKey(a)) || Infinity) - (fScore.get(getKey(b)) || Infinity));
      const current = openSet.shift()!;
      const currentKey = getKey(current);

      if (this.isGoal(current, goal)) {
        return this.reconstructPath(cameFrom, current);
      }

      closedSet.add(currentKey);

      // 获取邻居节点
      const neighbors = this.getNeighbors(current, agent);
      
      for (const neighbor of neighbors) {
        const neighborKey = getKey(neighbor);
        
        if (closedSet.has(neighborKey)) continue;

        // 计算协同成本
        const collaborativeCost = this.calculateCollaborativeCost(
          neighbor, 
          riskMap, 
          dynamicObstacles, 
          agent
        );
        
        const tentativeGScore = (gScore.get(currentKey) || Infinity) + collaborativeCost;

        if (!openSet.find(n => getKey(n) === neighborKey)) {
          openSet.push(neighbor);
        } else if (tentativeGScore >= (gScore.get(neighborKey) || Infinity)) {
          continue;
        }

        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeGScore);
        fScore.set(neighborKey, tentativeGScore + this.heuristic(neighbor, goal));
      }
    }

    return []; // 无路径
  }

  /**
   * 计算协同成本
   */
  private calculateCollaborativeCost(
    node: PathNode,
    riskMap: number[][][],
    dynamicObstacles: Set<string>,
    agent: DroneAgent
  ): number {
    let cost = 1; // 基础移动成本

    // 风险成本
    const riskCost = this.getRiskAtPosition(node, riskMap) * 10;
    
    // 动态障碍物成本
    const obstacleKey = `${node.x},${node.y},${node.z}`;
    const obstacleCost = dynamicObstacles.has(obstacleKey) ? 50 : 0;
    
    // 拥堵成本
    const congestionCost = this.getCongestionCost(node);
    
    // 能耗成本
    const energyCost = this.getEnergyCost(node, agent);
    
    // 协同奖励（与其他智能体的协同效益）
    const collaborationBonus = this.getCollaborationBonus(node, agent);

    return cost + riskCost + obstacleCost + congestionCost + energyCost - collaborationBonus;
  }

  /**
   * 冲突检测与解决
   */
  detectAndResolveConflicts(): void {
    const conflicts = this.detectConflicts();
    
    for (const conflict of conflicts) {
      this.resolveConflict(conflict);
    }
  }

  /**
   * 检测冲突
   */
  private detectConflicts(): any[] {
    const conflicts: any[] = [];
    const agentList = Array.from(this.agents.values());

    for (let i = 0; i < agentList.length; i++) {
      for (let j = i + 1; j < agentList.length; j++) {
        const agent1 = agentList[i];
        const agent2 = agentList[j];

        // 位置冲突检测
        if (this.isPositionConflict(agent1, agent2)) {
          conflicts.push({
            type: 'position',
            agents: [agent1.id, agent2.id],
            severity: this.calculateConflictSeverity(agent1, agent2),
            timestamp: Date.now()
          });
        }

        // 路径冲突检测
        if (this.isPathConflict(agent1, agent2)) {
          conflicts.push({
            type: 'path',
            agents: [agent1.id, agent2.id],
            severity: this.calculateConflictSeverity(agent1, agent2),
            timestamp: Date.now()
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * 解决冲突
   */
  private resolveConflict(conflict: any): void {
    const { type, agents, severity } = conflict;
    
    switch (type) {
      case 'position':
        this.resolvePositionConflict(agents, severity);
        break;
      case 'path':
        this.resolvePathConflict(agents, severity);
        break;
    }

    // 记录冲突解决历史
    this.conflictResolutionHistory.set(
      `${conflict.timestamp}-${agents.join('-')}`,
      {
        ...conflict,
        resolved: true,
        resolutionTime: Date.now()
      }
    );
  }

  /**
   * 解决位置冲突
   */
  private resolvePositionConflict(agentIds: string[], severity: number): void {
    const agents = agentIds.map(id => this.agents.get(id)).filter(Boolean) as DroneAgent[];
    
    // 基于优先级的冲突解决
    agents.sort((a, b) => b.priority - a.priority);
    
    const highPriorityAgent = agents[0];
    const lowPriorityAgent = agents[1];

    // 低优先级智能体让路
    const avoidanceVector = this.calculateAvoidanceVector(highPriorityAgent, lowPriorityAgent);
    
    this.sendCoordinationMessage(lowPriorityAgent.id, {
      type: 'avoidance_maneuver',
      vector: avoidanceVector,
      duration: Math.max(3000, severity * 1000) // 避让时间
    });
  }

  /**
   * 解决路径冲突
   */
  private resolvePathConflict(agentIds: string[], severity: number): void {
    const agents = agentIds.map(id => this.agents.get(id)).filter(Boolean) as DroneAgent[];
    
    // 重新规划路径，考虑时间窗口
    for (const agent of agents) {
      const newPath = this.replanPathWithTimeWindows(agent, agents);
      this.sendCoordinationMessage(agent.id, {
        type: 'path_update',
        newPath: newPath,
        reason: 'conflict_resolution'
      });
    }
  }

  /**
   * 任务分配算法
   */
  assignTasks(): void {
    const pendingTasks = Array.from(this.tasks.values())
      .filter(task => task.status === 'pending')
      .sort((a, b) => b.priority - a.priority);

    for (const task of pendingTasks) {
      const suitableAgents = this.findSuitableAgents(task);
      
      if (suitableAgents.length >= task.requiredAgents) {
        const selectedAgents = this.selectOptimalAgents(task, suitableAgents);
        this.assignTaskToAgents(task, selectedAgents);
      }
    }
  }

  /**
   * 查找合适的智能体
   */
  private findSuitableAgents(task: CollaborativeTask): DroneAgent[] {
    return Array.from(this.agents.values()).filter(agent => {
      // 检查状态
      if (agent.status !== 'idle') return false;
      
      // 检查电量
      if (agent.batteryLevel < 30) return false;
      
      // 检查载重能力
      if (agent.payload < task.payload) return false;
      
      // 检查能力匹配
      const hasRequiredCapabilities = task.type === 'delivery' ? 
        agent.capabilities.includes('delivery') : true;
      
      return hasRequiredCapabilities;
    });
  }

  /**
   * 选择最优智能体组合
   */
  private selectOptimalAgents(task: CollaborativeTask, candidates: DroneAgent[]): DroneAgent[] {
    // 使用贪心算法选择最优组合
    const selected: DroneAgent[] = [];
    const remaining = [...candidates];

    while (selected.length < task.requiredAgents && remaining.length > 0) {
      // 计算每个候选者的效用值
      const utilities = remaining.map(agent => ({
        agent,
        utility: this.calculateAgentUtility(agent, task, selected)
      }));

      // 选择效用值最高的
      utilities.sort((a, b) => b.utility - a.utility);
      const best = utilities[0];

      selected.push(best.agent);
      remaining.splice(remaining.indexOf(best.agent), 1);
    }

    return selected;
  }

  /**
   * 计算智能体效用值
   */
  private calculateAgentUtility(
    agent: DroneAgent, 
    task: CollaborativeTask, 
    alreadySelected: DroneAgent[]
  ): number {
    // 距离因子
    const distance = this.calculateDistance(agent.position, task.location);
    const distanceFactor = 1 / (1 + distance / 100);

    // 电量因子
    const batteryFactor = agent.batteryLevel / 100;

    // 协同因子
    const collaborationFactor = this.calculateCollaborationFactor(agent, alreadySelected);

    return distanceFactor * 0.4 + batteryFactor * 0.3 + collaborationFactor * 0.3;
  }

  /**
   * 发送协调消息
   */
  private sendCoordinationMessage(agentId: string, content: any): void {
    const message: CommunicationMessage = {
      from: 'system',
      to: agentId,
      type: 'coordination',
      content,
      timestamp: Date.now(),
      priority: 5
    };

    this.messageQueue.push(message);
  }

  /**
   * 获取系统状态
   */
  getSystemStatus(): any {
    const activeAgents = Array.from(this.agents.values()).filter(
      agent => agent.status !== 'idle'
    ).length;

    const activeTasks = Array.from(this.tasks.values()).filter(
      task => task.status === 'executing'
    ).length;

    const recentConflicts = Array.from(this.conflictResolutionHistory.values())
      .filter(conflict => Date.now() - conflict.timestamp < 300000) // 5分钟内
      .length;

    return {
      totalAgents: this.agents.size,
      activeAgents,
      activeTasks,
      pendingMessages: this.messageQueue.length,
      recentConflicts,
      systemLoad: (activeAgents / this.agents.size) * 100,
      lastUpdate: Date.now()
    };
  }

  // 辅助方法
  private heuristic(a: PathNode, b: PathNode): number {
    return Math.sqrt(
      Math.pow(a.x - b.x, 2) + 
      Math.pow(a.y - b.y, 2) + 
      Math.pow(a.z - b.z, 2)
    );
  }

  private isGoal(current: PathNode, goal: PathNode): boolean {
    return Math.abs(current.x - goal.x) < 1 && 
           Math.abs(current.y - goal.y) < 1 && 
           Math.abs(current.z - goal.z) < 1;
  }

  private getNeighbors(node: PathNode, agent: DroneAgent): PathNode[] {
    const neighbors: PathNode[] = [];
    const directions = [
      [-1, 0, 0], [1, 0, 0], [0, -1, 0], [0, 1, 0], [0, 0, -1], [0, 0, 1],
      [-1, -1, 0], [-1, 1, 0], [1, -1, 0], [1, 1, 0]
    ];

    for (const [dx, dy, dz] of directions) {
      const newNode: PathNode = {
        x: node.x + dx,
        y: node.y + dy,
        z: node.z + dz,
        cost: 0,
        risk: 0,
        timestamp: Date.now()
      };

      if (this.isValidPosition(newNode, agent)) {
        neighbors.push(newNode);
      }
    }

    return neighbors;
  }

  private isValidPosition(node: PathNode, agent: DroneAgent): boolean {
    // 检查边界
    if (node.x < 0 || node.x >= this.gridSize.x ||
        node.y < 0 || node.y >= this.gridSize.y ||
        node.z < 0 || node.z >= this.gridSize.z) {
      return false;
    }

    // 检查静态障碍物
    if (this.airspaceGrid[node.x][node.y][node.z] > 0) {
      return false;
    }

    return true;
  }

  private reconstructPath(cameFrom: Map<string, PathNode>, current: PathNode): PathNode[] {
    const path: PathNode[] = [current];
    const getKey = (node: PathNode) => `${node.x},${node.y},${node.z}`;
    
    let currentKey = getKey(current);
    while (cameFrom.has(currentKey)) {
      current = cameFrom.get(currentKey)!;
      path.unshift(current);
      currentKey = getKey(current);
    }

    return path;
  }

  private getOtherAgentPaths(excludeAgentId: string): Map<string, PathNode[]> {
    // 实现获取其他智能体路径的逻辑
    return new Map();
  }

  private predictDynamicObstacles(otherPaths: Map<string, PathNode[]>): Set<string> {
    // 实现动态障碍物预测逻辑
    return new Set();
  }

  private getRiskAtPosition(node: PathNode, riskMap: number[][][]): number {
    if (node.x >= 0 && node.x < riskMap.length &&
        node.y >= 0 && node.y < riskMap[0].length &&
        node.z >= 0 && node.z < riskMap[0][0].length) {
      return riskMap[node.x][node.y][node.z];
    }
    return 0;
  }

  private getCongestionCost(node: PathNode): number {
    // 实现拥堵成本计算
    return 0;
  }

  private getEnergyCost(node: PathNode, agent: DroneAgent): number {
    // 实现能耗成本计算
    return 1;
  }

  private getCollaborationBonus(node: PathNode, agent: DroneAgent): number {
    // 实现协同奖励计算
    return 0;
  }

  private isPositionConflict(agent1: DroneAgent, agent2: DroneAgent): boolean {
    const distance = this.calculateDistance(agent1.position, agent2.position);
    return distance < 5; // 5米安全距离
  }

  private isPathConflict(agent1: DroneAgent, agent2: DroneAgent): boolean {
    // 实现路径冲突检测
    return false;
  }

  private calculateConflictSeverity(agent1: DroneAgent, agent2: DroneAgent): number {
    const distance = this.calculateDistance(agent1.position, agent2.position);
    return Math.max(0, 10 - distance);
  }

  private calculateDistance(pos1: any, pos2: any): number {
    return Math.sqrt(
      Math.pow(pos1.x - pos2.x, 2) + 
      Math.pow(pos1.y - pos2.y, 2) + 
      Math.pow(pos1.z - pos2.z, 2)
    );
  }

  private calculateAvoidanceVector(agent1: DroneAgent, agent2: DroneAgent): any {
    // 实现避让向量计算
    return { x: 0, y: 0, z: 0 };
  }

  private replanPathWithTimeWindows(agent: DroneAgent, conflictAgents: DroneAgent[]): PathNode[] {
    // 实现考虑时间窗口的路径重规划
    return [];
  }

  private assignTaskToAgents(task: CollaborativeTask, agents: DroneAgent[]): void {
    task.assignedAgents = agents.map(agent => agent.id);
    task.status = 'assigned';
    
    // 更新智能体状态
    for (const agent of agents) {
      agent.status = 'flying';
    }
  }

  private calculateCollaborationFactor(agent: DroneAgent, others: DroneAgent[]): number {
    // 实现协同因子计算
    return 1;
  }
}