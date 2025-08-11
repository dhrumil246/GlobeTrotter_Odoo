'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, AuthContextType } from '../types';
import { storage } from '../utils';

// Auth reducer actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGOUT' };

// Auth reducer state
interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, isLoading: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'LOGOUT':
      return { ...state, user: null, isLoading: false, error: null };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Check for stored user session
        const storedUser = storage.get<User>('user');
        const token = storage.get<string>('token');
        
        if (storedUser && token) {
          // In a real app, validate token with the server
          dispatch({ type: 'SET_USER', payload: storedUser });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (_error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to check authentication status' });
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // In a real app, make API call to authenticate
      // For now, simulate authentication
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        preferences: {
          language: 'en',
          currency: 'USD',
          timezone: 'UTC'
        },
        savedDestinations: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Store user and token
      storage.set('user', mockUser);
      storage.set('token', 'mock-jwt-token');
      
      dispatch({ type: 'SET_USER', payload: mockUser });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  // Signup function
  const signup = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // In a real app, make API call to create user
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Store user and token
      storage.set('user', newUser);
      storage.set('token', 'mock-jwt-token');
      
      dispatch({ type: 'SET_USER', payload: newUser });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  // Logout function
  const logout = (): void => {
    storage.remove('user');
    storage.remove('token');
    dispatch({ type: 'LOGOUT' });
  };

  // Update profile function
  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      if (!state.user) throw new Error('No user logged in');
      
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // In a real app, make API call to update user
      const updatedUser: User = {
        ...state.user,
        ...userData,
        updatedAt: new Date()
      };
      
      storage.set('user', updatedUser);
      dispatch({ type: 'SET_USER', payload: updatedUser });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Profile update failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  const value: AuthContextType = {
    user: state.user,
    isAuthenticated: !!state.user,
    isLoading: state.isLoading,
    login,
    signup,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};