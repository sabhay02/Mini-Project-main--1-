import mongoose from 'mongoose';

// Helper function to generate a unique ID portion (safer than relying on count)
function generateUniqueIdPortion(prefix) {
    const timestamp = Date.now().toString(36).slice(-4); // Last 4 chars of timestamp
    const randomPart = Math.random().toString(36).substring(2, 6); // 4 random chars
    return `${prefix}-${timestamp}${randomPart}`.toUpperCase();
}

const grievanceSchema = new mongoose.Schema({
  grievanceId: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please specify grievance category'],
    enum: [
      'water_supply',
      'electricity',
      'road_repair',
      'street_lights',
      'drainage',
      'garbage_collection',
      'healthcare',
      'education',
      'corruption',
      'other'
    ]
  },
  subCategory: String,
  title: {
    type: String,
    required: [true, 'Please provide grievance title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide detailed description'],
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed', 'rejected'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  severity: {
    type: String,
    enum: ['minor', 'moderate', 'severe', 'critical'],
    default: 'moderate'
  },
  location: {
    address: String,
    village: String,
    district: String,
    state: String,
    pincode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedDepartment: {
    type: String,
    enum: [
      'public_works',
      'water_supply',
      'electricity',
      'health',
      'education',
      'sanitation',
      'administration',
      'other'
    ]
  },
  timeline: [{
    status: String,
    comment: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    attachments: [String]
  }],
  resolution: {
    description: String,
    actions: [String],
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: Date,
    verificationRequired: {
      type: Boolean,
      default: false
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    }
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date
  },
  estimatedResolutionTime: {
    type: Number, // in days
    default: 7
  },
  actualResolutionTime: Number, // in days
  submissionDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  resolutionDate: Date,
  isPublic: {
    type: Boolean,
    default: false
  },
  anonymous: {
    type: Boolean,
    default: false
  },
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'admin', 'phone'],
      default: 'web'
    },
    ipAddress: String,
    userAgent: String
  }
}, {
  timestamps: true
});

// Indexes for better performance
grievanceSchema.index({ user: 1, createdAt: -1 });
grievanceSchema.index({ status: 1 });
grievanceSchema.index({ category: 1 });
grievanceSchema.index({ priority: 1 });
grievanceSchema.index({ grievanceId: 1 });
grievanceSchema.index({ assignedTo: 1 });
grievanceSchema.index({ 'location.village': 1 });
grievanceSchema.index({ 'location.district': 1 });
// Index for full-text search capability
grievanceSchema.index({ title: 'text', description: 'text' }); 

// 🛑 CORRECTION: Replaced prone-to-race-condition pre('save') ID generation 
// with a safer method using a unique random hash.
grievanceSchema.pre('save', function(next) {
  if (this.isNew && !this.grievanceId) {
    // Use the safer ID generation utility
    this.grievanceId = generateUniqueIdPortion('GRV');
  }
  next();
});

// Update lastUpdated on save
grievanceSchema.pre('save', function(next) {
    // Only update if it's a modification, not just if the ID was set above
    if (this.isModified()) {
        this.lastUpdated = new Date();
    }
    next();
});

// Virtual for status display
grievanceSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'open': 'Open',
    'in_progress': 'In Progress',
    'resolved': 'Resolved',
    'closed': 'Closed',
    'rejected': 'Rejected'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for priority display
grievanceSchema.virtual('priorityDisplay').get(function() {
  const priorityMap = {
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
    'urgent': 'Urgent'
  };
  return priorityMap[this.priority] || this.priority;
});

// Virtual for resolution time remaining
grievanceSchema.virtual('resolutionTimeRemaining').get(function() {
  if (this.status === 'resolved' || this.status === 'closed') {
    return 0;
  }
  
  const daysSinceSubmission = Math.floor(
    (new Date().getTime() - this.submissionDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return Math.max(0, this.estimatedResolutionTime - daysSinceSubmission);
});

// Method to add timeline update
grievanceSchema.methods.addTimelineUpdate = function(status, comment, updatedBy, attachments = []) {
  this.timeline.push({
    status,
    comment,
    updatedBy,
    timestamp: new Date(),
    attachments
  });
  
  this.status = status;
  
  if (status === 'resolved') {
    this.resolutionDate = new Date();
    this.actualResolutionTime = Math.floor(
      (this.resolutionDate.getTime() - this.submissionDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  }
};

// Method to set resolution
grievanceSchema.methods.setResolution = function(description, actions, completedBy) {
  this.resolution = {
    description,
    actions,
    completedBy,
    completedAt: new Date(),
    verificationRequired: this.priority === 'high' || this.severity === 'critical'
  };
  
  this.status = 'resolved';
  this.resolutionDate = new Date();
  this.actualResolutionTime = Math.floor(
    (this.resolutionDate.getTime() - this.submissionDate.getTime()) / (1000 * 60 * 60 * 24)
  );
};

// Method to add feedback
grievanceSchema.methods.addFeedback = function(rating, comment) {
  this.feedback = {
    rating,
    comment,
    submittedAt: new Date()
  };
  
  if (rating >= 4) {
    this.status = 'closed';
  }
};

export default mongoose.model('Grievance', grievanceSchema);