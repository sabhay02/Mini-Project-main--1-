import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Search, 
  Filter, 
  ArrowRight, 
  Users, 
  Calendar, 
  DollarSign,
  CheckCircle,
  Clock,
  Star,
  Home,
  FileText,
  Shield,
  TreePine,
  Heart,
  Briefcase,
  GraduationCap,
  Building2,
  Leaf
} from 'lucide-react';

const SchemesPage = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('english');
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    department: '',
    level: ''
  });

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      // Fetch only active schemes for public view
      const response = await fetch('/api/schemes?status=active');
      
      if (!response.ok) {
        throw new Error('Failed to fetch schemes');
      }
      
      const data = await response.json();
      setSchemes(data.data?.schemes || []);
    } catch (error) {
      console.error('Error fetching schemes:', error);
      setSchemes([]);
    } finally {
      setLoading(false);
    }
  };

  // Category configuration with icons
  const categoryConfig = {
    'agriculture': { name: 'Agriculture', icon: TreePine, color: 'green' },
    'education': { name: 'Education', icon: GraduationCap, color: 'blue' },
    'healthcare': { name: 'Healthcare', icon: Shield, color: 'red' },
    'housing': { name: 'Housing', icon: Home, color: 'orange' },
    'employment': { name: 'Employment', icon: Briefcase, color: 'purple' },
    'women_welfare': { name: 'Women Welfare', icon: Heart, color: 'pink' },
    'senior_citizens': { name: 'Senior Citizens', icon: Users, color: 'gray' },
    'disabled_welfare': { name: 'Disabled Welfare', icon: Heart, color: 'indigo' },
    'social_security': { name: 'Social Security', icon: Shield, color: 'teal' },
    'infrastructure': { name: 'Infrastructure', icon: Building2, color: 'slate' },
    'environment': { name: 'Environment', icon: Leaf, color: 'emerald' },
    'other': { name: 'Other', icon: FileText, color: 'gray' }
  };

  // Get categories from actual scheme data
  const categories = Object.keys(categoryConfig).map(key => ({
    value: key,
    name: categoryConfig[key].name,
    icon: categoryConfig[key].icon,
    count: schemes.filter(s => s.category === key).length
  })).filter(cat => cat.count > 0);

  const filteredSchemes = schemes.filter(scheme => {
    const matchesSearch = 
      scheme.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      scheme.nameHindi?.toLowerCase().includes(filters.search.toLowerCase()) ||
      scheme.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesCategory = !filters.category || scheme.category === filters.category;
    const matchesDepartment = !filters.department || scheme.department === filters.department;
    const matchesLevel = !filters.level || scheme.level === filters.level;
    
    return matchesSearch && matchesCategory && matchesDepartment && matchesLevel;
  });

  const handleApplyNow = (scheme) => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          from: `/applications/new?scheme=${scheme._id}&schemeName=${encodeURIComponent(scheme.name)}&type=scheme` 
        }
      });
      return;
    }

    if (!user?.isVerified) {
      navigate('/profile', { 
        state: { message: 'Please verify your account before applying for schemes' }
      });
      return;
    }

    navigate(`/applications/new?scheme=${scheme._id}&schemeName=${encodeURIComponent(scheme.name)}&type=scheme`);
  };

  const getCategoryIcon = (category) => {
    const config = categoryConfig[category] || categoryConfig.other;
    const IconComponent = config.icon;
    return <IconComponent className="w-5 h-5" />;
  };

  const getCategoryDisplay = (category) => {
    return categoryConfig[category]?.name || category;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">Government Schemes</h1>
            <p className="text-lg opacity-90 mb-6">
              Explore various government schemes designed to support citizens across different sectors
            </p>
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search schemes..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar Filters */}
        <aside className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 hidden lg:block">
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <select
                    className="h-10 w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary"
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                  >
                    <option value="">All Categories</option>
                    {Object.keys(categoryConfig).map(key => (
                      <option key={key} value={key}>{categoryConfig[key].name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Department
                  </label>
                  <select
                    className="h-10 w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary"
                    value={filters.department}
                    onChange={(e) => setFilters({...filters, department: e.target.value})}
                  >
                    <option value="">All Departments</option>
                    <option value="agriculture">Agriculture</option>
                    <option value="education">Education</option>
                    <option value="health">Health</option>
                    <option value="rural_development">Rural Development</option>
                    <option value="women_child_development">Women & Child Development</option>
                    <option value="social_justice">Social Justice</option>
                    <option value="labour">Labour</option>
                    <option value="housing">Housing</option>
                    <option value="finance">Finance</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Level
                  </label>
                  <select
                    className="h-10 w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary"
                    value={filters.level}
                    onChange={(e) => setFilters({...filters, level: e.target.value})}
                  >
                    <option value="">All Levels</option>
                    <option value="central">Central</option>
                    <option value="state">State</option>
                    <option value="district">District</option>
                    <option value="village">Village</option>
                  </select>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setFilters({ search: '', category: '', department: '', level: '' })}
              className="h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            {/* Language Toggle */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                <button
                  className={`whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                    activeTab === 'english'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                  onClick={() => setActiveTab('english')}
                >
                  English
                </button>
                <button
                  className={`whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                    activeTab === 'hindi'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                  onClick={() => setActiveTab('hindi')}
                >
                  Hindi (हिंदी)
                </button>
              </nav>
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing <span className="font-semibold">{filteredSchemes.length}</span> scheme{filteredSchemes.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Schemes Grid */}
            {filteredSchemes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {filteredSchemes.map((scheme) => (
                  <div
                    key={scheme._id}
                    className="bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden group"
                  >
                    {/* Scheme Image */}
                    {scheme.image ? (
                      <div 
                        className="aspect-video w-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300" 
                        style={{ backgroundImage: `url(${scheme.image})` }}
                      />
                    ) : (
                      <div className="aspect-video w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        {getCategoryIcon(scheme.category)}
                      </div>
                    )}
                    
                    <div className="p-6">
                      {/* Category & Featured Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full flex items-center gap-1">
                          {getCategoryIcon(scheme.category)}
                          {getCategoryDisplay(scheme.category)}
                        </span>
                        {scheme.featured && (
                          <span className="text-yellow-500 flex items-center gap-1 text-xs font-medium">
                            <Star className="w-4 h-4 fill-current" />
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Scheme Title */}
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {activeTab === 'english' ? scheme.name : (scheme.nameHindi || scheme.name)}
                      </h3>

                      {/* Scheme Description */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                        {activeTab === 'english' 
                          ? scheme.description 
                          : (scheme.descriptionHindi || scheme.description)}
                      </p>

                      {/* Scheme Info */}
                      <div className="space-y-2 mb-4">
                        {scheme.benefits?.amount?.max > 0 && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            <span>
                              Up to ₹{scheme.benefits.amount.max.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {scheme.applicationProcess?.processingTime?.days && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span>{scheme.applicationProcess.processingTime.days} days processing</span>
                          </div>
                        )}
                        {scheme.statistics?.totalApplications > 0 && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Users className="w-4 h-4 text-purple-500" />
                            <span>{scheme.statistics.totalApplications.toLocaleString()} applications</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Link
                          to={`/schemes/${scheme._id}`}
                          className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-center"
                        >
                          View Details
                        </Link>
                        <button 
                          onClick={() => handleApplyNow(scheme)}
                          className="flex-1 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                        >
                          Apply Now
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No schemes found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try adjusting your search or filters to find what you're looking for
                </p>
                <button
                  onClick={() => setFilters({ search: '', category: '', department: '', level: '' })}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Browse by Category */}
            {categories.length > 0 && (
              <div className="mt-16">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Browse by Category
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {categories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <button
                        key={category.value}
                        onClick={() => setFilters({...filters, category: category.value})}
                        className={`group block p-4 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border text-center ${
                          filters.category === category.value
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-3 ${
                          filters.category === category.value
                            ? 'bg-white/20'
                            : 'bg-primary/10 text-primary'
                        }`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <h3 className={`text-sm font-semibold mb-1 ${
                          filters.category === category.value
                            ? 'text-white'
                            : 'text-gray-900 dark:text-white group-hover:text-primary'
                        }`}>
                          {category.name}
                        </h3>
                        <p className={`text-xs ${
                          filters.category === category.value
                            ? 'text-white/80'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {category.count} Scheme{category.count !== 1 ? 's' : ''}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemesPage;