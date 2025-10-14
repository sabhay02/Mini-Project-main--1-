import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  FileText,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  Download,
  Share2,
  Edit,
  Trash2,
  Camera,
  Paperclip,
  Send,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

const GrievanceDetailPage = () => {
  const { id } = useParams();
  const [newComment, setNewComment] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);

  // Mock grievance data - in real app, this would come from API
  const grievance = {
    id: 'GRV-2024-001',
    title: 'Road Maintenance Request',
    description: 'There are several potholes on the main road near the school that are causing traffic issues and safety concerns. The potholes have been there for over a month and are getting worse with each passing day. This is particularly dangerous for school children and elderly residents who use this road regularly.',
    hindiDescription: 'स्कूल के पास मुख्य सड़क पर कई गड्ढे हैं जो यातायात की समस्याओं और सुरक्षा चिंताओं का कारण बन रहे हैं। ये गड्ढे एक महीने से अधिक समय से हैं और हर गुजरते दिन के साथ बदतर होते जा रहे हैं। यह विशेष रूप से स्कूली बच्चों और बुजुर्ग निवासियों के लिए खतरनाक है जो इस सड़क का नियमित रूप से उपयोग करते हैं।',
    category: 'Infrastructure',
    subcategory: 'Road Maintenance',
    priority: 'high',
    status: 'in-progress',
    submittedDate: '2024-01-15T10:30:00Z',
    lastUpdated: '2024-01-17T14:20:00Z',
    estimatedResolution: '2024-01-25T17:00:00Z',
    complainant: {
      name: 'Vikram Singh',
      email: 'vikram.singh@email.com',
      phone: '+91 9876543210',
      address: '123 Main Street, Sector 5, Village Area'
    },
    assignedTo: {
      name: 'Road Maintenance Department',
      officer: 'Rajesh Kumar',
      phone: '+91 9876543211',
      email: 'rajesh.kumar@panchayat.gov.in'
    },
    location: {
      address: 'Main Road, Near Government School, Sector 5',
      coordinates: '28.6139, 77.2090',
      landmark: 'Government School'
    },
    attachments: [
      {
        id: 1,
        name: 'pothole_photo_1.jpg',
        type: 'image',
        size: '2.5 MB',
        url: '#'
      },
      {
        id: 2,
        name: 'road_condition_report.pdf',
        type: 'document',
        size: '1.2 MB',
        url: '#'
      }
    ],
    timeline: [
      {
        id: 1,
        status: 'submitted',
        title: 'Grievance Submitted',
        description: 'Grievance was submitted by the complainant',
        date: '2024-01-15T10:30:00Z',
        user: 'Vikram Singh'
      },
      {
        id: 2,
        status: 'acknowledged',
        title: 'Grievance Acknowledged',
        description: 'Grievance has been acknowledged and assigned to Road Maintenance Department',
        date: '2024-01-15T16:45:00Z',
        user: 'System'
      },
      {
        id: 3,
        status: 'in-progress',
        title: 'Work Started',
        description: 'Road maintenance work has been started. Materials are being arranged.',
        date: '2024-01-17T14:20:00Z',
        user: 'Rajesh Kumar'
      }
    ],
    comments: [
      {
        id: 1,
        user: 'Rajesh Kumar',
        role: 'Officer',
        comment: 'We have inspected the site and identified the potholes. Work will begin within 2 days.',
        date: '2024-01-16T09:15:00Z',
        isOfficial: true
      },
      {
        id: 2,
        user: 'Vikram Singh',
        role: 'Complainant',
        comment: 'Thank you for the quick response. Looking forward to the resolution.',
        date: '2024-01-16T11:30:00Z',
        isOfficial: false
      }
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'acknowledged':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
        return <FileText className="w-4 h-4" />;
      case 'acknowledged':
        return <CheckCircle className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
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

  const handleAddComment = () => {
    if (newComment.trim()) {
      // Here you would typically make an API call to add the comment
      console.log('Adding comment:', newComment);
      setNewComment('');
      setShowCommentForm(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/grievances"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Grievances
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Grievance Header */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{grievance.title}</h1>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(grievance.priority)}`}>
                      {grievance.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Grievance ID: {grievance.id}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(grievance.status)}`}>
                  {getStatusIcon(grievance.status)}
                  {grievance.status.charAt(0).toUpperCase() + grievance.status.slice(1).replace('-', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Submitted: {new Date(grievance.submittedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Last Updated: {new Date(grievance.lastUpdated).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Category: {grievance.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Location: {grievance.location.address}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Description</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {grievance.description}
              </p>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">हिंदी में वर्णन</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                  {grievance.hindiDescription}
                </p>
              </div>
            </div>

            {/* Attachments */}
            {grievance.attachments.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Attachments</h2>
                <div className="space-y-3">
                  {grievance.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Paperclip className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{attachment.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{attachment.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-primary hover:text-primary/80 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-primary hover:text-primary/80 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Timeline</h2>
              <div className="space-y-4">
                {grievance.timeline.map((event, index) => (
                  <div key={event.id} className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        event.status === 'submitted' ? 'bg-gray-100 dark:bg-gray-800' :
                        event.status === 'acknowledged' ? 'bg-blue-100 dark:bg-blue-900' :
                        event.status === 'in-progress' ? 'bg-yellow-100 dark:bg-yellow-900' :
                        event.status === 'resolved' ? 'bg-green-100 dark:bg-green-900' :
                        'bg-red-100 dark:bg-red-900'
                      }`}>
                        {getStatusIcon(event.status)}
                      </div>
                      {index < grievance.timeline.length - 1 && (
                        <div className="w-0.5 h-8 bg-gray-200 dark:bg-gray-700 ml-4"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">{event.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                        <span>by {event.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Comments</h2>
                <button
                  onClick={() => setShowCommentForm(!showCommentForm)}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Add Comment
                </button>
              </div>

              {showCommentForm && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add your comment..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary mb-3"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowCommentForm(false)}
                      className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddComment}
                      className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {grievance.comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      comment.isOfficial 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{comment.user}</h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{comment.role}</span>
                        {comment.isOfficial && (
                          <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                            Official
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{comment.comment}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>{new Date(comment.date).toLocaleDateString()}</span>
                        <button className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Contact Information */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Complainant</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-900 dark:text-white">{grievance.complainant.name}</p>
                      <p className="text-gray-600 dark:text-gray-400">{grievance.complainant.email}</p>
                      <p className="text-gray-600 dark:text-gray-400">{grievance.complainant.phone}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assigned To</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-900 dark:text-white">{grievance.assignedTo.name}</p>
                      <p className="text-gray-600 dark:text-gray-400">Officer: {grievance.assignedTo.officer}</p>
                      <p className="text-gray-600 dark:text-gray-400">{grievance.assignedTo.email}</p>
                      <p className="text-gray-600 dark:text-gray-400">{grievance.assignedTo.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Location Details</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700 dark:text-gray-300">{grievance.location.address}</p>
                  <p className="text-gray-600 dark:text-gray-400">Landmark: {grievance.location.landmark}</p>
                  <p className="text-gray-600 dark:text-gray-400">Coordinates: {grievance.location.coordinates}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                    Edit Grievance
                  </button>
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrievanceDetailPage;