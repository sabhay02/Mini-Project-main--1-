import React, { createContext, useContext, useReducer, useEffect } from 'react';
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

  // Helper function to handle API calls
  const handleApiCall = async (apiCall, type, successMessage) => {
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
  };

  // Schemes
  const fetchSchemes = async (params = {}) => {
    return handleApiCall(
      () => apiService.getSchemes(params),
      'schemes'
    ).then(response => {
      const schemes = response.data?.schemes || response.schemes || [];
      dispatch({ type: 'SET_SCHEMES', payload: schemes });
      return schemes;
    }).catch(error => {
      console.error('Error fetching schemes:', error);
      // Set empty array on error to prevent undefined state
      dispatch({ type: 'SET_SCHEMES', payload: [] });
      return [];
    });
  };

  const getScheme = async (id) => {
    return handleApiCall(() => apiService.getScheme(id), 'schemes').then(response => {
      return response.data?.scheme || response.scheme;
    });
  };

  const applyForScheme = async (schemeId, applicationData) => {
    return handleApiCall(
      () => apiService.applyForScheme(schemeId, applicationData),
      'applications',
      'Application submitted successfully!'
    ).then(application => {
      dispatch({ type: 'ADD_APPLICATION', payload: application });
      return application;
    });
  };

  // Applications
  const fetchApplications = async (params = {}) => {
    return handleApiCall(
      () => apiService.getApplications(params),
      'applications'
    ).then(response => {
      const applications = response.data?.applications || response.applications || [];
      dispatch({ type: 'SET_APPLICATIONS', payload: applications });
      return applications;
    });
  };

  const getApplication = async (id) => {
    return handleApiCall(() => apiService.getApplication(id), 'applications').then(response => {
      return response.data?.application || response.application;
    });
  };

  const createApplication = async (applicationData) => {
    return handleApiCall(
      () => apiService.createApplication(applicationData),
      'applications',
      'Application submitted successfully!'
    ).then(response => {
      const application = response.data?.application || response.application;
      dispatch({ type: 'ADD_APPLICATION', payload: application });
      return application;
    });
  };

  const updateApplication = async (id, applicationData) => {
    return handleApiCall(
      () => apiService.updateApplication(id, applicationData),
      'applications',
      'Application updated successfully!'
    ).then(response => {
      const application = response.data?.application || response.application;
      dispatch({ type: 'UPDATE_APPLICATION', payload: application });
      return application;
    });
  };

  const deleteApplication = async (id) => {
    return handleApiCall(
      () => apiService.deleteApplication(id),
      'applications',
      'Application deleted successfully!'
    ).then(() => {
      dispatch({ 
        type: 'SET_APPLICATIONS', 
        payload: state.applications.filter(app => app.id !== id) 
      });
    });
  };

  const uploadApplicationDocuments = async (applicationId, formData) => {
    return handleApiCall(
      () => apiService.uploadApplicationDocuments(applicationId, formData),
      'applications',
      'Documents uploaded successfully!'
    );
  };

  // Grievances
  const fetchGrievances = async (params = {}) => {
    return handleApiCall(
      () => apiService.getGrievances(params),
      'grievances'
    ).then(grievances => {
      dispatch({ type: 'SET_GRIEVANCES', payload: grievances });
      return grievances;
    });
  };

  const getGrievance = async (id) => {
    return handleApiCall(() => apiService.getGrievance(id), 'grievances');
  };

  const createGrievance = async (grievanceData) => {
    return handleApiCall(
      () => apiService.createGrievance(grievanceData),
      'grievances',
      'Grievance submitted successfully!'
    ).then(grievance => {
      dispatch({ type: 'ADD_GRIEVANCE', payload: grievance });
      return grievance;
    });
  };

  const updateGrievance = async (id, grievanceData) => {
    return handleApiCall(
      () => apiService.updateGrievance(id, grievanceData),
      'grievances',
      'Grievance updated successfully!'
    ).then(grievance => {
      dispatch({ type: 'UPDATE_GRIEVANCE', payload: grievance });
      return grievance;
    });
  };

  const deleteGrievance = async (id) => {
    return handleApiCall(
      () => apiService.deleteGrievance(id),
      'grievances',
      'Grievance deleted successfully!'
    ).then(() => {
      dispatch({ 
        type: 'SET_GRIEVANCES', 
        payload: state.grievances.filter(grievance => grievance.id !== id) 
      });
    });
  };

  const uploadGrievanceDocuments = async (grievanceId, formData) => {
    return handleApiCall(
      () => apiService.uploadGrievanceDocuments(grievanceId, formData),
      'grievances',
      'Documents uploaded successfully!'
    );
  };

  // Comments
  const addApplicationComment = async (applicationId, comment) => {
    return handleApiCall(
      () => apiService.addApplicationComment(applicationId, comment),
      'applications',
      'Comment added successfully!'
    );
  };

  const addGrievanceComment = async (grievanceId, comment) => {
    return handleApiCall(
      () => apiService.addGrievanceComment(grievanceId, comment),
      'grievances',
      'Comment added successfully!'
    );
  };

  // Announcements
  const fetchAnnouncements = async (params = {}) => {
    return handleApiCall(
      () => apiService.getAnnouncements(params),
      'announcements'
    ).then(response => {
      const announcements = response.data?.announcements || response.announcements || [];
      dispatch({ type: 'SET_ANNOUNCEMENTS', payload: announcements });
      return announcements;
    }).catch(error => {
      console.error('Error fetching announcements:', error);
      // Set empty array on error to prevent undefined state
      dispatch({ type: 'SET_ANNOUNCEMENTS', payload: [] });
      return [];
    });
  };

  // Services
  const fetchServices = async (params = {}) => {
    return handleApiCall(
      () => apiService.getServices(params),
      'services'
    ).then(response => {
      const services = response.data?.services || response.services || [];
      dispatch({ type: 'SET_SERVICES', payload: services });
      return services;
    }).catch(error => {
      console.error('Error fetching services:', error);
      // Set empty array on error to prevent undefined state
      dispatch({ type: 'SET_SERVICES', payload: [] });
      return [];
    });
  };

  // Dashboard
  const fetchDashboardStats = async () => {
    return handleApiCall(
      () => apiService.getDashboardStats(),
      'applications'
    ).then(stats => {
      dispatch({ type: 'SET_STATS', payload: stats });
      return stats;
    });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

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
