import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  DollarSign, 
  MapPin, 
  CheckCircle, 
  Clock,
  Star,
  Download,
  Share2,
  FileText,
  Phone,
  Mail,
  ExternalLink,
  Building2,
  Globe,
  AlertCircle
} from 'lucide-react';

const SchemeDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('english');
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedSchemes, setRelatedSchemes] = useState([]);

  useEffect(() => {
    fetchSchemeDetails();
  }, [id]);

  const fetchSchemeDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/schemes/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch scheme details');
      }
      
      const data = await response.json();
      setScheme(data.data?.scheme);
      
      // Fetch related schemes
      if (data.data?.scheme?.category) {
        fetchRelatedSchemes(data.data.scheme.category, id);
      }
    } catch (error) {
      console.error('Error fetching scheme:', error);
      toast.error('Failed to load scheme details');
      navigate('/schemes');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedSchemes = async (category, currentSchemeId) => {
    try {
      const response = await fetch(`/api/schemes?category=${category}&limit=3`);
      if (response.ok) {
        const data = await response.json();
        const filtered = data.data?.schemes?.filter(s => s._id !== currentSchemeId) || [];
        setRelatedSchemes(filtered.slice(0, 2));
      }
    } catch (error) {
      console.error('Error fetching related schemes:', error);
    }
  };

  const handleApplyNow = () => {
    if (!scheme) return;
    
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: scheme.name,
        text: scheme.description,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getCategoryDisplay = (category) => {
    const map = {
      'agriculture': 'Agriculture',
      'education': 'Education',
      'healthcare': 'Healthcare',
      'housing': 'Housing',
      'employment': 'Employment',
      'women_welfare': 'Women Welfare',
      'senior_citizens': 'Senior Citizens',
      'disabled_welfare': 'Disabled Welfare',
      'social_security': 'Social Security',
      'infrastructure': 'Infrastructure',
      'environment': 'Environment',
      'other': 'Other'
    };
    return map[category] || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Scheme Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The scheme you're looking for doesn't exist.</p>
          <Link to="/schemes" className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors inline-block">
            Browse All Schemes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/schemes"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Schemes</span>
            </Link>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Language Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200 dark:border-gray-700">
            <button
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'english'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('english')}
            >
              English
            </button>
            <button
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Scheme Header */}
            <div>
              {scheme.image && (
                <div className="aspect-video w-full rounded-lg overflow-hidden mb-6 shadow-lg">
                  <img src={scheme.image} alt={scheme.name} className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                  {getCategoryDisplay(scheme.category)}
                </span>
                {scheme.featured && (
                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm font-medium rounded-full flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" />
                    Featured
                  </span>
                )}
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-medium rounded-full">
                  {scheme.status.charAt(0).toUpperCase() + scheme.status.slice(1)}
                </span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium rounded-full">
                  {scheme.level.charAt(0).toUpperCase() + scheme.level.slice(1)} Level
                </span>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {activeTab === 'english' ? scheme.name : (scheme.nameHindi || scheme.name)}
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                {activeTab === 'english' ? scheme.description : (scheme.descriptionHindi || scheme.description)}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scheme.benefits?.amount?.max > 0 && (
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">Financial Benefit</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {formatCurrency(scheme.benefits.amount.max)}
                  </p>
                </div>
              )}
              
              {scheme.applicationProcess?.processingTime?.days && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">Processing Time</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {scheme.applicationProcess.processingTime.days} Days
                  </p>
                </div>
              )}
              
              {scheme.statistics?.totalApplications > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <Users className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">Applications</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {scheme.statistics.totalApplications.toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Key Information */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Key Information</h2>
              </div>
              <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                <div className="grid grid-cols-3 gap-4 px-6 py-4">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</dt>
                  <dd className="col-span-2 text-sm text-gray-900 dark:text-white capitalize">
                    {scheme.department.replace('_', ' ')}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-4 px-6 py-4">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Ministry</dt>
                  <dd className="col-span-2 text-sm text-gray-900 dark:text-white">
                    {scheme.ministry}
                  </dd>
                </div>
                {scheme.launchDate && (
                  <div className="grid grid-cols-3 gap-4 px-6 py-4">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Launch Date</dt>
                    <dd className="col-span-2 text-sm text-gray-900 dark:text-white">
                      {new Date(scheme.launchDate).toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </dd>
                  </div>
                )}
                {scheme.benefits?.frequency && (
                  <div className="grid grid-cols-3 gap-4 px-6 py-4">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Benefit Frequency</dt>
                    <dd className="col-span-2 text-sm text-gray-900 dark:text-white capitalize">
                      {scheme.benefits.frequency.replace('_', ' ')}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Eligibility Criteria */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Eligibility Criteria</h2>
              </div>
              <div className="p-6 space-y-4">
                {scheme.eligibility?.ageRange && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Age Range</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Between {scheme.eligibility.ageRange.min} and {scheme.eligibility.ageRange.max} years
                      </p>
                    </div>
                  </div>
                )}
                
                {scheme.eligibility?.incomeLimit && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Income Limit</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Annual income should be less than {formatCurrency(scheme.eligibility.incomeLimit.type)}
                      </p>
                    </div>
                  </div>
                )}
                
                {scheme.eligibility?.gender && scheme.eligibility.gender !== 'all' && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Gender</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {scheme.eligibility.gender}
                      </p>
                    </div>
                  </div>
                )}
                
                {scheme.eligibility?.categories && scheme.eligibility.categories.length > 0 && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Categories</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {scheme.eligibility.categories.join(', ')}
                      </p>
                    </div>
                  </div>
                )}
                
                {scheme.eligibility?.location?.states && scheme.eligibility.location.states.length > 0 && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Geographic Coverage</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Available in: {scheme.eligibility.location.states.join(', ')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Benefits */}
            {scheme.benefits?.description && (
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Benefits</h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {scheme.benefits.description}
                  </p>
                  {scheme.benefits.amount?.min > 0 && scheme.benefits.amount?.max > 0 && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">
                        Financial Assistance: {formatCurrency(scheme.benefits.amount.min)} - {formatCurrency(scheme.benefits.amount.max)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Application Process */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">How to Apply</h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Online Application */}
                {scheme.applicationProcess?.online?.available && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Online Application</h3>
                    </div>
                    {scheme.applicationProcess.online.portal && (
                      <a 
                        href={scheme.applicationProcess.online.portal}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:underline mb-3"
                      >
                        Visit Application Portal
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {scheme.applicationProcess.online.steps && scheme.applicationProcess.online.steps.length > 0 && (
                      <ol className="space-y-3 mt-3">
                        {scheme.applicationProcess.online.steps.map((step, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <span className="text-gray-700 dark:text-gray-300 pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}

                {/* Offline Application */}
                {scheme.applicationProcess?.offline?.available && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Offline Application</h3>
                    </div>
                    {scheme.applicationProcess.offline.offices && scheme.applicationProcess.offline.offices.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Visit any of these offices:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {scheme.applicationProcess.offline.offices.map((office, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-400">{office}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {scheme.applicationProcess.offline.steps && scheme.applicationProcess.offline.steps.length > 0 && (
                      <ol className="space-y-3 mt-3">
                        {scheme.applicationProcess.offline.steps.map((step, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <span className="text-gray-700 dark:text-gray-300 pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Required Documents */}
            {scheme.eligibility?.documents && scheme.eligibility.documents.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Required Documents</h2>
                </div>
                <div className="p-6">
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {scheme.eligibility.documents.map((doc, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Apply Now Card */}
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Ready to Apply?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Start your application now and get one step closer to receiving benefits.
                </p>
                <button
                  onClick={handleApplyNow}
                  className="w-full bg-primary text-white px-4 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors text-center block mb-3"
                >
                  Start Application
                </button>
                <button className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Save for Later
                </button>
              </div>

              {/* Contact Information */}
              {(scheme.contactInfo?.helpline || scheme.contactInfo?.email || scheme.contactInfo?.website) && (
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Need Help?</h3>
                  <div className="space-y-3">
                    {scheme.contactInfo.helpline && (
                      <a 
                        href={`tel:${scheme.contactInfo.helpline}`}
                        className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                      >
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span>{scheme.contactInfo.helpline}</span>
                      </a>
                    )}
                    {scheme.contactInfo.email && (
                      <a 
                        href={`mailto:${scheme.contactInfo.email}`}
                        className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                      >
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="break-all">{scheme.contactInfo.email}</span>
                      </a>
                    )}
                    {scheme.contactInfo.website && (
                      <a 
                        href={scheme.contactInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                      >
                        <Globe className="w-4 h-4 flex-shrink-0" />
                        <span className="break-all">Visit Website</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Scheme Statistics */}
              {scheme.statistics && (
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Statistics</h3>
                  <div className="space-y-3">
                    {scheme.statistics.totalApplications > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Applications</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {scheme.statistics.totalApplications.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {scheme.statistics.approvedApplications > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Approved</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {scheme.statistics.approvedApplications.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {scheme.statistics.pendingApplications > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                        <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                          {scheme.statistics.pendingApplications.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Schemes */}
        {relatedSchemes.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Schemes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedSchemes.map((relatedScheme) => (
                <Link
                  key={relatedScheme._id}
                  to={`/schemes/${relatedScheme._id}`}
                  className="group block bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  {relatedScheme.image ? (
                    <div 
                      className="aspect-video w-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300" 
                      style={{ backgroundImage: `url(${relatedScheme.image})` }}
                    />
                  ) : (
                    <div className="aspect-video w-full bg-gradient-to-br from-primary/20 to-primary/5" />
                  )}
                  <div className="p-6">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded mb-2 inline-block">
                      {getCategoryDisplay(relatedScheme.category)}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors mb-1">
                      {relatedScheme.name}
                    </h3>
                    {relatedScheme.nameHindi && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {relatedScheme.nameHindi}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchemeDetailPage;