import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useAuthStore } from '../store/authStore';
import { 
  Search, 
  Filter, 
  ArrowRight, 
  Users, 
  Calendar, 
  MapPin, 
  DollarSign,
  CheckCircle,
  Clock,
  Star,
  Download,
  Share2,
  HeartHandshake,
  Home,
  FileText,
  Shield,
  TreePine
} from 'lucide-react';

const SchemesPage = () => {
  const { schemes, fetchSchemes, loading } = useApp();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('english');
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    state: '',
    district: '',
    department: '',
    category: '',
    eligibility: '',
    language: ''
  });

  useEffect(() => {
    fetchSchemes().catch(error => {
      console.error('Error fetching schemes:', error);
      // Error is already handled in AppContext, no need to show additional error
    });
  }, [fetchSchemes]);

  // Mock schemes data - will be replaced by API data
  const mockSchemes = [
    {
      id: 1,
      name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
      hindiName: 'प्रधानमंत्री किसान सम्मान निधि',
      department: 'Ministry of Agriculture & Farmers Welfare',
      category: 'Agriculture',
      description: 'The PM-KISAN scheme provides income support to small and marginal farmer families across India. Under this scheme, eligible farmer families receive an annual financial assistance of ₹6,000, disbursed in three equal installments of ₹2,000 every four months.',
      hindiDescription: 'पीएम-किसान योजना भारत भर के छोटे और सीमांत किसान परिवारों को आय सहायता प्रदान करती है। इस योजना के तहत, पात्र किसान परिवारों को ₹6,000 की वार्षिक वित्तीय सहायता मिलती है।',
      eligibility: 'Small and marginal farmers with landholding up to 2 hectares',
      benefits: '₹6,000 per year in 3 installments',
      status: 'Active',
      applications: 1250,
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      name: 'Pradhan Mantri Awas Yojana (PMAY)',
      hindiName: 'प्रधानमंत्री आवास योजना',
      department: 'Ministry of Housing and Urban Affairs',
      category: 'Housing',
      description: 'PMAY aims to provide affordable housing to all by 2022. The scheme provides financial assistance for construction of new houses or renovation of existing houses.',
      hindiDescription: 'पीएमएवाई का उद्देश्य 2022 तक सभी को किफायती आवास प्रदान करना है। यह योजना नए घर बनाने या मौजूदा घरों के नवीनीकरण के लिए वित्तीय सहायता प्रदान करती है।',
      eligibility: 'Economically weaker sections and low-income groups',
      benefits: 'Up to ₹2.5 lakhs financial assistance',
      status: 'Active',
      applications: 890,
      rating: 4.3,
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      name: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana',
      hindiName: 'आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना',
      department: 'Ministry of Health and Family Welfare',
      category: 'Health',
      description: 'This scheme provides health insurance coverage of up to ₹5 lakhs per family per year for secondary and tertiary care hospitalization.',
      hindiDescription: 'यह योजना द्वितीयक और तृतीयक देखभाल अस्पताल में भर्ती के लिए प्रति वर्ष प्रति परिवार ₹5 लाख तक का स्वास्थ्य बीमा कवरेज प्रदान करती है।',
      eligibility: 'Families identified as per SECC database',
      benefits: 'Health insurance up to ₹5 lakhs per family',
      status: 'Active',
      applications: 2100,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop'
    },
    {
      id: 4,
      name: 'Pradhan Mantri Mudra Yojana',
      hindiName: 'प्रधानमंत्री मुद्रा योजना',
      department: 'Ministry of Finance',
      category: 'Finance',
      description: 'MUDRA scheme provides loans up to ₹10 lakhs to non-corporate, non-farm small/micro enterprises for starting or expanding their business.',
      hindiDescription: 'मुद्रा योजना अपना व्यवसाय शुरू करने या विस्तार करने के लिए गैर-कॉर्पोरेट, गैर-कृषि छोटे/सूक्ष्म उद्यमों को ₹10 लाख तक का ऋण प्रदान करती है।',
      eligibility: 'Small and micro enterprises',
      benefits: 'Loans up to ₹10 lakhs',
      status: 'Active',
      applications: 1560,
      rating: 4.4,
      image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=300&fit=crop'
    },
    {
      id: 5,
      name: 'Swachh Bharat Mission',
      hindiName: 'स्वच्छ भारत मिशन',
      department: 'Ministry of Jal Shakti',
      category: 'Sanitation',
      description: 'The mission aims to achieve universal sanitation coverage and eliminate open defecation by providing toilets and promoting hygiene practices.',
      hindiDescription: 'मिशन का उद्देश्य शौचालय प्रदान करके और स्वच्छता प्रथाओं को बढ़ावा देकर सार्वभौमिक स्वच्छता कवरेज प्राप्त करना और खुले में शौच को समाप्त करना है।',
      eligibility: 'Rural households without toilets',
      benefits: 'Financial assistance for toilet construction',
      status: 'Active',
      applications: 3200,
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=300&fit=crop'
    },
    {
      id: 6,
      name: 'Pradhan Mantri Ujjwala Yojana',
      hindiName: 'प्रधानमंत्री उज्ज्वला योजना',
      department: 'Ministry of Petroleum and Natural Gas',
      category: 'Energy',
      description: 'This scheme provides LPG connections to women from below poverty line families to reduce indoor air pollution and improve health.',
      hindiDescription: 'यह योजना घरेलू वायु प्रदूषण को कम करने और स्वास्थ्य में सुधार के लिए गरीबी रेखा से नीचे के परिवारों की महिलाओं को एलपीजी कनेक्शन प्रदान करती है।',
      eligibility: 'Women from BPL families',
      benefits: 'Free LPG connection with cylinder and regulator',
      status: 'Active',
      applications: 1800,
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop'
    }
  ];

  const categories = [
    { name: 'Agriculture', icon: TreePine, count: 2 },
    { name: 'Housing', icon: Home, count: 1 },
    { name: 'Health', icon: Shield, count: 1 },
    { name: 'Finance', icon: DollarSign, count: 1 },
    { name: 'Sanitation', icon: FileText, count: 1 },
    { name: 'Energy', icon: Star, count: 1 }
  ];

  // Use API data if available, otherwise use mock data
  const schemesData = schemes && Array.isArray(schemes) && schemes.length > 0 ? schemes : mockSchemes;

  const filteredSchemes = schemesData.filter(scheme => {
    const schemeName = scheme.name || scheme.nameHindi || '';
    const hindiName = scheme.nameHindi || scheme.hindiName || '';
    const matchesSearch = schemeName.toLowerCase().includes(filters.search.toLowerCase()) ||
                         hindiName.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = !filters.category || scheme.category === filters.category;
    return matchesSearch && matchesCategory;
  });

  const handleApplyNow = async (scheme) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect to login with return URL
      const schemeName = scheme.name || scheme.nameHindi || 'Unknown Scheme';
      navigate('/login', { 
        state: { from: `/applications/new?scheme=${scheme._id || scheme.id}&schemeName=${encodeURIComponent(schemeName)}&type=scheme` }
      });
      return;
    }

    // Check if user is verified
    if (!user?.isVerified) {
      // Redirect to profile for verification
      navigate('/profile', { 
        state: { message: 'Please verify your account before applying for schemes' }
      });
      return;
    }

    try {
      // Navigate to application form with scheme details
      const schemeName = scheme.name || scheme.nameHindi || 'Unknown Scheme';
      navigate(`/applications/new?scheme=${scheme._id || scheme.id}&schemeName=${encodeURIComponent(schemeName)}&type=scheme`);
    } catch (error) {
      console.error('Failed to navigate to application form:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
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
              <Link className="text-sm font-bold text-primary" to="/schemes">
                Schemes
              </Link>
              <Link className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors" to="/services">
                Services
              </Link>
              <Link className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors" to="/help">
                Help
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4" />
                <input
                  className="h-10 w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-10 pr-4 text-sm focus:border-primary focus:ring-primary"
                  placeholder="Search schemes"
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                />
              </div>
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-background-light dark:bg-background-dark text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0v5z" />
                </svg>
              </button>
              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar Filters */}
        <aside className="w-80 border-r border-gray-200 dark:border-gray-700 p-6">
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Filters</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <select
                    className="h-12 w-full rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary"
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    State
                  </label>
                  <select className="h-12 w-full rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary">
                    <option>Select State</option>
                    <option>Maharashtra</option>
                    <option>Gujarat</option>
                    <option>Rajasthan</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Department
                  </label>
                  <select className="h-12 w-full rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary">
                    <option>Select Department</option>
                    <option>Ministry of Agriculture</option>
                    <option>Ministry of Health</option>
                    <option>Ministry of Housing</option>
                  </select>
                </div>
              </div>
            </div>
            <button className="h-10 w-full rounded-lg bg-primary px-4 text-sm font-bold text-white hover:bg-primary/90 transition-colors">
              Apply Filters
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <header>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Government Schemes</h1>
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

            {/* Schemes Grid */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSchemes.map((scheme) => (
                <div
                  key={scheme.id}
                  className="bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer"
                  onClick={() => setSelectedScheme(scheme)}
                >
                  <div className="aspect-video w-full bg-cover bg-center" style={{ backgroundImage: `url(${scheme.image})` }}></div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                        {scheme.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{scheme.rating}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {activeTab === 'english' ? (scheme.name || scheme.nameHindi) : (scheme.nameHindi || scheme.hindiName)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {activeTab === 'english' ? (scheme.description || scheme.descriptionHindi) : (scheme.descriptionHindi || scheme.hindiDescription)}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{scheme.applications} applications</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{scheme.status}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/schemes/${scheme._id || scheme.id}`}
                        className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-center"
                      >
                        View Details
                      </Link>
                      <button 
                        onClick={() => handleApplyNow(scheme)}
                        className="flex-1 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Categories */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Browse by Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.map((category, index) => {
                  const IconComponent = category.icon;
                  return (
                    <Link
                      key={index}
                      to={`/schemes?category=${category.name.toLowerCase()}`}
                      className="group block p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-200 dark:border-gray-700 text-center"
                    >
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg text-primary mb-3">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {category.count} Schemes
                      </p>
                    </Link>
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

export default SchemesPage;