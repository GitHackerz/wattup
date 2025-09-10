import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DashboardState {
  energyData: any[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: DashboardState = {
  energyData: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateEnergyData: (state, action: PayloadAction<any[]>) => {
      state.energyData = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    addEnergyReading: (state, action: PayloadAction<any>) => {
      state.energyData.push(action.payload);
      state.lastUpdated = new Date().toISOString();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setLoading, setError, updateEnergyData, addEnergyReading, clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
