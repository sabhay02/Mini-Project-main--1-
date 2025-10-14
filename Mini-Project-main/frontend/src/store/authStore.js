import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - only redirect if not already on login page
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Clear the auth store state
      const { set } = useAuthStore.getState();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
      
      // Only redirect if not already on login or register page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      // Actions
      login: async (credentials, isAdmin = false) => {
        try {
          set({ isLoading: true });
          
          // Clear any existing authentication data first
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          const response = await api.post('/auth/login', credentials);
          const { token, user } = response.data.data;
          
          // Check if admin login is required
          if (isAdmin && !['admin', 'staff'].includes(user.role)) {
            set({ isLoading: false });
            return {
              success: false,
              message: 'Access denied. Admin privileges required.',
            };
          }
          
          // Set new authentication data
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          return { success: true, data: response.data, user };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.response?.data?.message || 'Login failed',
          };
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true });
          
          const response = await api.post('/auth/register', userData);
          
          set({ isLoading: false });
          return { success: true, data: response.data };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.response?.data?.message || 'Registration failed',
          };
        }
      },

      sendOTP: async (phoneOrEmail) => {
        try {
          set({ isLoading: true });
          
          const response = await api.post('/auth/send-otp', phoneOrEmail);
          
          set({ isLoading: false });
          return { success: true, data: response.data };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.response?.data?.message || 'Failed to send OTP',
          };
        }
      },

      verifyOTP: async (otpData) => {
        try {
          set({ isLoading: true });
          
          const response = await api.post('/auth/verify-otp', otpData);
          const { token, user } = response.data.data;
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          return { success: true, data: response.data };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.response?.data?.message || 'OTP verification failed',
          };
        }
      },

      logout: async () => {
        try {
          // Only call logout API if we have a token
          const token = localStorage.getItem('token');
          if (token) {
            await api.post('/auth/logout');
          }
        } catch (error) {
          // Continue with local logout even if API call fails
        } finally {
          // Clear localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Clear auth store state
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      updateProfile: async (profileData) => {
        try {
          set({ isLoading: true });
          
          const response = await api.put('/auth/profile', profileData);
          const { user } = response.data.data;
          
          localStorage.setItem('user', JSON.stringify(user));
          
          set({
            user,
            isLoading: false,
          });
          
          return { success: true, data: response.data };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.response?.data?.message || 'Profile update failed',
          };
        }
      },

      changePassword: async (passwordData) => {
        try {
          set({ isLoading: true });
          
          const response = await api.put('/auth/change-password', passwordData);
          
          set({ isLoading: false });
          return { success: true, data: response.data };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.response?.data?.message || 'Password change failed',
          };
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (token && user) {
          try {
            set({ isLoading: true });
            
            // Verify token with backend
            const response = await api.get('/auth/me');
            const { user: userData } = response.data.data;
            
            set({
              user: userData,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            // Token is invalid - clear everything
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } else {
          // No token or user data - ensure clean state
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      refreshUser: async () => {
        try {
          const response = await api.get('/auth/me');
          const { user } = response.data.data;
          
          localStorage.setItem('user', JSON.stringify(user));
          
          set({ user });
          
          return { success: true, data: response.data };
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message || 'Failed to refresh user data',
          };
        }
      },


      // Helper functions
      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      },

      isStaff: () => {
        const { user } = get();
        return user?.role === 'staff' || user?.role === 'admin';
      },

      isVerified: () => {
        const { user } = get();
        return user?.isVerified;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      // Add version to handle potential migrations
      version: 2,
      migrate: (persistedState, version) => {
        // Clear persisted state if version mismatch or if user is null but token exists
        if (version !== 2 || (!persistedState?.user && persistedState?.token)) {
          return {
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          };
        }
        return persistedState;
      },
      // Add storage event listener to sync across tabs
      onRehydrateStorage: () => (state) => {
        // Ensure consistency between localStorage and Zustand
        if (state) {
          const token = localStorage.getItem('token');
          const user = localStorage.getItem('user');
          
          if (!token || !user) {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
          }
        }
      },
    }
  )
);

export default api;
