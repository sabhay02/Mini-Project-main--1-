const mongoose = require('mongoose');

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

// Generate unique grievance ID
grievanceSchema.pre('save', async function(next) {
  if (!this.grievanceId) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.grievanceId = `GRV${year}${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Update lastUpdated on save
grievanceSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
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
    (new Date() - this.submissionDate) / (1000 * 60 * 60 * 24)
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
      (this.resolutionDate - this.submissionDate) / (1000 * 60 * 60 * 24)
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
    (this.resolutionDate - this.submissionDate) / (1000 * 60 * 60 * 24)
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

module.exports = mongoose.model('Grievance', grievanceSchema);
