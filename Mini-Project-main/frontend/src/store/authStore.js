import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

// Ensure the environment variable is read correctly
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// --- Axios Instance Setup ---

// We create a function to get the current token from the store's state
// This allows the interceptor to access the token managed by Zustand's persistence
const getToken = () => {
    // We use a try/catch here in case the store hasn't initialized its persisted state yet
    try {
        // Read directly from local storage using the key defined in the persist middleware
        const persistedState = JSON.parse(localStorage.getItem('auth-storage'));
        return persistedState?.state?.token;
    } catch (e) {
        return null;
    }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// 🌟 CORRECTION: Interceptor now uses the getToken getter to find the token.
api.interceptors.request.use(
  (config) => {
    const token = getToken(); // Get token from persistent storage handled by Zustand
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🌟 CORRECTION: Response interceptor now only uses the store's set() function to clear state.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear the auth store state using set()
      const { set, logout } = useAuthStore.getState();
      
      // Call local logout to clear state/storage and prevent token reuse
      logout(false); // Pass false to prevent redundant API call inside logout

      // Only redirect if not already on login or register page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- Zustand Store Definition ---

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
          
          // 🌟 CORRECTION: Removed manual localStorage.removeItem calls
          
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
          
          // 🌟 CORRECTION: Removed manual localStorage.setItem calls
          
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
          
          // 🌟 CORRECTION: Removed manual localStorage.setItem calls
          
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

      // If `skipApi` is true, skips the API call and just clears local state (used by interceptor)
      logout: async (skipApi = false) => {
        try {
          // Only call logout API if skipApi is false (default behavior)
          if (!skipApi) {
            await api.post('/auth/logout');
          }
        } catch (error) {
          // Continue with local logout even if API call fails
        } finally {
          // 🌟 CORRECTION: Removed manual localStorage.removeItem calls
          
          // Clear auth store state via set() which triggers persist
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
          
          // 🌟 CORRECTION: Removed manual localStorage.setItem call
          
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
        // Rely on persisted state being loaded initially by middleware
        const token = get().token;
        const user = get().user;
        
        if (token && user) {
          try {
            set({ isLoading: true });
            
            // Verify token with backend
            const response = await api.get('/auth/me');
            const { user: userData } = response.data.data;
            
            set({
              user: userData,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            // Token is invalid - clear everything
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } else {
          // No token or user data - ensure clean state
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
          
          // 🌟 CORRECTION: Removed manual localStorage.setItem call
          
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
      // 🌟 CORRECTION: Removed manual localStorage operations from partialize/rehydrate logic
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      version: 2,
      migrate: (persistedState, version) => {
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
    }
  )
);

export default api;
