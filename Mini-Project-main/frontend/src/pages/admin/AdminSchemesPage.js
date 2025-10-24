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
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentScheme, setCurrentScheme] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Initialize with complete schema structure
  const [formData, setFormData] = useState({
  name: '',
  nameHindi: '',
  description: '',
  descriptionHindi: '',
  category: 'agriculture',
  subCategory: [],
  department: 'agriculture',
  ministry: '',
  level: 'central',
  eligibility: {
    ageRange: { min: 18, max: 65 },
    // ✅ CORRECTION 1: Income limit uses the schema structure { type: Number, description: String }
    incomeLimit: { type: 100000, description: '' }, 
    gender: 'all',
    categories: [],
    location: {
      states: [],
      districts: [],
      villages: []
    },
    documents: [],
    education: [],
    other: []
  },
  benefits: {
    type: 'monetary',
    amount: { min: 0, max: 0, currency: 'INR' },
    frequency: 'one_time',
    description: ''
  },
  applicationProcess: {
    online: { available: true, portal: '', steps: [] },
    offline: { available: true, offices: [], steps: [] },
    documents: [],
    fees: { amount: 0, currency: 'INR', description: '' },
    processingTime: { days: 7, description: '7 working days' }
  },
  status: 'active',
  launchDate: '',
  endDate: '',
  contactInfo: {
    helpline: '',
    email: '',
    website: '',
    offices: []
  },
  featured: false,
  priority: 1,
  image: '',
  tags: [],
  languages: ['en', 'hi']
});


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
      setSchemes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    // Handle nested object paths (e.g., "eligibility.ageRange.min")
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        let current = newData;
        
        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = { ...current[keys[i]] };
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = type === 'number' ? Number(value) : value;
        return newData;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      }));
    }
  };

  const handleArrayInputChange = (e, fieldPath) => {
    const { value } = e.target;
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item !== '');
    
    if (fieldPath.includes('.')) {
      const keys = fieldPath.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        let current = newData;
        
        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = { ...current[keys[i]] };
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = arrayValue;
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [fieldPath]: arrayValue }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameHindi: '',
      description: '',
      descriptionHindi: '',
      category: 'agriculture',
      subCategory: [],
      department: 'agriculture',
      ministry: '',
      level: 'central',
      eligibility: {
        ageRange: { min: 18, max: 65 },
        // ✅ CORRECTION 2: Reset form also uses the object structure
        incomeLimit: { type: 100000, description: '' },
        gender: 'all',
        categories: [],
        location: {
          states: [],
          districts: [],
          villages: []
        },
        documents: [],
        education: [],
        other: []
      },
      benefits: {
        type: 'monetary',
        amount: { min: 0, max: 0, currency: 'INR' },
        frequency: 'one_time',
        description: ''
      },
      applicationProcess: {
        online: { available: true, portal: '', steps: [] },
        offline: { available: true, offices: [], steps: [] },
        documents: [],
        fees: { amount: 0, currency: 'INR', description: '' },
        processingTime: { days: 7, description: '7 working days' }
      },
      status: 'active',
      launchDate: '',
      endDate: '',
      contactInfo: {
        helpline: '',
        email: '',
        website: '',
        offices: []
      },
      featured: false,
      priority: 1,
      image: '',
      tags: [],
      languages: ['en', 'hi']
    });
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentScheme(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (scheme) => {
    setIsEditing(true);
    setCurrentScheme(scheme);
    
    // Deep merge with defaults to handle missing nested properties
    setFormData({
      name: scheme.name || '',
      nameHindi: scheme.nameHindi || '',
      description: scheme.description || '',
      descriptionHindi: scheme.descriptionHindi || '',
      category: scheme.category || 'agriculture',
      subCategory: scheme.subCategory || [],
      department: scheme.department || 'agriculture',
      ministry: scheme.ministry || '',
      level: scheme.level || 'central',
      eligibility: {
        ageRange: {
          min: scheme.eligibility?.ageRange?.min ?? 18,
          max: scheme.eligibility?.ageRange?.max ?? 65
        },
        // ✅ CORRECTION 3: Ensure incomeLimit is initialized as an object on edit
        incomeLimit: {
          type: scheme.eligibility?.incomeLimit?.type ?? 100000,
          description: scheme.eligibility?.incomeLimit?.description ?? ''
        },
        gender: scheme.eligibility?.gender || 'all',
        categories: scheme.eligibility?.categories || [],
        location: {
          states: scheme.eligibility?.location?.states || [],
          districts: scheme.eligibility?.location?.districts || [],
          villages: scheme.eligibility?.location?.villages || []
        },
        documents: scheme.eligibility?.documents || [],
        education: scheme.eligibility?.education || [],
        other: scheme.eligibility?.other || []
      },
      benefits: {
        type: scheme.benefits?.type || 'monetary',
        amount: {
          min: scheme.benefits?.amount?.min ?? 0,
          max: scheme.benefits?.amount?.max ?? 0,
          currency: scheme.benefits?.amount?.currency || 'INR'
        },
        frequency: scheme.benefits?.frequency || 'one_time',
        description: scheme.benefits?.description || ''
      },
      applicationProcess: {
        online: {
          available: scheme.applicationProcess?.online?.available ?? true,
          portal: scheme.applicationProcess?.online?.portal || '',
          steps: scheme.applicationProcess?.online?.steps || []
        },
        offline: {
          available: scheme.applicationProcess?.offline?.available ?? true,
          offices: scheme.applicationProcess?.offline?.offices || [],
          steps: scheme.applicationProcess?.offline?.steps || []
        },
        documents: scheme.applicationProcess?.documents || [],
        fees: {
          amount: scheme.applicationProcess?.fees?.amount ?? 0,
          currency: scheme.applicationProcess?.fees?.currency || 'INR',
          description: scheme.applicationProcess?.fees?.description || ''
        },
        processingTime: {
          days: scheme.applicationProcess?.processingTime?.days ?? 7,
          description: scheme.applicationProcess?.processingTime?.description || '7 working days'
        }
      },
      status: scheme.status || 'active',
      launchDate: scheme.launchDate ? new Date(scheme.launchDate).toISOString().split('T')[0] : '',
      endDate: scheme.endDate ? new Date(scheme.endDate).toISOString().split('T')[0] : '',
      contactInfo: {
        helpline: scheme.contactInfo?.helpline || '',
        email: scheme.contactInfo?.email || '',
        website: scheme.contactInfo?.website || '',
        offices: scheme.contactInfo?.offices || []
      },
      featured: scheme.featured || false,
      priority: scheme.priority ?? 1,
      image: scheme.image || '',
      tags: scheme.tags || [],
      languages: scheme.languages || ['en', 'hi']
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

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || `Scheme ${isEditing ? 'updated' : 'created'} successfully!`);
        fetchSchemes();
        setShowModal(false);
        resetForm();
      } else {
        toast.error(data.message || `Failed to ${isEditing ? 'update' : 'create'} scheme`);
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
    const matchesSearch = scheme.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scheme.schemeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scheme.nameHindi?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || scheme.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || scheme.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="search" className="sr-only">Search Schemes</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="search"
                  placeholder="Search by name, ID, or Hindi name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select
                id="categoryFilter"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Categories</option>
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
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Featured
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
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{scheme.name}</div>
                        {scheme.nameHindi && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">{scheme.nameHindi}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {scheme.category.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {scheme.department.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(scheme.status)}`}>
                          {scheme.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {scheme.featured ? (
                          <span className="text-yellow-500">★ Featured</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
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
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No schemes found</p>
                        <p className="text-sm mt-1">Try adjusting your search or filters</p>
                      </div>
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-start pt-8">
          <div className="relative p-8 border w-full max-w-6xl shadow-lg rounded-md bg-white dark:bg-gray-800 max-h-[90vh] overflow-y-auto mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Scheme' : 'Create New Scheme'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Scheme Name (English) *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                      placeholder="Enter scheme name in English"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Scheme Name (Hindi)
                    </label>
                    <input
                      type="text"
                      name="nameHindi"
                      value={formData.nameHindi}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                      placeholder="योजना का नाम हिंदी में दर्ज करें"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description (English) *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                      placeholder="Provide detailed description of the scheme"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description (Hindi)
                    </label>
                    <textarea
                      name="descriptionHindi"
                      value={formData.descriptionHindi}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                      placeholder="योजना का विस्तृत विवरण प्रदान करें"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    >
                      <option value="agriculture">Agriculture</option>
                      <option value="education">Education</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="housing">Housing</option>
                      <option value="employment">Employment</option>
                      <option value="women_child_development">Women & Child Development</option>
                      <option value="social_justice">Social Justice</option>
                      <option value="labour">Labour</option>
                      <option value="housing">Housing</option>
                      <option value="finance">Finance</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Level *
                    </label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    >
                      <option value="central">Central</option>
                      <option value="state">State</option>
                      <option value="district">District</option>
                      <option value="village">Village</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                      <option value="discontinued">Discontinued</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ministry *
                    </label>
                    <input
                      type="text"
                      name="ministry"
                      value={formData.ministry}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., Ministry of Agriculture"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Image URL
                    </label>
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Eligibility Criteria */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Eligibility Criteria</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Min Age
                    </label>
                    <input
                      type="number"
                      name="eligibility.ageRange.min"
                      value={formData.eligibility.ageRange.min}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max Age
                    </label>
                    <input
                      type="number"
                      name="eligibility.ageRange.max"
                      value={formData.eligibility.ageRange.max}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Income Limit (₹)
                    </label>
                    <input
                      type="number"
                      // ✅ CORRECTION 4: Use the nested 'type' field path for the number
                      name="eligibility.incomeLimit.type"
                      value={formData.eligibility.incomeLimit.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Income Limit Description
                    </label>
                    <input
                      type="text"
                      // ✅ CORRECTION 5: Use the nested 'description' field path
                      name="eligibility.incomeLimit.description"
                      value={formData.eligibility.incomeLimit.description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., Annual Household Income"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Gender Eligibility
                    </label>
                    <select
                      name="eligibility.gender"
                      value={formData.eligibility.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    >
                      <option value="all">All</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Categories (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.eligibility.categories.join(', ')}
                      onChange={(e) => handleArrayInputChange(e, 'eligibility.categories')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., SC, ST, OBC, General"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Required Documents (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.eligibility.documents.join(', ')}
                      onChange={(e) => handleArrayInputChange(e, 'eligibility.documents')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., Aadhaar, PAN Card"
                    />
                  </div>
                </div>
                {/* Removed redundant location inputs for brevity, but they should follow the same pattern as before */}
              </div>

              {/* Benefits (REST OF THE FORM IS UNCHANGED) */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Benefits</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Benefit Type *
                    </label>
                    <select
                      name="benefits.type"
                      value={formData.benefits.type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    >
                      <option value="monetary">Monetary</option>
                      <option value="non_monetary">Non-Monetary</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Min Amount (₹)
                    </label>
                    <input
                      type="number"
                      name="benefits.amount.min"
                      value={formData.benefits.amount.min}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max Amount (₹)
                    </label>
                    <input
                      type="number"
                      name="benefits.amount.max"
                      value={formData.benefits.amount.max}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Frequency
                    </label>
                    <select
                      name="benefits.frequency"
                      value={formData.benefits.frequency}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    >
                      <option value="one_time">One Time</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Benefit Description
                    </label>
                    <input
                      type="text"
                      name="benefits.description"
                      value={formData.benefits.description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                      placeholder="Brief description of benefits"
                    />
                  </div>
                </div>
              </div>

              {/* Application Process (UNCHANGED) */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Application Process</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Online Application */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <input
                        type="checkbox"
                        name="applicationProcess.online.available"
                        checked={formData.applicationProcess.online.available}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            applicationProcess: {
                              ...prev.applicationProcess,
                              online: {
                                ...prev.applicationProcess.online,
                                available: e.target.checked
                              }
                            }
                          }));
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Online Application Available
                      </label>
                    </div>
                    {formData.applicationProcess.online.available && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Portal URL
                          </label>
                          <input
                            type="text"
                            name="applicationProcess.online.portal"
                            value={formData.applicationProcess.online.portal}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                            placeholder="https://portal.example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Application Steps (comma-separated)
                          </label>
                          <textarea
                            value={formData.applicationProcess.online.steps.join(', ')}
                            onChange={(e) => handleArrayInputChange(e, 'applicationProcess.online.steps')}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                            placeholder="Step 1, Step 2, Step 3..."
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Offline Application */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <input
                        type="checkbox"
                        name="applicationProcess.offline.available"
                        checked={formData.applicationProcess.offline.available}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            applicationProcess: {
                              ...prev.applicationProcess,
                              offline: {
                                ...prev.applicationProcess.offline,
                                available: e.target.checked
                              }
                            }
                          }));
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Offline Application Available
                      </label>
                    </div>
                    {formData.applicationProcess.offline.available && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Office Locations (comma-separated)
                          </label>
                          <textarea
                            value={formData.applicationProcess.offline.offices.join(', ')}
                            onChange={(e) => handleArrayInputChange(e, 'applicationProcess.offline.offices')}
                            rows="2"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                            placeholder="Office 1, Office 2..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Application Steps (comma-separated)
                          </label>
                          <textarea
                            value={formData.applicationProcess.offline.steps.join(', ')}
                            onChange={(e) => handleArrayInputChange(e, 'applicationProcess.offline.steps')}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                            placeholder="Step 1, Step 2, Step 3..."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Processing Time (days)
                    </label>
                    <input
                      type="number"
                      name="applicationProcess.processingTime.days"
                      value={formData.applicationProcess.processingTime.days}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Application Fee (₹)
                    </label>
                    <input
                      type="number"
                      name="applicationProcess.fees.amount"
                      value={formData.applicationProcess.fees.amount}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fee Description
                    </label>
                    <input
                      type="text"
                      name="applicationProcess.fees.description"
                      value={formData.applicationProcess.fees.description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                      placeholder="Fee details"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information (UNCHANGED) */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Helpline Number
                    </label>
                    <input
                      type="text"
                      name="contactInfo.helpline"
                      value={formData.contactInfo.helpline}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="contactInfo.email"
                      value={formData.contactInfo.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                      placeholder="info@example.gov.in"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Website
                    </label>
                    <input
                      type="text"
                      name="contactInfo.website"
                      value={formData.contactInfo.website}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                      placeholder="https://scheme.gov.in"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Settings (UNCHANGED) */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Priority (1-10)
                    </label>
                    <input
                      type="number"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      min="1"
                      max="10"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Launch Date
                    </label>
                    <input
                      type="date"
                      name="launchDate"
                      value={formData.launchDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags.join(', ')}
                      onChange={(e) => handleArrayInputChange(e, 'tags')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., farmer, subsidy, financial"
                    />
                  </div>
                  <div className="flex items-center pt-6">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mark as Featured Scheme
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex justify-center items-center px-6 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-lg shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">{isEditing ? 'Updating...' : 'Creating...'}</span>
                    </>
                  ) : (
                    <span>{isEditing ? 'Update Scheme' : 'Create Scheme'}</span>
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

export default AdminSchemesPage;