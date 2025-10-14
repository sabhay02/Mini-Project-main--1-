import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Search, Filter, XCircle, CheckCircle, Clock, MoreVertical } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminSchemesPage = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentScheme, setCurrentScheme] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    nameHindi: '',
    description: '',
    descriptionHindi: '',
    category: 'agriculture',
    department: 'agriculture',
    ministry: '',
    level: 'central',
    eligibility: {
      ageRange: { min: 18, max: 65 },
      incomeLimit: 100000,
      gender: 'all',
      categories: [],
      documents: []
    },
    benefits: {
      type: 'monetary',
      amount: { min: 0, max: 0 },
      frequency: 'one_time',
      description: ''
    },
    applicationProcess: {
      online: { available: true, portal: '', steps: [] },
      offline: { available: true, offices: [], steps: [] },
      documents: [],
      fees: { amount: 0, currency: 'INR', description: '' },
      processingTime: { days: 7, description: '7 days' }
    },
    status: 'active',
    featured: false,
    priority: 1,
    languages: ['en']
  });
  const [actionLoading, setActionLoading] = useState(false);

  const { token } = useAuthStore();

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/schemes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch schemes');
      }
      
      const data = await response.json();
      setSchemes(data.data?.schemes || []);
    } catch (error) {
      console.error('Error fetching schemes:', error);
      toast.error('Failed to fetch schemes');
      // Set empty array on error to prevent crashes
      setSchemes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (name === 'categories' || name === 'documents' || name === 'steps' || name === 'offices' || name === 'languages') {
      setFormData(prev => ({
        ...prev,
        [name]: value.split(',').map(item => item.trim()).filter(item => item !== '')
      }));
    } else if (name === 'incomeLimit' || name === 'min' || name === 'max' || name === 'amount') {
      setFormData(prev => ({
        ...prev,
        [name]: Number(value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentScheme(null);
    setFormData({
      name: '',
      nameHindi: '',
      description: '',
      descriptionHindi: '',
      category: 'agriculture',
      department: 'agriculture',
      ministry: '',
      level: 'central',
      eligibility: {
        ageRange: { min: 18, max: 65 },
        incomeLimit: 100000,
        gender: 'all',
        categories: [],
        documents: []
      },
      benefits: {
        type: 'monetary',
        amount: { min: 0, max: 0 },
        frequency: 'one_time',
        description: ''
      },
      applicationProcess: {
        online: { available: true, portal: '', steps: [] },
        offline: { available: true, offices: [], steps: [] },
        documents: [],
        fees: { amount: 0, currency: 'INR', description: '' },
        processingTime: { days: 7, description: '7 days' }
      },
      status: 'active',
      featured: false,
      priority: 1,
      languages: ['en']
    });
    setShowModal(true);
  };

  const openEditModal = (scheme) => {
    setIsEditing(true);
    setCurrentScheme(scheme);
    setFormData({
      ...scheme,
      eligibility: scheme.eligibility || { ageRange: { min: 18, max: 65 }, incomeLimit: 100000, gender: 'all', categories: [], documents: [] },
      benefits: scheme.benefits || { type: 'monetary', amount: { min: 0, max: 0 }, frequency: 'one_time', description: '' },
      applicationProcess: scheme.applicationProcess || {
        online: { available: true, portal: '', steps: [] },
        offline: { available: true, offices: [], steps: [] },
        documents: [],
        fees: { amount: 0, currency: 'INR', description: '' },
        processingTime: { days: 7, description: '7 days' }
      }
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/admin/schemes/${currentScheme._id}` : '/api/admin/schemes';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(`Scheme ${isEditing ? 'updated' : 'created'} successfully!`);
        fetchSchemes();
        setShowModal(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} scheme`);
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} scheme:`, error);
      toast.error(`Error ${isEditing ? 'updating' : 'creating'} scheme`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (schemeId) => {
    if (!window.confirm('Are you sure you want to delete this scheme?')) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/schemes/${schemeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Scheme deleted successfully!');
        fetchSchemes();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete scheme');
      }
    } catch (error) {
      console.error('Error deleting scheme:', error);
      toast.error('Error deleting scheme');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredSchemes = schemes.filter(scheme => {
    const matchesSearch = scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scheme.schemeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || scheme.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'suspended': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'discontinued': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
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
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Schemes Management
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Create and manage government schemes for citizens.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Scheme
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="sr-only">Search Schemes</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="search"
                  placeholder="Search by name or ID..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>
          </div>
        </div>

        {/* Schemes Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Scheme ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
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
                {filteredSchemes.length > 0 ? (
                  filteredSchemes.map((scheme) => (
                    <tr key={scheme._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {scheme.schemeId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{scheme.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{scheme.nameHindi}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {scheme.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(scheme.status)}`}>
                          {scheme.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(scheme.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center space-x-2">
                          <button
                            onClick={() => openEditModal(scheme)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(scheme._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete"
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
                      No schemes found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Scheme Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative p-8 border w-full max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {isEditing ? 'Edit Scheme' : 'Create New Scheme'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name (English)</label>
                  <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label htmlFor="nameHindi" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name (Hindi)</label>
                  <input type="text" name="nameHindi" id="nameHindi" value={formData.nameHindi} onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (English)</label>
                <textarea name="description" id="description" rows="3" value={formData.description} onChange={handleInputChange} required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
              </div>
              <div>
                <label htmlFor="descriptionHindi" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (Hindi)</label>
                <textarea name="descriptionHindi" id="descriptionHindi" rows="3" value={formData.descriptionHindi} onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                  <select name="category" id="category" value={formData.category} onChange={handleInputChange} required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="agriculture">Agriculture</option>
                    <option value="education">Education</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="housing">Housing</option>
                    <option value="employment">Employment</option>
                    <option value="women_welfare">Women Welfare</option>
                    <option value="senior_citizens">Senior Citizens</option>
                    <option value="disabled_welfare">Disabled Welfare</option>
                    <option value="social_security">Social Security</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="environment">Environment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                  <select name="department" id="department" value={formData.department} onChange={handleInputChange} required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="agriculture">Agriculture</option>
                    <option value="education">Education</option>
                    <option value="health">Health</option>
                    <option value="rural_development">Rural Development</option>
                    <option value="women_child_development">Women & Child Development</option>
                    <option value="social_justice">Social Justice</option>
                    <option value="labour">Labour</option>
                    <option value="housing">Housing</option>
                    <option value="finance">Finance</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Level</label>
                  <select name="level" id="level" value={formData.level} onChange={handleInputChange} required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="central">Central</option>
                    <option value="state">State</option>
                    <option value="district">District</option>
                    <option value="local">Local</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input type="checkbox" name="featured" id="featured" checked={formData.featured} onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600" />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-900 dark:text-white">Featured Scheme</label>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                >
                  {actionLoading ? <LoadingSpinner size="sm" /> : (isEditing ? 'Update Scheme' : 'Create Scheme')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSchemesPage;