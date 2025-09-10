import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ThemeState } from '../../types';

const initialState: ThemeState = {
  isDarkMode: localStorage.getItem('darkMode') === 'true',
  primaryColor: localStorage.getItem('primaryColor') || '#2563eb',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
      localStorage.setItem('darkMode', state.isDarkMode.toString());
      
      // Update DOM class
      if (state.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setPrimaryColor: (state, action: PayloadAction<string>) => {
      state.primaryColor = action.payload;
      localStorage.setItem('primaryColor', action.payload);
      
      // Update CSS custom property
      document.documentElement.style.setProperty('--primary-color', action.payload);
    },
    initializeTheme: (state) => {
      // Initialize DOM based on stored preferences
      if (state.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      document.documentElement.style.setProperty('--primary-color', state.primaryColor);
    },
  },
});

export const { toggleDarkMode, setPrimaryColor, initializeTheme } = themeSlice.actions;
export default themeSlice.reducer;
