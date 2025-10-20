import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useAuthStore } from '../store/authStore';
import { 
  Home, 
  FileText, 
  Users, 
  Building,
  Wrench,
  TreePine,
  Recycle,
  Shield,
  Search,
  Clock,
  CheckCircle
} from 'lucide-react';

const ServicesPage = () => {
  const navigate = useNavigate();
  const { services, fetchServices, loading } = useApp();
  const { isAuthenticated, user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('english');
  const [hasFetched, setHasFetched] = useState(false);

  // CRITICAL FIX: Only fetch once when component mounts
  useEffect(() => {
    if (!hasFetched) {
      fetchServices().catch(error => {
        console.error('Error fetching services:', error);
      }).finally(() => {
        setHasFetched(true);
      });
    }
  }, [hasFetched, fetchServices]);

  const handleServiceClick = (service) => {
    if (!isAuthenticated) {
      const serviceName = service.name || service.nameHindi || 'Unknown Service';
      navigate('/login', { 
        state: { from: `/applications/new?service=${service.id}&serviceName=${encodeURIComponent(serviceName)}&type=service` }
      });
      return;
    }

    if (!user?.isVerified) {
      navigate('/profile', { 
        state: { message: 'Please verify your account before applying for services' }
      });
      return;
    }

    try {
      const serviceName = service.name || service.nameHindi || 'Unknown Service';
      navigate(`/applications/new?service=${service.id}&serviceName=${encodeURIComponent(serviceName)}&type=service`);
    } catch (error) {
      console.error('Failed to navigate to application form:', error);
    }
  };

  const mockServices = [
    {
      id: 1,
      name: 'Property Tax',
      nameHindi: 'संपत्ति कर',
      description: 'Pay your property tax online with ease',
      descriptionHindi: 'आसानी से अपने संपत्ति कर का ऑनलाइन भुगतान करें',
      category: 'essential',
      department: 'revenue',
      status: 'active',
      features: ['Online Payment', 'Tax Calculation', 'Receipt Generation'],
      processingTime: { days: 1, description: '1 day' },
      fees: { amount: 0, currency: 'INR', description: 'No additional fees' }
    },
    {
      id: 2,
      name: 'Water Connection',
      nameHindi: 'पानी कनेक्शन',
      description: 'Apply for new water connection',
      descriptionHindi: 'नए पानी कनेक्शन के लिए आवेदन करें',
      category: 'essential',
      department: 'water_supply',
      status: 'active',
      features: ['Online Application', 'Document Upload', 'Status Tracking'],
      processingTime: { days: 7, description: '7 days' },
      fees: { amount: 500, currency: 'INR', description: 'Connection charges' }
    },
    {
      id: 3,
      name: 'Birth Certificate',
      nameHindi: 'जन्म प्रमाण पत्र',
      description: 'Apply for birth certificate',
      descriptionHindi: 'जन्म प्रमाण पत्र के लिए आवेदन करें',
      category: 'essential',
      department: 'revenue',
      status: 'active',
      features: ['Digital Certificate', 'Online Application', 'Fast Processing'],
      processingTime: { days: 3, description: '3 days' },
      fees: { amount: 50, currency: 'INR', description: 'Certificate fee' }
    }
  ];

  const servicesData = services && Array.isArray(services) && services.length > 0 ? services : mockServices;

  const filteredServices = servicesData.filter(service => {
    const serviceName = service.name || service.nameHindi || '';
    const hindiName = service.nameHindi || '';
    const matchesSearch = serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hindiName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category) => {
    const colors = {
      essential: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      welfare: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      community: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      infrastructure: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      environment: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      sanitation: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      security: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      construction: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      maintenance: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      emergency: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return colors[category] || colors.other;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      essential: Home,
      welfare: Users,
      community: Building,
      infrastructure: Wrench,
      environment: TreePine,
      sanitation: Recycle,
      security: Shield,
      construction: Building,
      maintenance: Wrench,
      emergency: FileText,
      other: FileText
    };
    return icons[category] || FileText;
  };

  const categories = [
    { name: 'All', value: 'all', icon: FileText, count: servicesData.length },
    { name: 'Essential', value: 'essential', icon: Home, count: servicesData.filter(s => s.category === 'essential').length },
    { name: 'Welfare', value: 'welfare', icon: Users, count: servicesData.filter(s => s.category === 'welfare').length },
    { name: 'Community', value: 'community', icon: Building, count: servicesData.filter(s => s.category === 'community').length },
    { name: 'Infrastructure', value: 'infrastructure', icon: Wrench, count: servicesData.filter(s => s.category === 'infrastructure').length },
    { name: 'Environment', value: 'environment', icon: TreePine, count: servicesData.filter(s => s.category === 'environment').length }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="text-primary">
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5zM2 12l10 5 10-5-10-5-10 5z"/>
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">e-Gram Panchayat</h1>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors" to="/">
                Home
              </Link>
              <Link className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors" to="/schemes">
                Schemes
              </Link>
              <Link className="text-sm font-bold text-primary" to="/services">
                Services
              </Link>
              <Link className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors" to="/announcements">
                Announcements
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar Filters */}
        <aside className="w-80 border-r border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-900">
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Filters</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Search Services
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4" />
                    <input
                      className="h-12 w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-10 pr-4 text-sm focus:border-primary focus:ring-primary text-gray-900 dark:text-white"
                      placeholder="Search services..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <select
                    className="h-12 w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary text-gray-900 dark:text-white"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.name} ({category.count})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <header>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Digital Services</h1>
              <div className="mt-4 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                  <button
                    className={`whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium ${
                      activeTab === 'english'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                    onClick={() => setActiveTab('english')}
                  >
                    English
                  </button>
                  <button
                    className={`whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium ${
                      activeTab === 'hindi'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                    onClick={() => setActiveTab('hindi')}
                  >
                    Hindi
                  </button>
                </nav>
              </div>
            </header>

            {/* Services Grid */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => {
                const IconComponent = getCategoryIcon(service.category);
                return (
                  <div
                    key={service.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer"
                    onClick={() => handleServiceClick(service)}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(service.category)}`}>
                          {service.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {activeTab === 'english' ? service.name : (service.nameHindi || service.name)}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                        {activeTab === 'english' ? service.description : (service.descriptionHindi || service.description)}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{service.processingTime?.description || '7 days'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>{service.status || 'Active'}</span>
                        </div>
                      </div>
                      <button className="w-full bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                        Apply Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Categories */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Browse by Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.filter(cat => cat.value !== 'all').map((category, index) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => setFilterCategory(category.value)}
                      className={`group block p-4 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border text-center ${
                        filterCategory === category.value
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-3 ${
                        filterCategory === category.value
                          ? 'bg-white/20'
                          : 'bg-primary/10 text-primary'
                      }`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-semibold">
                        {category.name}
                      </h3>
                      <p className="text-xs opacity-75 mt-1">
                        {category.count} Services
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;