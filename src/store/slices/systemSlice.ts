import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SystemState {
  status: 'online' | 'offline' | 'maintenance';
  performance: {
    cpu: number;
    memory: number;
    network: number;
    processing: number;
  };
  alerts: Array<{
    id: string;
    type: 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
  }>;
}

const initialState: SystemState = {
  status: 'online',
  performance: {
    cpu: 45,
    memory: 68,
    network: 88,
    processing: 95,
  },
  alerts: [],
};

const systemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    setSystemStatus: (state, action: PayloadAction<SystemState['status']>) => {
      state.status = action.payload;
    },
    updatePerformance: (state, action: PayloadAction<Partial<SystemState['performance']>>) => {
      state.performance = { ...state.performance, ...action.payload };
    },
    addAlert: (state, action: PayloadAction<Omit<SystemState['alerts'][0], 'id' | 'timestamp'>>) => {
      const alert = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      };
      state.alerts.unshift(alert);
      if (state.alerts.length > 50) {
        state.alerts = state.alerts.slice(0, 50);
      }
    },
    removeAlert: (state, action: PayloadAction<string>) => {
      state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
    },
    clearAlerts: (state) => {
      state.alerts = [];
    },
  },
});

export const { 
  setSystemStatus, 
  updatePerformance, 
  addAlert, 
  removeAlert, 
  clearAlerts 
} = systemSlice.actions;

export default systemSlice.reducer;