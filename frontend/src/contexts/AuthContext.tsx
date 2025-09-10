import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { loginUser, registerUser, fetchUserProfile, logoutUser } from '../store/slices/authSlice';
import { User, LoginCredentials, RegisterData } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check for stored token on app initialization
    const token = localStorage.getItem('token');
    if (token && !user) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, user]);

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      await dispatch(loginUser(credentials)).unwrap();
    } catch (error) {
      // Error is handled by the Redux slice
      throw error;
    }
  };

  const handleRegister = async (userData: RegisterData) => {
    try {
      await dispatch(registerUser(userData)).unwrap();
    } catch (error) {
      // Error is handled by the Redux slice
      throw error;
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleUpdateProfile = async (profileData: Partial<User>) => {
    try {
      // This would be implemented with an updateUserProfile action
      console.log('Update profile:', profileData);
      // await dispatch(updateUserProfile(profileData)).unwrap();
    } catch (error) {
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateProfile: handleUpdateProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
