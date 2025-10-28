import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    titleHindi: '',
    content: '',
    contentHindi: '',
    type: 'general',
    priority: 'medium',
    category: 'general',
    targetAudience: 'all',
    status: 'published',
    featured: false,
    pinned: false,
    announcementLanguage: 'bilingual'
  });
  const [actionLoading, setActionLoading] = useState(false);

  const { token } = useAuthStore();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/announcements', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }
      
      const data = await response.json();
      console.log('Fetched announcements:', data);
      
      if (data.success && data.data) {
        setAnnouncements(data.data.announcements || []);
      } else {
        setAnnouncements([]);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to fetch announcements');
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentAnnouncement(null);
    setFormData({
      title: '',
      titleHindi: '',
      content: '',
      contentHindi: '',
      type: 'general',
      priority: 'medium',
      category: 'general',
      targetAudience: 'all',
      status: 'published',
      featured: false,
      pinned: false,
      announcementLanguage: 'bilingual'
    });
    setShowModal(true);
  };

  const openEditModal = (announcement) => {
    setIsEditing(true);
    setCurrentAnnouncement(announcement);
    
    // Map old values to new values if they exist
    let languageValue = announcement.announcementLanguage || announcement.language || 'bilingual';
    if (languageValue === 'both') languageValue = 'bilingual';
    if (languageValue === 'en') languageValue = 'english';
    if (languageValue === 'hi') languageValue = 'hindi';
    
    setFormData({
      title: announcement.title || '',
      titleHindi: announcement.titleHindi || '',
      content: announcement.content || '',
      contentHindi: announcement.contentHindi || '',
      type: announcement.type || 'general',
      priority: announcement.priority || 'medium',
      category: announcement.category || 'general',
      targetAudience: announcement.targetAudience || 'all',
      status: announcement.status || 'published',
      featured: announcement.featured || false,
      pinned: announcement.pinned || false,
      announcementLanguage: languageValue
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing 
      ? `/api/announcements/${currentAnnouncement._id}` 
      : '/api/announcements';

    try {
      console.log('Submitting announcement:', { method, url, formData });
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      console.log('Response:', result);

      if (response.ok && result.success) {
        toast.success(result.message || `Announcement ${isEditing ? 'updated' : 'created'} successfully!`);
        fetchAnnouncements();
        setShowModal(false);
      } else {
        toast.error(result.message || `Failed to ${isEditing ? 'update' : 'create'} announcement`);
        console.error('Error details:', result);
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} announcement:`, error);
      toast.error(`Error ${isEditing ? 'updating' : 'creating'} announcement`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (announcementId) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/announcements/${announcementId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(result.message || 'Announcement deleted successfully!');
        fetchAnnouncements();
      } else {
        toast.error(result.message || 'Failed to delete announcement');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Error deleting announcement');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.announcementId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || announcement.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Announcements Management
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Create and manage announcements for citizens.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Announcement
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="sr-only">Search Announcements</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="search"
                  placeholder="Search by title or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                id="statusFilter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total: {filteredAnnouncements.length} announcements
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAnnouncements.length > 0 ? (
                  filteredAnnouncements.map((announcement) => (
                    <tr key={announcement._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {announcement.title}
                        </div>
                        {announcement.titleHindi && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {announcement.titleHindi}
                          </div>
                        )}
                        {announcement.announcementId && (
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            ID: {announcement.announcementId}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {announcement.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(announcement.priority)}`}>
                          {announcement.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(announcement.status)}`}>
                          {announcement.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center space-x-2">
                          <button
                            onClick={() => openEditModal(announcement)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(announcement._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete"
                            disabled={actionLoading}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No announcements found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative p-8 border w-full max-w-3xl shadow-lg rounded-md bg-white dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {isEditing ? 'Edit Announcement' : 'Create New Announcement'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title (English) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="title" 
                    id="title" 
                    value={formData.title} 
                    onChange={handleInputChange} 
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2 border" 
                  />
                </div>
                <div>
                  <label htmlFor="titleHindi" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title (Hindi)</label>
                  <input 
                    type="text" 
                    name="titleHindi" 
                    id="titleHindi" 
                    value={formData.titleHindi} 
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2 border" 
                  />
                </div>
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Content (English) <span className="text-red-500">*</span>
                </label>
                <textarea 
                  name="content" 
                  id="content" 
                  rows="4" 
                  value={formData.content} 
                  onChange={handleInputChange} 
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2 border"
                ></textarea>
              </div>
              <div>
                <label htmlFor="contentHindi" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Content (Hindi)</label>
                <textarea 
                  name="contentHindi" 
                  id="contentHindi" 
                  rows="4" 
                  value={formData.contentHindi} 
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2 border"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                  <select 
                    name="type" 
                    id="type" 
                    value={formData.type} 
                    onChange={handleInputChange} 
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2 border"
                  >
                    <option value="general">General</option>
                    <option value="scheme_launch">Scheme Launch</option>
                    <option value="deadline_reminder">Deadline Reminder</option>
                    <option value="policy_update">Policy Update</option>
                    <option value="event_notification">Event Notification</option>
                    <option value="emergency">Emergency</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="holiday">Holiday</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                  <select 
                    name="priority" 
                    id="priority" 
                    value={formData.priority} 
                    onChange={handleInputChange} 
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2 border"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                  <select 
                    name="category" 
                    id="category" 
                    value={formData.category} 
                    onChange={handleInputChange} 
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2 border"
                  >
                    <option value="general">General</option>
                    <option value="schemes">Schemes</option>
                    <option value="services">Services</option>
                    <option value="events">Events</option>
                    <option value="deadlines">Deadlines</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="policy">Policy</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <select 
                    name="status" 
                    id="status" 
                    value={formData.status} 
                    onChange={handleInputChange} 
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2 border"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="announcementLanguage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Language</label>
                  <select 
                    name="announcementLanguage" 
                    id="announcementLanguage" 
                    value={formData.announcementLanguage} 
                    onChange={handleInputChange} 
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2 border"
                  >
                    <option value="english">English Only</option>
                    <option value="hindi">Hindi Only</option>
                    <option value="bilingual">Bilingual (Both)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    name="featured" 
                    checked={formData.featured} 
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" 
                  />
                  <span className="ml-2 text-sm text-gray-900 dark:text-white">Featured</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    name="pinned" 
                    checked={formData.pinned} 
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" 
                  />
                  <span className="ml-2 text-sm text-gray-900 dark:text-white">Pinned</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                >
                  {actionLoading ? (
                    <span className="flex items-center">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Processing...</span>
                    </span>
                  ) : (
                    isEditing ? 'Update Announcement' : 'Create Announcement'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncementsPage;