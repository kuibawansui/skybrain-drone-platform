import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RiskZone {
  id: string;
  position: [number, number, number];
  radius: number;
  height: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskType: 'weather' | 'obstacle' | 'crowd' | 'electromagnetic' | 'other';
  label: string;
  probability: number;
  lastUpdate: string;
}

interface RiskState {
  zones: RiskZone[];
  globalRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  weatherConditions: {
    temperature: number;
    windSpeed: number;
    windDirection: number;
    visibility: number;
    precipitation: number;
  };
  bayesianNetwork: {
    nodes: Array<{
      id: string;
      name: string;
      probability: number;
      dependencies: string[];
    }>;
    lastCalculation: string;
  };
}

const initialState: RiskState = {
  zones: [],
  globalRiskLevel: 'low',
  weatherConditions: {
    temperature: 22,
    windSpeed: 5,
    windDirection: 180,
    visibility: 10,
    precipitation: 0,
  },
  bayesianNetwork: {
    nodes: [],
    lastCalculation: new Date().toISOString(),
  },
};

const riskSlice = createSlice({
  name: 'risk',
  initialState,
  reducers: {
    updateRiskZone: (state, action: PayloadAction<RiskZone>) => {
      const index = state.zones.findIndex(zone => zone.id === action.payload.id);
      if (index !== -1) {
        state.zones[index] = action.payload;
      } else {
        state.zones.push(action.payload);
      }
    },
    removeRiskZone: (state, action: PayloadAction<string>) => {
      state.zones = state.zones.filter(zone => zone.id !== action.payload);
    },
    setGlobalRiskLevel: (state, action: PayloadAction<RiskState['globalRiskLevel']>) => {
      state.globalRiskLevel = action.payload;
    },
    updateWeatherConditions: (state, action: PayloadAction<Partial<RiskState['weatherConditions']>>) => {
      state.weatherConditions = { ...state.weatherConditions, ...action.payload };
    },
    updateBayesianNetwork: (state, action: PayloadAction<RiskState['bayesianNetwork']>) => {
      state.bayesianNetwork = action.payload;
    },
    addBayesianNode: (state, action: PayloadAction<RiskState['bayesianNetwork']['nodes'][0]>) => {
      const index = state.bayesianNetwork.nodes.findIndex(node => node.id === action.payload.id);
      if (index !== -1) {
        state.bayesianNetwork.nodes[index] = action.payload;
      } else {
        state.bayesianNetwork.nodes.push(action.payload);
      }
      state.bayesianNetwork.lastCalculation = new Date().toISOString();
    },
    clearRiskZones: (state) => {
      state.zones = [];
    },
  },
});

export const {
  updateRiskZone,
  removeRiskZone,
  setGlobalRiskLevel,
  updateWeatherConditions,
  updateBayesianNetwork,
  addBayesianNode,
  clearRiskZones,
} = riskSlice.actions;

export default riskSlice.reducer;