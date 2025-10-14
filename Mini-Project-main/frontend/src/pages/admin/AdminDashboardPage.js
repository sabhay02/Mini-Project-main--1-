import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  FileText,
  MessageSquare,
  BarChart3,
  Users,
  Settings,
  Eye,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  UserPlus,
  FileCheck,
  MessageCircle
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApprovals: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalGrievances: 0,
    pendingGrievances: 0,
    resolvedGrievances: 0,
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    totalSchemes: 0,
    activeSchemes: 0,
    pendingSchemes: 0,
    totalServices: 0,
    activeServices: 0,
    totalAnnouncements: 0,
    publishedAnnouncements: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentGrievances, setRecentGrievances] = useState([]);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch dashboard statistics
      const statsResponse = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let statsData = null;
      if (statsResponse.ok) {
        statsData = await statsResponse.json();
        const statistics = statsData.data?.statistics || {};
        
        // Transform the data to match our expected format
        const transformedStats = {
          totalApplications: statistics.totalApplications || 0,
          pendingApprovals: statistics.pendingApplications || 0,
          approvedApplications: statistics.approvedApplications || 0,
          rejectedApplications: statistics.rejectedApplications || 0,
          totalGrievances: statistics.totalGrievances || 0,
          pendingGrievances: statistics.openGrievances || 0,
          resolvedGrievances: statistics.resolvedGrievances || 0,
          totalUsers: statistics.totalUsers || 0,
          activeUsers: statistics.users?.find(item => item._id === 'citizen')?.count || 0,
          newUsers: 0, // This would need a separate query for recent users
          totalSchemes: statistics.totalSchemes || 0,
          activeSchemes: statistics.activeSchemes || 0,
          pendingSchemes: (statistics.totalSchemes || 0) - (statistics.activeSchemes || 0),
          totalServices: statistics.totalServices || 0,
          activeServices: statistics.activeServices || 0,
          totalAnnouncements: statistics.totalAnnouncements || 0,
          publishedAnnouncements: statistics.publishedAnnouncements || 0
        };
        
        setStats(transformedStats);
      }

      // Fetch recent applications
      const applicationsResponse = await fetch('/api/admin/applications?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json();
        setRecentApplications(applicationsData.data?.applications || []);
      } else {
        // Fallback to dashboard data if applications endpoint fails
        setRecentApplications(statsData?.data?.recentApplications || []);
      }

      // Fetch recent grievances
      const grievancesResponse = await fetch('/api/admin/grievances?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (grievancesResponse.ok) {
        const grievancesData = await grievancesResponse.json();
        setRecentGrievances(grievancesData.data?.grievances || []);
      } else {
        // Fallback to dashboard data if grievances endpoint fails
        setRecentGrievances(statsData?.data?.recentGrievances || []);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
      // Set default values to prevent crashes
      setStats({
        totalApplications: 0,
        pendingApprovals: 0,
        approvedApplications: 0,
        rejectedApplications: 0,
        totalGrievances: 0,
        pendingGrievances: 0,
        resolvedGrievances: 0,
        totalUsers: 0,
        activeUsers: 0,
        newUsers: 0,
        totalSchemes: 0,
        activeSchemes: 0,
        pendingSchemes: 0,
        totalServices: 0,
        activeServices: 0,
        totalAnnouncements: 0,
        publishedAnnouncements: 0
      });
      setRecentApplications([]);
      setRecentGrievances([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'approved':
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Welcome back! Here's what's happening in your panchayat.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/admin/schemes"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors font-medium"
            >
              <Settings className="w-5 h-5" />
              Manage Schemes
            </Link>
            <Link
              to="/admin/services"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors font-medium"
            >
              <Settings className="w-5 h-5" />
              Manage Services
            </Link>
            <Link
              to="/admin/announcements"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors font-medium"
            >
              <MessageCircle className="w-5 h-5" />
              Manage Announcements
            </Link>
            <Link
              to="/admin/applications"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors font-medium"
            >
              <FileText className="w-5 h-5" />
              View Applications
            </Link>
            <Link
              to="/admin/grievances"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors font-medium"
            >
              <AlertCircle className="w-5 h-5" />
              Manage Grievances
            </Link>
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              <Users className="w-5 h-5" />
              Manage Users
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Applications Stats */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +12%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.totalApplications.toLocaleString()}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Applications</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <TrendingDown className="w-4 h-4" />
                -5%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.pendingApprovals.toLocaleString()}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending Approvals</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +8%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.approvedApplications.toLocaleString()}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Approved Applications</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                0%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.rejectedApplications.toLocaleString()}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Rejected Applications</p>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <MessageSquare className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.totalGrievances.toLocaleString()}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Grievances</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.totalUsers.toLocaleString()}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <UserPlus className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.activeUsers.toLocaleString()}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                <FileCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.totalSchemes}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Schemes</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Applications */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Applications</h3>
                <Link
                  to="/admin/applications"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{app.id}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{app.type}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">by {app.applicant}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                        {new Date(app.submittedDate).toLocaleDateString()}
                      </p>
                      <Link
                        to={`/admin/applications/${app.id}`}
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Grievances */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Grievances</h3>
                <Link
                  to="/admin/grievances"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentGrievances.map((grievance) => (
                  <div key={grievance.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{grievance.id}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(grievance.status)}`}>
                          {grievance.status.charAt(0).toUpperCase() + grievance.status.slice(1).replace('-', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{grievance.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">by {grievance.complainant}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                        {new Date(grievance.submittedDate).toLocaleDateString()}
                      </p>
                      <Link
                        to={`/admin/grievances/${grievance.id}`}
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="mt-8 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">System Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stats.totalApplications}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Applications</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{stats.totalGrievances}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Grievances</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalUsers}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Registered Users</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;