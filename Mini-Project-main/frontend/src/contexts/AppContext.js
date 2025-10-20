import React, { createContext, useContext, useReducer, useCallback } from 'react';
import apiService from '../services/api';
import toast from 'react-hot-toast';

const AppContext = createContext();

const initialState = {
  schemes: [],
  applications: [],
  grievances: [],
  announcements: [],
  services: [],
  loading: {
    schemes: false,
    applications: false,
    grievances: false,
    announcements: false,
    services: false
  },
  error: null,
  stats: {
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    totalGrievances: 0,
    pendingGrievances: 0,
    resolvedGrievances: 0
  }
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.type]: action.payload.loading
        }
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
    
    case 'SET_SCHEMES':
      return {
        ...state,
        schemes: action.payload,
        loading: {
          ...state.loading,
          schemes: false
        }
      };
    
    case 'SET_APPLICATIONS':
      return {
        ...state,
        applications: action.payload,
        loading: {
          ...state.loading,
          applications: false
        }
      };
    
    case 'SET_GRIEVANCES':
      return {
        ...state,
        grievances: action.payload,
        loading: {
          ...state.loading,
          grievances: false
        }
      };
    
    case 'SET_ANNOUNCEMENTS':
      return {
        ...state,
        announcements: action.payload,
        loading: {
          ...state.loading,
          announcements: false
        }
      };
    
    case 'SET_SERVICES':
      return {
        ...state,
        services: action.payload,
        loading: {
          ...state.loading,
          services: false
        }
      };
    
    case 'SET_STATS':
      return {
        ...state,
        stats: action.payload
      };
    
    case 'ADD_APPLICATION':
      return {
        ...state,
        applications: [action.payload, ...state.applications]
      };
    
    case 'ADD_GRIEVANCE':
      return {
        ...state,
        grievances: [action.payload, ...state.grievances]
      };
    
    case 'UPDATE_APPLICATION':
      return {
        ...state,
        applications: state.applications.map(app => 
          app.id === action.payload.id ? action.payload : app
        )
      };
    
    case 'UPDATE_GRIEVANCE':
      return {
        ...state,
        grievances: state.grievances.map(grievance => 
          grievance.id === action.payload.id ? action.payload : grievance
        )
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Helper function to handle API calls - wrapped in useCallback
  const handleApiCall = useCallback(async (apiCall, type, successMessage) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { type, loading: true } });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const result = await apiCall();
      
      if (successMessage) {
        toast.success(successMessage);
      }
      
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      
      // Only show toast for non-network errors to avoid spam
      if (!error.message.includes('Unable to connect to server')) {
        toast.error(error.message || 'An error occurred');
      }
      
      throw error;
    }
  }, []);

  // Schemes
  const fetchSchemes = useCallback(async (params = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { type: 'schemes', loading: true } });
      const response = await apiService.getSchemes(params);
      const schemes = response.data?.schemes || response.schemes || [];
      dispatch({ type: 'SET_SCHEMES', payload: schemes });
      return schemes;
    } catch (error) {
      console.error('Error fetching schemes:', error);
      dispatch({ type: 'SET_SCHEMES', payload: [] });
      return [];
    }
  }, []);

  const getScheme = useCallback(async (id) => {
    try {
      const response = await apiService.getScheme(id);
      return response.data?.scheme || response.scheme;
    } catch (error) {
      console.error('Error fetching scheme:', error);
      throw error;
    }
  }, []);

  const applyForScheme = useCallback(async (schemeId, applicationData) => {
    try {
      const response = await apiService.applyForScheme(schemeId, applicationData);
      const application = response.data?.application || response.application;
      dispatch({ type: 'ADD_APPLICATION', payload: application });
      toast.success('Application submitted successfully!');
      return application;
    } catch (error) {
      toast.error(error.message || 'Failed to submit application');
      throw error;
    }
  }, []);

  // Applications
  const fetchApplications = useCallback(async (params = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { type: 'applications', loading: true } });
      const response = await apiService.getApplications(params);
      const applications = response.data?.applications || response.applications || [];
      dispatch({ type: 'SET_APPLICATIONS', payload: applications });
      return applications;
    } catch (error) {
      console.error('Error fetching applications:', error);
      dispatch({ type: 'SET_APPLICATIONS', payload: [] });
      return [];
    }
  }, []);

  const getApplication = useCallback(async (id) => {
    try {
      const response = await apiService.getApplication(id);
      return response.data?.application || response.application;
    } catch (error) {
      console.error('Error fetching application:', error);
      throw error;
    }
  }, []);

  const createApplication = useCallback(async (applicationData) => {
    try {
      const response = await apiService.createApplication(applicationData);
      const application = response.data?.application || response.application;
      dispatch({ type: 'ADD_APPLICATION', payload: application });
      toast.success('Application submitted successfully!');
      return application;
    } catch (error) {
      toast.error(error.message || 'Failed to create application');
      throw error;
    }
  }, []);

  const updateApplication = useCallback(async (id, applicationData) => {
    try {
      const response = await apiService.updateApplication(id, applicationData);
      const application = response.data?.application || response.application;
      dispatch({ type: 'UPDATE_APPLICATION', payload: application });
      toast.success('Application updated successfully!');
      return application;
    } catch (error) {
      toast.error(error.message || 'Failed to update application');
      throw error;
    }
  }, []);

  const deleteApplication = useCallback(async (id) => {
    try {
      await apiService.deleteApplication(id);
      dispatch({ 
        type: 'SET_APPLICATIONS', 
        payload: state.applications.filter(app => app.id !== id) 
      });
      toast.success('Application deleted successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to delete application');
      throw error;
    }
  }, [state.applications]);

  const uploadApplicationDocuments = useCallback(async (applicationId, formData) => {
    try {
      const response = await apiService.uploadApplicationDocuments(applicationId, formData);
      toast.success('Documents uploaded successfully!');
      return response;
    } catch (error) {
      toast.error(error.message || 'Failed to upload documents');
      throw error;
    }
  }, []);

  // Grievances
  const fetchGrievances = useCallback(async (params = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { type: 'grievances', loading: true } });
      const response = await apiService.getGrievances(params);
      const grievances = response.data?.grievances || response.grievances || [];
      dispatch({ type: 'SET_GRIEVANCES', payload: grievances });
      return grievances;
    } catch (error) {
      console.error('Error fetching grievances:', error);
      dispatch({ type: 'SET_GRIEVANCES', payload: [] });
      return [];
    }
  }, []);

  const getGrievance = useCallback(async (id) => {
    try {
      const response = await apiService.getGrievance(id);
      return response.data?.grievance || response.grievance;
    } catch (error) {
      console.error('Error fetching grievance:', error);
      throw error;
    }
  }, []);

  const createGrievance = useCallback(async (grievanceData) => {
    try {
      const response = await apiService.createGrievance(grievanceData);
      const grievance = response.data?.grievance || response.grievance;
      dispatch({ type: 'ADD_GRIEVANCE', payload: grievance });
      toast.success('Grievance submitted successfully!');
      return grievance;
    } catch (error) {
      toast.error(error.message || 'Failed to create grievance');
      throw error;
    }
  }, []);

  const updateGrievance = useCallback(async (id, grievanceData) => {
    try {
      const response = await apiService.updateGrievance(id, grievanceData);
      const grievance = response.data?.grievance || response.grievance;
      dispatch({ type: 'UPDATE_GRIEVANCE', payload: grievance });
      toast.success('Grievance updated successfully!');
      return grievance;
    } catch (error) {
      toast.error(error.message || 'Failed to update grievance');
      throw error;
    }
  }, []);

  const deleteGrievance = useCallback(async (id) => {
    try {
      await apiService.deleteGrievance(id);
      dispatch({ 
        type: 'SET_GRIEVANCES', 
        payload: state.grievances.filter(grievance => grievance.id !== id) 
      });
      toast.success('Grievance deleted successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to delete grievance');
      throw error;
    }
  }, [state.grievances]);

  const uploadGrievanceDocuments = useCallback(async (grievanceId, formData) => {
    try {
      const response = await apiService.uploadGrievanceDocuments(grievanceId, formData);
      toast.success('Documents uploaded successfully!');
      return response;
    } catch (error) {
      toast.error(error.message || 'Failed to upload documents');
      throw error;
    }
  }, []);

  // Comments
  const addApplicationComment = useCallback(async (applicationId, comment) => {
    try {
      const response = await apiService.addApplicationComment(applicationId, comment);
      toast.success('Comment added successfully!');
      return response;
    } catch (error) {
      toast.error(error.message || 'Failed to add comment');
      throw error;
    }
  }, []);

  const addGrievanceComment = useCallback(async (grievanceId, comment) => {
    try {
      const response = await apiService.addGrievanceComment(grievanceId, comment);
      toast.success('Comment added successfully!');
      return response;
    } catch (error) {
      toast.error(error.message || 'Failed to add comment');
      throw error;
    }
  }, []);

  // Announcements - CRITICAL: This is the one causing issues
  const fetchAnnouncements = useCallback(async (params = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { type: 'announcements', loading: true } });
      const response = await apiService.getAnnouncements(params);
      const announcements = response.data?.announcements || response.announcements || [];
      dispatch({ type: 'SET_ANNOUNCEMENTS', payload: announcements });
      return announcements;
    } catch (error) {
      console.error('Error fetching announcements:', error);
      dispatch({ type: 'SET_ANNOUNCEMENTS', payload: [] });
      return [];
    }
  }, []); // Empty dependency array - function never changes

  // Services
  const fetchServices = useCallback(async (params = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { type: 'services', loading: true } });
      const response = await apiService.getServices(params);
      const services = response.data?.services || response.services || [];
      dispatch({ type: 'SET_SERVICES', payload: services });
      return services;
    } catch (error) {
      console.error('Error fetching services:', error);
      dispatch({ type: 'SET_SERVICES', payload: [] });
      return [];
    }
  }, []);

  // Dashboard
  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await apiService.getDashboardStats();
      const stats = response.data?.stats || response.stats;
      dispatch({ type: 'SET_STATS', payload: stats });
      return stats;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value = {
    ...state,
    // Schemes
    fetchSchemes,
    getScheme,
    applyForScheme,
    // Applications
    fetchApplications,
    getApplication,
    createApplication,
    updateApplication,
    deleteApplication,
    uploadApplicationDocuments,
    // Grievances
    fetchGrievances,
    getGrievance,
    createGrievance,
    updateGrievance,
    deleteGrievance,
    uploadGrievanceDocuments,
    // Comments
    addApplicationComment,
    addGrievanceComment,
    // Announcements
    fetchAnnouncements,
    // Services
    fetchServices,
    // Dashboard
    fetchDashboardStats,
    // Utils
    clearError
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}