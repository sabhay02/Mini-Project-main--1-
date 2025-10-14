import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  MessageSquare,
  Calendar,
  User,
  ArrowRight,
  Download,
  Share2,
  Edit,
  Trash2
} from 'lucide-react';

const ApplicationsPage = () => {
  const { applications, grievances, fetchApplications, fetchGrievances, deleteApplication, deleteGrievance, loading } = useApp();
  const [activeTab, setActiveTab] = useState('applications');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
    fetchGrievances();
  }, [fetchApplications, fetchGrievances]);

  const mockApplications = [
    {
      id: 'APP-2024-001',
      type: 'Application',
      title: 'Water Connection Request',
      description: 'Request for new water connection at residential property',
      status: 'pending',
      priority: 'medium',
      submittedDate: '2024-01-15',
      lastUpdated: '2024-01-16',
      assignedTo: 'Water Supply Dept',
      estimatedResolution: '2024-01-25'
    },
    {
      id: 'APP-2024-002',
      type: 'Application',
      title: 'Birth Certificate',
      description: 'Application for birth certificate of child',
      status: 'in-progress',
      priority: 'high',
      submittedDate: '2024-01-14',
      lastUpdated: '2024-01-17',
      assignedTo: 'Civil Registration',
      estimatedResolution: '2024-01-20'
    },
    {
      id: 'APP-2024-003',
      type: 'Application',
      title: 'Property Tax Payment',
      description: 'Annual property tax payment submission',
      status: 'resolved',
      priority: 'medium',
      submittedDate: '2024-01-10',
      lastUpdated: '2024-01-18',
      assignedTo: 'Tax Department',
      estimatedResolution: '2024-01-15'
    },
    {
      id: 'APP-2024-004',
      type: 'Application',
      title: 'Community Hall Booking',
      description: 'Booking request for community hall for wedding ceremony',
      status: 'pending',
      priority: 'low',
      submittedDate: '2024-01-12',
      lastUpdated: '2024-01-12',
      assignedTo: 'Community Services',
      estimatedResolution: '2024-01-22'
    }
  ];

  const mockGrievances = [
    {
      id: 'GRV-2024-001',
      type: 'Grievance',
      title: 'Road Maintenance Request',
      description: 'Potholes on main road near school causing traffic issues',
      status: 'pending',
      priority: 'high',
      submittedDate: '2024-01-15',
      lastUpdated: '2024-01-16',
      assignedTo: 'Road Maintenance Dept',
      estimatedResolution: '2024-01-25'
    },
    {
      id: 'GRV-2024-002',
      type: 'Grievance',
      title: 'Water Supply Issue',
      description: 'No water supply in Sector 5 for past 3 days',
      status: 'in-progress',
      priority: 'high',
      submittedDate: '2024-01-14',
      lastUpdated: '2024-01-17',
      assignedTo: 'Water Supply Dept',
      estimatedResolution: '2024-01-20'
    },
    {
      id: 'GRV-2024-003',
      type: 'Grievance',
      title: 'Garbage Collection Problem',
      description: 'Garbage not being collected regularly in residential area',
      status: 'resolved',
      priority: 'medium',
      submittedDate: '2024-01-10',
      lastUpdated: '2024-01-18',
      assignedTo: 'Sanitation Dept',
      estimatedResolution: '2024-01-15'
    }
  ];

  // Use API data if available, otherwise use mock data
  const applicationsData = applications.length > 0 ? applications : mockApplications;
  const grievancesData = grievances.length > 0 ? grievances : mockGrievances;
  const allSubmissions = [...applicationsData, ...grievancesData];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type) => {
    return type === 'Application' ? <FileText className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />;
  };

  const filteredSubmissions = allSubmissions.filter(submission => {
    const matchesTab = activeTab === 'all' || submission.type.toLowerCase() === activeTab.slice(0, -1);
    const matchesSearch = submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    return matchesTab && matchesSearch && matchesStatus;
  });

  const stats = {
    total: allSubmissions.length,
    applications: applicationsData.length,
    grievances: grievancesData.length,
    pending: allSubmissions.filter(s => s.status === 'pending').length,
    inProgress: allSubmissions.filter(s => s.status === 'in-progress').length,
    resolved: allSubmissions.filter(s => s.status === 'resolved').length
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Submissions</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Track the status of your applications and grievances
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/grievances/new"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                <MessageSquare className="w-4 h-4" />
                New Grievance
              </Link>
              <Link
                to="/applications/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                New Application
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Applications</p>
                <p className="text-2xl font-bold text-blue-600">{stats.applications}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Grievances</p>
                <p className="text-2xl font-bold text-orange-600">{stats.grievances}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('applications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'applications'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                Applications ({stats.applications})
              </button>
              <button
                onClick={() => setActiveTab('grievances')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'grievances'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                Grievances ({stats.grievances})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                All ({stats.total})
              </button>
            </nav>
          </div>

          {/* Filters and Search */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search submissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
                
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Filter className="w-4 h-4" />
                  More Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ID & Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          submission.type === 'Application' 
                            ? 'bg-blue-100 dark:bg-blue-900' 
                            : 'bg-orange-100 dark:bg-orange-900'
                        }`}>
                          {getTypeIcon(submission.type)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {submission.id}
                          </div>
                          <div className={`text-xs ${
                            submission.type === 'Application' 
                              ? 'text-blue-600 dark:text-blue-400' 
                              : 'text-orange-600 dark:text-orange-400'
                          }`}>
                            {submission.type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {submission.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {submission.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(submission.priority)}`}>
                        {submission.priority.charAt(0).toUpperCase() + submission.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(submission.status)}`}>
                        {getStatusIcon(submission.status)}
                        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1).replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(submission.submittedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Link
                          to={submission.type === 'Application' ? `/applications/${submission.id}` : `/grievances/${submission.id}`}
                          className="text-primary hover:text-primary/80 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {submission.status === 'pending' && (
                          <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors" title="Share">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredSubmissions.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No submissions found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'You haven\'t submitted any applications or grievances yet.'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <div className="flex gap-3 justify-center">
                  <Link
                    to="/applications/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    New Application
                  </Link>
                  <Link
                    to="/grievances/new"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                  >
                    <MessageSquare className="w-4 h-4" />
                    New Grievance
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationsPage;