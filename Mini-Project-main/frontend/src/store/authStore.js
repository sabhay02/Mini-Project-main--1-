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

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear the auth store state using set()
      const { logout } = useAuthStore.getState();
      
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
          
          console.log('Login attempt:', { 
            email: credentials.email, 
            isAdmin,
            apiUrl: API_BASE_URL 
          });
          
          const response = await api.post('/auth/login', credentials);
          
          console.log('Login response:', response.data);
          
          // Handle different response structures
          let token, user;
          
          if (response.data.data) {
            // Response format: { success: true, data: { token, user } }
            token = response.data.data.token;
            user = response.data.data.user;
          } else if (response.data.token && response.data.user) {
            // Response format: { token, user }
            token = response.data.token;
            user = response.data.user;
          } else {
            throw new Error('Invalid response format from server');
          }
          
          console.log('Parsed user data:', user);
          
          // Check if admin login is required
          if (isAdmin && !['admin', 'staff'].includes(user.role)) {
            console.log('Admin check failed. User role:', user.role);
            set({ isLoading: false });
            return {
              success: false,
              message: 'Access denied. Admin privileges required.',
              user: user
            };
          }
          
          console.log('Login successful, setting state');
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          return { success: true, data: response.data, user };
        } catch (error) {
          console.error('Login error:', error);
          
          set({ isLoading: false });
          
          // Provide more specific error messages
          if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
            return {
              success: false,
              message: 'Unable to connect to server. Please check if the backend is running at ' + API_BASE_URL,
            };
          }
          
          if (error.response?.status === 401 || error.response?.status === 400) {
            return {
              success: false,
              message: error.response?.data?.message || 'Invalid email or password',
            };
          }
          
          return {
            success: false,
            message: error.response?.data?.message || error.message || 'Login failed',
          };
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true });
          
          console.log('Register attempt:', { email: userData.email });
          
          const response = await api.post('/auth/register', userData);
          
          console.log('Register response:', response.data);
          
          // Handle different response structures
          let token, user;
          
          if (response.data.data) {
            token = response.data.data.token;
            user = response.data.data.user;
          } else if (response.data.token && response.data.user) {
            token = response.data.token;
            user = response.data.user;
          } else {
            throw new Error('Invalid response format from server');
          }
          
          // Automatically log in user after successful registration
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          return { success: true, data: response.data, user };
        } catch (error) {
          console.error('Register error:', error);
          
          set({ isLoading: false });
          
          // Provide more specific error messages
          if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
            return {
              success: false,
              message: 'Unable to connect to server. Please check if the backend is running.',
            };
          }
          
          return {
            success: false,
            message: error.response?.data?.message || 'Registration failed',
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
          console.error('Logout error:', error);
          // Continue with local logout even if API call fails
        } finally {
          console.log('Clearing auth state');
          
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
          
          let user;
          if (response.data.data) {
            user = response.data.data.user;
          } else if (response.data.user) {
            user = response.data.user;
          }
          
          set({
            user,
            isLoading: false,
          });
          
          return { success: true, data: response.data };
        } catch (error) {
          console.error('Update profile error:', error);
          
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
          console.error('Change password error:', error);
          
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
        
        console.log('Checking auth:', { hasToken: !!token, hasUser: !!user });
        
        if (token && user) {
          try {
            set({ isLoading: true });
            
            // Verify token with backend
            const response = await api.get('/auth/me');
            
            let userData;
            if (response.data.data) {
              userData = response.data.data.user;
            } else if (response.data.user) {
              userData = response.data.user;
            }
            
            console.log('Auth check successful:', userData);
            
            set({
              user: userData,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            console.log('Auth check failed:', error.message);
            
            // Only clear auth state if it's a 401 (unauthorized) error
            // For network errors, keep the user logged in locally
            if (error.response?.status === 401) {
              set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
              });
            } else {
              // For network errors, keep user logged in but set loading to false
              set({
                isLoading: false,
                isAuthenticated: true, // Keep authenticated
              });
            }
          }
        } else {
          // No token or user data - ensure clean state
          console.log('No auth data found');
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
          
          let user;
          if (response.data.data) {
            user = response.data.data.user;
          } else if (response.data.user) {
            user = response.data.user;
          }
          
          set({ user });
          
          return { success: true, data: response.data };
        } catch (error) {
          console.error('Refresh user error:', error);
          
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