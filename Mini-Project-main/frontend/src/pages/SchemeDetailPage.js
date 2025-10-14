import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
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
  HeartHandshake,
  FileText,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react';

const SchemeDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('english');

  const handleApplyNow = () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate('/login', { 
        state: { from: `/applications/new?scheme=${scheme.id}&schemeName=${encodeURIComponent(scheme.name)}` }
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

    // Navigate to application form with scheme details
    navigate(`/applications/new?scheme=${scheme.id}&schemeName=${encodeURIComponent(scheme.name)}&type=scheme`);
  };

  // Mock scheme data - in real app, this would come from API
  const scheme = {
    id: 1,
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    hindiName: 'प्रधानमंत्री किसान सम्मान निधि',
    department: 'Ministry of Agriculture & Farmers Welfare',
    category: 'Agriculture',
    description: 'The PM-KISAN scheme provides income support to small and marginal farmer families across India. Under this scheme, eligible farmer families receive an annual financial assistance of ₹6,000, disbursed in three equal installments of ₹2,000 every four months. This initiative aims to supplement the income of farmers and support their agricultural and domestic needs.',
    hindiDescription: 'पीएम-किसान योजना भारत भर के छोटे और सीमांत किसान परिवारों को आय सहायता प्रदान करती है। इस योजना के तहत, पात्र किसान परिवारों को ₹6,000 की वार्षिक वित्तीय सहायता मिलती है, जो हर चार महीने में ₹2,000 की तीन बराबर किस्तों में वितरित की जाती है।',
    eligibility: 'Small and marginal farmers with landholding up to 2 hectares',
    hindiEligibility: '2 हेक्टेयर तक की भूमि रखने वाले छोटे और सीमांत किसान',
    benefits: '₹6,000 per year in 3 installments',
    hindiBenefits: '3 किस्तों में प्रति वर्ष ₹6,000',
    status: 'Active',
    applications: 1250,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=400&fit=crop',
    launchDate: '2019-02-01',
    lastUpdated: '2024-01-15',
    documents: [
      'Land Records',
      'Aadhaar Card',
      'Bank Account Details',
      'Mobile Number'
    ],
    process: [
      'Register on PM-KISAN portal',
      'Provide land details and documents',
      'Verification by concerned authorities',
      'Receive direct benefit transfer'
    ],
    hindiProcess: [
      'पीएम-किसान पोर्टल पर पंजीकरण करें',
      'भूमि विवरण और दस्तावेज प्रदान करें',
      'संबंधित अधिकारियों द्वारा सत्यापन',
      'प्रत्यक्ष लाभ हस्तांतरण प्राप्त करें'
    ]
  };

  const keyFeatures = [
    {
      title: 'Scheme Name',
      value: 'PM-KISAN',
      hindiValue: 'पीएम-किसान'
    },
    {
      title: 'Department',
      value: 'Ministry of Agriculture & Farmers Welfare',
      hindiValue: 'कृषि और किसान कल्याण मंत्रालय'
    },
    {
      title: 'Category',
      value: 'Agriculture',
      hindiValue: 'कृषि'
    },
    {
      title: 'Beneficiaries',
      value: 'Small and marginal farmers',
      hindiValue: 'छोटे और सीमांत किसान'
    },
    {
      title: 'Financial Assistance',
      value: '₹6,000 per year',
      hindiValue: 'प्रति वर्ष ₹6,000'
    },
    {
      title: 'Installments',
      value: '3 installments of ₹2,000 each',
      hindiValue: 'प्रत्येक ₹2,000 की 3 किस्तें'
    }
  ];

  const relatedSchemes = [
    {
      id: 2,
      name: 'Pradhan Mantri Fasal Bima Yojana',
      hindiName: 'प्रधानमंत्री फसल बीमा योजना',
      category: 'Agriculture',
      image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=300&h=200&fit=crop'
    },
    {
      id: 3,
      name: 'Soil Health Card Scheme',
      hindiName: 'मृदा स्वास्थ्य कार्ड योजना',
      category: 'Agriculture',
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=300&h=200&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/schemes"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Schemes
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Download className="w-4 h-4" />
                Download PDF
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
              className={`pb-3 text-sm font-medium border-b-2 ${
                activeTab === 'english'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('english')}
            >
              English
            </button>
            <button
              className={`pb-3 text-sm font-medium border-b-2 ${
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Scheme Header */}
            <div className="mb-8">
              <div className="aspect-video w-full rounded-lg bg-cover bg-center mb-6" 
                   style={{ backgroundImage: `url(${scheme.image})` }}>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                  {scheme.category}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{scheme.rating}</span>
                </div>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-medium rounded-full">
                  {scheme.status}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {activeTab === 'english' ? scheme.name : scheme.hindiName}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                {activeTab === 'english' ? scheme.description : scheme.hindiDescription}
              </p>
            </div>

            {/* Key Features */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Key Features</h2>
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                  {keyFeatures.map((feature, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 px-6 py-4">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {feature.title}
                      </dt>
                      <dd className="col-span-2 text-sm text-gray-900 dark:text-white">
                        {activeTab === 'english' ? feature.value : feature.hindiValue}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* Eligibility */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Eligibility Criteria</h2>
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <p className="text-gray-700 dark:text-gray-300">
                  {activeTab === 'english' ? scheme.eligibility : scheme.hindiEligibility}
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Benefits</h2>
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <p className="text-gray-700 dark:text-gray-300">
                  {activeTab === 'english' ? scheme.benefits : scheme.hindiBenefits}
                </p>
              </div>
            </div>

            {/* Application Process */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Application Process</h2>
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <ol className="space-y-4">
                  {(activeTab === 'english' ? scheme.process : scheme.hindiProcess).map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Required Documents */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Required Documents</h2>
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <ul className="space-y-2">
                  {scheme.documents.map((doc, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Apply Now Card */}
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Apply Now</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Ready to apply for this scheme? Click below to start your application.
                </p>
                <button
                  onClick={handleApplyNow}
                  className="w-full bg-primary text-white px-4 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors text-center block mb-4"
                >
                  Start Application
                </button>
                <button className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Save for Later
                </button>
              </div>

              {/* Scheme Stats */}
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Scheme Statistics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Applications</span>
                    <span className="font-medium text-gray-900 dark:text-white">{scheme.applications.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium text-gray-900 dark:text-white">{scheme.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium rounded">
                      {scheme.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Need Help?</h3>
                <div className="space-y-3">
                  <a href="tel:+919876543210" className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                    <Phone className="w-4 h-4" />
                    +91 9876543210
                  </a>
                  <a href="mailto:info@egrampanchayat.gov.in" className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                    <Mail className="w-4 h-4" />
                    info@egrampanchayat.gov.in
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Schemes */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Schemes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedSchemes.map((relatedScheme) => (
              <Link
                key={relatedScheme.id}
                to={`/schemes/${relatedScheme.id}`}
                className="group block bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="aspect-video w-full bg-cover bg-center" style={{ backgroundImage: `url(${relatedScheme.image})` }}></div>
                <div className="p-6">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded mb-2 inline-block">
                    {relatedScheme.category}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                    {relatedScheme.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {relatedScheme.hindiName}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemeDetailPage;