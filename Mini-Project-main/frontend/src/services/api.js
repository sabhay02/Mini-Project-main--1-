const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get headers with auth token
  getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Helper method to get headers for file uploads
  getFileHeaders() {
    const token = localStorage.getItem('token');
    return {
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      
      // Handle network errors gracefully
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      
      throw error;
    }
  }

  // File upload method
  async uploadFile(endpoint, formData) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getFileHeaders(),
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  // Authentication APIs
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async verifyOTP(otpData) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(otpData)
    });
  }

  async resendOTP(email) {
    return this.request('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // Schemes APIs
  async getSchemes(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/schemes${queryString ? `?${queryString}` : ''}`);
  }

  async getScheme(id) {
    return this.request(`/schemes/${id}`);
  }

  async applyForScheme(schemeId, applicationData) {
    return this.request(`/schemes/${schemeId}/apply`, {
      method: 'POST',
      body: JSON.stringify(applicationData)
    });
  }

  // Applications APIs
  async getApplications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/applications${queryString ? `?${queryString}` : ''}`);
  }

  async getApplication(id) {
    return this.request(`/applications/${id}`);
  }

  async createApplication(applicationData) {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData)
    });
  }

  async updateApplication(id, applicationData) {
    return this.request(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(applicationData)
    });
  }

  async deleteApplication(id) {
    return this.request(`/applications/${id}`, {
      method: 'DELETE'
    });
  }

  async uploadApplicationDocuments(applicationId, formData) {
    return this.uploadFile(`/applications/${applicationId}/documents`, formData);
  }

  // Grievances APIs
  async getGrievances(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/grievances${queryString ? `?${queryString}` : ''}`);
  }

  async getGrievance(id) {
    return this.request(`/grievances/${id}`);
  }

  async createGrievance(grievanceData) {
    return this.request('/grievances', {
      method: 'POST',
      body: JSON.stringify(grievanceData)
    });
  }

  async updateGrievance(id, grievanceData) {
    return this.request(`/grievances/${id}`, {
      method: 'PUT',
      body: JSON.stringify(grievanceData)
    });
  }

  async deleteGrievance(id) {
    return this.request(`/grievances/${id}`, {
      method: 'DELETE'
    });
  }

  async uploadGrievanceDocuments(grievanceId, formData) {
    return this.uploadFile(`/grievances/${grievanceId}/documents`, formData);
  }

  // Comments APIs
  async addApplicationComment(applicationId, comment) {
    return this.request(`/applications/${applicationId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment })
    });
  }

  async addGrievanceComment(grievanceId, comment) {
    return this.request(`/grievances/${grievanceId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment })
    });
  }

  // Announcements APIs
  async getAnnouncements(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/announcements${queryString ? `?${queryString}` : ''}`);
  }

  async getAnnouncement(id) {
    return this.request(`/announcements/${id}`);
  }

  // Services APIs
  async getServices(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/services${queryString ? `?${queryString}` : ''}`);
  }

  async getService(id) {
    return this.request(`/services/${id}`);
  }

  // Dashboard APIs
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  async getRecentActivity() {
    return this.request('/dashboard/activity');
  }

  // Admin APIs
  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async getAdminApplications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/applications${queryString ? `?${queryString}` : ''}`);
  }

  async getAdminGrievances(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/grievances${queryString ? `?${queryString}` : ''}`);
  }

  async updateApplicationStatus(id, status, comment) {
    return this.request(`/admin/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, comment })
    });
  }

  async updateGrievanceStatus(id, status, comment) {
    return this.request(`/admin/grievances/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, comment })
    });
  }

  // File download
  async downloadFile(fileId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/files/${fileId}`, {
      headers: this.getFileHeaders()
    });

    if (!response.ok) {
      throw new Error('File download failed');
    }

    return response.blob();
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
