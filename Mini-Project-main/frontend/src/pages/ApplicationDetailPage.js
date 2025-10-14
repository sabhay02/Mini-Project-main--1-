import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  XCircle,
  Eye,
  Download,
  Share2,
  Edit,
  MessageSquare,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

const ApplicationDetailPage = () => {
  const { id } = useParams();
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState('');

  // Mock application data - in real app, this would come from API
  const application = {
    id: 'APP-2024-001',
    type: 'Water Connection',
    title: 'New Water Connection Application',
    description: 'Request for new water connection at residential property located at 123 Main Street, Sector 5. The property is ready for connection and all necessary documents have been submitted.',
    hindiDescription: '123 मुख्य सड़क, सेक्टर 5 में स्थित आवासीय संपत्ति में नए जल कनेक्शन के लिए अनुरोध। संपत्ति कनेक्शन के लिए तैयार है और सभी आवश्यक दस्तावेज जमा किए गए हैं।',
    status: 'approved',
    priority: 'medium',
    submittedDate: '2024-01-15T10:30:00Z',
    lastUpdated: '2024-01-18T14:20:00Z',
    estimatedCompletion: '2024-01-25T17:00:00Z',
    applicant: {
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@email.com',
      phone: '+91 9876543210',
      address: '123 Main Street, Sector 5, Village Area'
    },
    assignedTo: {
      name: 'Water Supply Department',
      officer: 'Priya Sharma',
      phone: '+91 9876543211',
      email: 'priya.sharma@panchayat.gov.in'
    },
    location: {
      address: '123 Main Street, Sector 5, Village Area',
      coordinates: '28.6139, 77.2090',
      landmark: 'Near Government School'
    },
    documents: [
      {
        id: 1,
        name: 'Property_Deed.pdf',
        type: 'document',
        size: '2.1 MB',
        status: 'verified'
      },
      {
        id: 2,
        name: 'Identity_Proof.pdf',
        type: 'document',
        size: '1.5 MB',
        status: 'verified'
      },
      {
        id: 3,
        name: 'Address_Proof.pdf',
        type: 'document',
        size: '1.8 MB',
        status: 'pending'
      }
    ],
    timeline: [
      {
        id: 1,
        status: 'submitted',
        title: 'Application Submitted',
        description: 'Application was submitted by the applicant',
        date: '2024-01-15T10:30:00Z',
        user: 'Rajesh Kumar'
      },
      {
        id: 2,
        status: 'acknowledged',
        title: 'Application Acknowledged',
        description: 'Application has been acknowledged and assigned to Water Supply Department',
        date: '2024-01-15T16:45:00Z',
        user: 'System'
      },
      {
        id: 3,
        status: 'in-progress',
        title: 'Document Verification',
        description: 'Documents are being verified by the concerned department',
        date: '2024-01-16T09:15:00Z',
        user: 'Priya Sharma'
      },
      {
        id: 4,
        status: 'approved',
        title: 'Application Approved',
        description: 'Application has been approved. Connection work will begin soon.',
        date: '2024-01-18T14:20:00Z',
        user: 'Priya Sharma'
      }
    ],
    comments: [
      {
        id: 1,
        user: 'Priya Sharma',
        role: 'Officer',
        comment: 'Documents look good. Site inspection scheduled for tomorrow.',
        date: '2024-01-16T09:15:00Z',
        isOfficial: true
      },
      {
        id: 2,
        user: 'Rajesh Kumar',
        role: 'Applicant',
        comment: 'Thank you for the quick processing. Looking forward to the connection.',
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
      case 'approved':
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
      case 'approved':
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

  const getDocumentStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
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
                to="/applications"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Applications
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
            {/* Application Header */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{application.title}</h1>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(application.priority)}`}>
                      {application.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Application ID: {application.id}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(application.status)}`}>
                  {getStatusIcon(application.status)}
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Submitted: {new Date(application.submittedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Last Updated: {new Date(application.lastUpdated).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Type: {application.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Location: {application.location.address}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Description</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {application.description}
              </p>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">हिंदी में वर्णन</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                  {application.hindiDescription}
                </p>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Submitted Documents</h2>
              <div className="space-y-3">
                {application.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{doc.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{doc.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDocumentStatusColor(doc.status)}`}>
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button className="text-primary hover:text-primary/80 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-primary hover:text-primary/80 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Application Timeline</h2>
              <div className="space-y-4">
                {application.timeline.map((event, index) => (
                  <div key={event.id} className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        event.status === 'submitted' ? 'bg-gray-100 dark:bg-gray-800' :
                        event.status === 'acknowledged' ? 'bg-blue-100 dark:bg-blue-900' :
                        event.status === 'in-progress' ? 'bg-yellow-100 dark:bg-yellow-900' :
                        event.status === 'approved' ? 'bg-green-100 dark:bg-green-900' :
                        'bg-red-100 dark:bg-red-900'
                      }`}>
                        {getStatusIcon(event.status)}
                      </div>
                      {index < application.timeline.length - 1 && (
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
                {application.comments.map((comment) => (
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
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(comment.date).toLocaleDateString()}
                      </p>
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
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Applicant</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-900 dark:text-white">{application.applicant.name}</p>
                      <p className="text-gray-600 dark:text-gray-400">{application.applicant.email}</p>
                      <p className="text-gray-600 dark:text-gray-400">{application.applicant.phone}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assigned To</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-900 dark:text-white">{application.assignedTo.name}</p>
                      <p className="text-gray-600 dark:text-gray-400">Officer: {application.assignedTo.officer}</p>
                      <p className="text-gray-600 dark:text-gray-400">{application.assignedTo.email}</p>
                      <p className="text-gray-600 dark:text-gray-400">{application.assignedTo.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Location Details</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700 dark:text-gray-300">{application.location.address}</p>
                  <p className="text-gray-600 dark:text-gray-400">Landmark: {application.location.landmark}</p>
                  <p className="text-gray-600 dark:text-gray-400">Coordinates: {application.location.coordinates}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                    Edit Application
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

export default ApplicationDetailPage;