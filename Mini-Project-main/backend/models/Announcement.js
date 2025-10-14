const mongoose = require('mongoose');

// Helper function to generate a unique ID portion (safer than relying on count)
function generateUniqueIdPortion(prefix) {
    const timestamp = Date.now().toString(36).slice(-5); // Last 5 chars of timestamp
    const randomPart = Math.random().toString(36).substring(2, 6); // 4 random chars
    return `${prefix}-${timestamp}${randomPart}`.toUpperCase();
}

const announcementSchema = new mongoose.Schema({
  announcementId: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide announcement title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  titleHindi: {
    type: String,
    trim: true,
    maxlength: [200, 'Title in Hindi cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide announcement content'],
    trim: true,
    maxlength: [5000, 'Content cannot be more than 5000 characters']
  },
  contentHindi: {
    type: String,
    trim: true,
    maxlength: [5000, 'Content in Hindi cannot be more than 5000 characters']
  },
  type: {
    type: String,
    required: [true, 'Please specify announcement type'],
    enum: [
      'general',
      'scheme_launch',
      'deadline_reminder',
      'policy_update',
      'event_notification',
      'emergency',
      'maintenance',
      'holiday',
      'other'
    ]
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: [
      'schemes',
      'services',
      'events',
      'deadlines',
      'maintenance',
      'policy',
      'emergency',
      'general'
    ],
    default: 'general'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'citizens', 'staff', 'specific_group'],
    default: 'all'
  },
  specificGroups: [String], // For targetAudience: 'specific_group'
  locations: {
    states: [String],
    districts: [String],
    villages: [String]
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number
  }],
  image: String,
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'expired'],
    default: 'draft'
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  pinned: {
    type: Boolean,
    default: false
  },
  tags: [String],
  language: {
    type: String,
    enum: ['en', 'hi', 'both'],
    default: 'both'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvalComments: String,
  views: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  engagement: {
    likes: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    }
  },
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'admin'],
      default: 'web'
    },
    ipAddress: String,
    userAgent: String,
    version: {
      type: Number,
      default: 1
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
announcementSchema.index({ title: 'text', content: 'text', titleHindi: 'text', contentHindi: 'text' });
announcementSchema.index({ type: 1 });
announcementSchema.index({ priority: 1 });
announcementSchema.index({ category: 1 });
announcementSchema.index({ status: 1 });
announcementSchema.index({ publishDate: -1 });
announcementSchema.index({ featured: 1, pinned: 1 });
announcementSchema.index({ isActive: 1 });
announcementSchema.index({ tags: 1 });
announcementSchema.index({ author: 1 });

// 🌟 CORRECTION 1: Replace vulnerable ID generation with safer method
announcementSchema.pre('save', function(next) {
  if (this.isNew && !this.announcementId) {
    this.announcementId = generateUniqueIdPortion('ANN');
  }
  
  // 🌟 CORRECTION 2: Automatically set publishDate if status is changing to 'published'
  if (this.isModified('status') && this.status === 'published' && !this.publishDate) {
      this.publishDate = new Date();
      this.approvalStatus = 'approved'; // Assumes publishing implies approval
  }
  
  next();
});

// Virtual for type display
announcementSchema.virtual('typeDisplay').get(function() {
  const typeMap = {
    'general': 'General',
    'scheme_launch': 'Scheme Launch',
    'deadline_reminder': 'Deadline Reminder',
    'policy_update': 'Policy Update',
    'event_notification': 'Event Notification',
    'emergency': 'Emergency',
    'maintenance': 'Maintenance',
    'holiday': 'Holiday',
    'other': 'Other'
  };
  return typeMap[this.type] || this.type;
});

// Virtual for priority display
announcementSchema.virtual('priorityDisplay').get(function() {
  const priorityMap = {
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
    'urgent': 'Urgent'
  };
  return priorityMap[this.priority] || this.priority;
});

// Virtual for category display
announcementSchema.virtual('categoryDisplay').get(function() {
  const categoryMap = {
    'schemes': 'Schemes',
    'services': 'Services',
    'events': 'Events',
    'deadlines': 'Deadlines',
    'maintenance': 'Maintenance',
    'policy': 'Policy',
    'emergency': 'Emergency',
    'general': 'General'
  };
  return categoryMap[this.category] || this.category;
});

// Virtual for status display
announcementSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'draft': 'Draft',
    'published': 'Published',
    'archived': 'Archived',
    'expired': 'Expired'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for time since publication
announcementSchema.virtual('timeSincePublication').get(function() {
  if (!this.publishDate) return null;
  
  const now = new Date().getTime();
  const diffMs = now - this.publishDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
});

// Virtual to check if announcement is expired
announcementSchema.virtual('isExpired').get(function() {
  if (!this.expiryDate) return false;
  return new Date().getTime() > this.expiryDate.getTime();
});

// Method to increment views
announcementSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to increment shares
announcementSchema.methods.incrementShares = function() {
  this.shares += 1;
  return this.save();
};

// Method to increment engagement
announcementSchema.methods.incrementEngagement = function(type) {
  if (type === 'like') {
    this.engagement.likes += 1;
  } else if (type === 'comment') {
    this.engagement.comments += 1;
  }
  return this.save();
};

// Method to publish announcement
announcementSchema.methods.publish = function() {
  this.status = 'published';
  // Only update publishDate if it hasn't been set, or is currently in the future (scheduled publish logic)
  if (!this.publishDate || this.publishDate.getTime() > new Date().getTime()) {
      this.publishDate = new Date();
  }
  this.approvalStatus = 'approved';
  this.isActive = true;
};

// Method to archive announcement
announcementSchema.methods.archive = function() {
  this.status = 'archived';
  this.isActive = false;
};

// Static method to get featured announcements
announcementSchema.statics.getFeatured = function(limit = 5) {
  return this.find({
    status: 'published',
    isActive: true,
    featured: true,
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gt: new Date() } }
    ]
  })
  .sort({ priority: -1, publishDate: -1 })
  .limit(limit);
};

// Static method to get recent announcements
announcementSchema.statics.getRecent = function(limit = 10, category = null) {
  const query = {
    status: 'published',
    isActive: true,
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gt: new Date() } }
    ]
  };
  
  if (category) {
    query.category = category;
  }
  
  return this.find(query)
  .sort({ pinned: -1, priority: -1, publishDate: -1 })
  .limit(limit);
};

module.exports = mongoose.model('Announcement', announcementSchema);