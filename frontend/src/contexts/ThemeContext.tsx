import React, { createContext, useContext, ReactNode } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { toggleDarkMode, setPrimaryColor, initializeTheme } from '../store/slices/themeSlice';

interface ThemeContextType {
  isDarkMode: boolean;
  primaryColor: string;
  toggleDarkMode: () => void;
  setPrimaryColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isDarkMode, primaryColor } = useAppSelector((state) => state.theme);

  React.useEffect(() => {
    dispatch(initializeTheme());
  }, [dispatch]);

  const handleToggleDarkMode = () => {
    dispatch(toggleDarkMode());
  };

  const handleSetPrimaryColor = (color: string) => {
    dispatch(setPrimaryColor(color));
  };

  const contextValue: ThemeContextType = {
    isDarkMode,
    primaryColor,
    toggleDarkMode: handleToggleDarkMode,
    setPrimaryColor: handleSetPrimaryColor,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
