import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { 
  Megaphone, 
  Calendar, 
  Clock, 
  User, 
  Eye, 
  Filter,
  Search,
  Bell,
  BellOff,
  Star,
  Share2,
  Download,
  Tag,
  MapPin,
  AlertCircle,
  Info,
  CheckCircle
} from 'lucide-react';

const AnnouncementsPage = () => {
  const { announcements, fetchAnnouncements, loading } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    fetchAnnouncements().catch(error => {
      console.error('Error fetching announcements:', error);
      // Error is already handled in AppContext, no need to show additional error
    });
  }, [fetchAnnouncements]);

  // Use API data if available, otherwise use mock data
  const mockAnnouncements = [
    {
      id: 1,
      title: 'Water Supply Maintenance Notice',
      hindiTitle: 'जल आपूर्ति रखरखाव सूचना',
      content: 'Water supply will be temporarily suspended in Sector 5 on January 20th, 2024 from 9:00 AM to 3:00 PM for maintenance work. Residents are advised to store water in advance.',
      hindiContent: 'सामान्य रखरखाव कार्य के लिए 20 जनवरी, 2024 को सुबह 9:00 बजे से दोपहर 3:00 बजे तक सेक्टर 5 में जल आपूर्ति अस्थायी रूप से निलंबित होगी। निवासियों को पहले से पानी जमा करने की सलाह दी जाती है।',
      category: 'Maintenance',
      priority: 'high',
      publishedDate: '2024-01-15',
      expiryDate: '2024-01-25',
      author: 'Water Supply Department',
      views: 1250,
      isPinned: true,
      tags: ['water', 'maintenance', 'sector-5'],
      location: 'Sector 5, Village Area'
    },
    {
      id: 2,
      title: 'New Property Tax Collection Schedule',
      hindiTitle: 'नई संपत्ति कर संग्रह कार्यक्रम',
      content: 'The new property tax collection schedule for 2024-25 is now available. Tax collection will begin from February 1st, 2024. Online payment options are available through our portal.',
      hindiContent: '2024-25 के लिए नया संपत्ति कर संग्रह कार्यक्रम अब उपलब्ध है। कर संग्रह 1 फरवरी, 2024 से शुरू होगा। हमारे पोर्टल के माध्यम से ऑनलाइन भुगतान विकल्प उपलब्ध हैं।',
      category: 'Tax',
      priority: 'medium',
      publishedDate: '2024-01-14',
      expiryDate: '2024-02-15',
      author: 'Tax Department',
      views: 890,
      isPinned: false,
      tags: ['tax', 'property', 'payment'],
      location: 'All Areas'
    },
    {
      id: 3,
      title: 'Community Health Camp',
      hindiTitle: 'सामुदायिक स्वास्थ्य शिविर',
      content: 'Free health check-up camp will be organized at Community Center on January 22nd, 2024 from 8:00 AM to 4:00 PM. All residents are welcome to attend.',
      hindiContent: '22 जनवरी, 2024 को सुबह 8:00 बजे से शाम 4:00 बजे तक सामुदायिक केंद्र में निःशुल्क स्वास्थ्य जांच शिविर आयोजित किया जाएगा। सभी निवासी आमंत्रित हैं।',
      category: 'Health',
      priority: 'medium',
      publishedDate: '2024-01-13',
      expiryDate: '2024-01-23',
      author: 'Health Department',
      views: 567,
      isPinned: false,
      tags: ['health', 'camp', 'free'],
      location: 'Community Center'
    },
    {
      id: 4,
      title: 'Road Construction Update',
      hindiTitle: 'सड़क निर्माण अपडेट',
      content: 'Road construction work on Main Street is progressing well. Expected completion date is March 15th, 2024. Traffic diversions are in place. Please follow the signage.',
      hindiContent: 'मुख्य सड़क पर सड़क निर्माण कार्य अच्छी प्रगति पर है। अपेक्षित पूरा होने की तारीख 15 मार्च, 2024 है। यातायात मोड़ लगे हैं। कृपया साइनेज का पालन करें।',
      category: 'Infrastructure',
      priority: 'low',
      publishedDate: '2024-01-12',
      expiryDate: '2024-03-20',
      author: 'Public Works Department',
      views: 423,
      isPinned: false,
      tags: ['road', 'construction', 'traffic'],
      location: 'Main Street'
    },
    {
      id: 5,
      title: 'Garbage Collection Schedule Change',
      hindiTitle: 'कचरा संग्रह कार्यक्रम परिवर्तन',
      content: 'Due to upcoming festival, garbage collection schedule has been updated. Collection will be on Monday, Wednesday, and Friday instead of daily collection.',
      hindiContent: 'आगामी त्योहार के कारण, कचरा संग्रह कार्यक्रम अपडेट किया गया है। दैनिक संग्रह के बजाय सोमवार, बुधवार और शुक्रवार को संग्रह होगा।',
      category: 'Sanitation',
      priority: 'medium',
      publishedDate: '2024-01-11',
      expiryDate: '2024-02-01',
      author: 'Sanitation Department',
      views: 678,
      isPinned: false,
      tags: ['garbage', 'collection', 'schedule'],
      location: 'All Areas'
    }
  ];

  const categories = [
    { name: 'Maintenance', icon: '🔧', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    { name: 'Tax', icon: '💰', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    { name: 'Health', icon: '🏥', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
    { name: 'Infrastructure', icon: '🏗️', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
    { name: 'Sanitation', icon: '🧹', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' }
  ];

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

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-4 h-4" />;
      case 'medium':
        return <Info className="w-4 h-4" />;
      case 'low':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const announcementsData = announcements && Array.isArray(announcements) && announcements.length > 0 ? announcements : mockAnnouncements;

  const filteredAnnouncements = announcementsData.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || announcement.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || announcement.priority === priorityFilter;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const pinnedAnnouncements = filteredAnnouncements.filter(a => a.isPinned || a.pinned);
  const regularAnnouncements = filteredAnnouncements.filter(a => !a.isPinned && !a.pinned);

  // Remove loading spinner - let the page render with mock data while API loads

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Announcements</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Stay updated with the latest news and important notices
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Bell className="w-4 h-4" />
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search announcements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.name} value={category.name}>{category.name}</option>
                ))}
              </select>
              
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pinned Announcements */}
        {pinnedAnnouncements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Pinned Announcements
            </h2>
            <div className="space-y-4">
              {pinnedAnnouncements.map((announcement) => (
                <div key={announcement.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{announcement.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(announcement.priority)} flex items-center gap-1`}>
                          {getPriorityIcon(announcement.priority)}
                          {announcement.priority.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-medium rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          PINNED
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">{announcement.content}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {announcement.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(announcement.publishedDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {announcement.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {announcement.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {announcement.views} views
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Announcements */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" />
            All Announcements
          </h2>
          <div className="space-y-6">
            {regularAnnouncements.map((announcement) => (
              <div key={announcement.id} className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{announcement.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(announcement.priority)} flex items-center gap-1`}>
                        {getPriorityIcon(announcement.priority)}
                        {announcement.priority.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        categories.find(c => c.name === announcement.category)?.color || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                      }`}>
                        {categories.find(c => c.name === announcement.category)?.icon} {announcement.category}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">{announcement.content}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {announcement.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(announcement.publishedDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {announcement.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {announcement.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {announcement.views} views
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Expires: {new Date(announcement.expiryDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAnnouncements.length === 0 && (
            <div className="text-center py-12">
              <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No announcements found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsPage;