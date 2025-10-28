import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  MapPin,
  FileText,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  Download,
  Share2,
  Edit,
  Paperclip,
  Send
} from 'lucide-react';

const GrievanceDetailPage = ({ grievanceId }) => {
  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchGrievanceDetail();
  }, [grievanceId]);

  const fetchGrievanceDetail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to view grievance details');
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`/api/grievances/${grievanceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setGrievance(data.data.grievance);
      } else {
        alert('Failed to load grievance details');
      }
    } catch (error) {
      console.error('Error fetching grievance:', error);
      alert('Failed to load grievance details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    setSubmittingComment(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/grievances/${grievanceId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          comment: newComment
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setNewComment('');
        setShowCommentForm(false);
        fetchGrievanceDetail(); // Refresh to get new comment
        alert('Comment added successfully');
      } else {
        alert(data.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <FileText className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading grievance details...</p>
        </div>
      </div>
    );
  }

  if (!grievance) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Grievance not found</p>
          <button
            onClick={() => window.location.href = '/grievances'}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Grievances
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.location.href = '/grievances'}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Grievances
            </button>
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
          <div className="lg:col-span-2">
            {/* Grievance Header */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{grievance.title}</h1>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(grievance.priority)}`}>
                      {grievance.priority?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Grievance ID: {grievance.grievanceId}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(grievance.status)}`}>
                  {getStatusIcon(grievance.status)}
                  {grievance.status?.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Submitted: {new Date(grievance.submissionDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Last Updated: {new Date(grievance.lastUpdated).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Category: {grievance.category?.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Location: {grievance.location?.address}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Description</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {grievance.description}
              </p>
            </div>

            {/* Location Details */}
            {grievance.location && (
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Location Details</h2>
                <div className="space-y-2 text-sm">
                  {grievance.location.address && (
                    <p className="text-gray-700 dark:text-gray-300">Address: {grievance.location.address}</p>
                  )}
                  {grievance.location.village && (
                    <p className="text-gray-600 dark:text-gray-400">Village: {grievance.location.village}</p>
                  )}
                  {grievance.location.district && (
                    <p className="text-gray-600 dark:text-gray-400">District: {grievance.location.district}</p>
                  )}
                  {grievance.location.state && (
                    <p className="text-gray-600 dark:text-gray-400">State: {grievance.location.state}</p>
                  )}
                  {grievance.location.pincode && (
                    <p className="text-gray-600 dark:text-gray-400">Pincode: {grievance.location.pincode}</p>
                  )}
                </div>
              </div>
            )}

            {/* Attachments */}
            {grievance.attachments && grievance.attachments.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Attachments</h2>
                <div className="space-y-3">
                  {grievance.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Paperclip className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{attachment.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {attachment.size ? `${(attachment.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {attachment.url && (
                          <>
                            <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">
                              <Eye className="w-4 h-4" />
                            </a>
                            <a href={attachment.url} download className="text-blue-600 hover:text-blue-800 transition-colors">
                              <Download className="w-4 h-4" />
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            {grievance.timeline && grievance.timeline.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Timeline</h2>
                <div className="space-y-4">
                  {grievance.timeline.map((event, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(event.status)}`}>
                          {getStatusIcon(event.status)}
                        </div>
                        {index < grievance.timeline.length - 1 && (
                          <div className="w-0.5 h-8 bg-gray-200 dark:bg-gray-700 ml-4"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {event.status?.replace('_', ' ')}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.comment}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{new Date(event.timestamp).toLocaleString()}</span>
                          {event.updatedBy && (
                            <span>by {event.updatedBy.name || 'System'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Comments</h2>
                <button
                  onClick={() => setShowCommentForm(!showCommentForm)}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
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
                      disabled={submittingComment}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {submittingComment ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Post Comment
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>Comments feature coming soon</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Contact Information */}
              {grievance.user && (
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Submitted By</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-900 dark:text-white">{grievance.user.name}</p>
                    <p className="text-gray-600 dark:text-gray-400">{grievance.user.email}</p>
                    {grievance.user.phone && (
                      <p className="text-gray-600 dark:text-gray-400">{grievance.user.phone}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Assigned To */}
              {grievance.assignedTo && (
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Assigned To</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-900 dark:text-white">{grievance.assignedTo.name}</p>
                    <p className="text-gray-600 dark:text-gray-400">{grievance.assignedTo.email}</p>
                    {grievance.assignedTo.phone && (
                      <p className="text-gray-600 dark:text-gray-400">{grievance.assignedTo.phone}</p>
                    )}
                    {grievance.assignedDepartment && (
                      <p className="text-gray-600 dark:text-gray-400">
                        Dept: {grievance.assignedDepartment.replace('_', ' ')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Resolution Info */}
              {grievance.resolution && (
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Resolution</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700 dark:text-gray-300">{grievance.resolution.description}</p>
                    {grievance.resolution.actions && grievance.resolution.actions.length > 0 && (
                      <div className="mt-3">
                        <p className="font-medium text-gray-900 dark:text-white mb-2">Actions Taken:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                          {grievance.resolution.actions.map((action, index) => (
                            <li key={index}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {grievance.resolution.completedAt && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Completed: {new Date(grievance.resolution.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrievanceDetailPage;