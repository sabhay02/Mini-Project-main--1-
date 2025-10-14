const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  applicationId: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: [true, 'Please specify application type'],
    trim: true,
    maxlength: [100, 'Application type cannot be more than 100 characters']
  },
  title: {
    type: String,
    required: [true, 'Please provide application title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide application description'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'completed'],
    default: 'draft'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  documents: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  personalDetails: {
    name: String,
    fatherName: String,
    motherName: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'divorced', 'widowed']
    },
    occupation: String,
    income: Number
  },
  addressDetails: {
    currentAddress: {
      village: String,
      district: String,
      state: String,
      pincode: String
    },
    permanentAddress: {
      village: String,
      district: String,
      state: String,
      pincode: String
    }
  },
  contactDetails: {
    phone: String,
    email: String,
    alternatePhone: String
  },
  reviewComments: [{
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comment: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected']
    }
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  estimatedProcessingTime: {
    type: Number, // in days
    default: 15
  },
  actualProcessingTime: Number, // in days
  submissionDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  completionDate: Date,
  fees: {
    amount: {
      type: Number,
      default: 0
    },
    paid: {
      type: Boolean,
      default: false
    },
    paymentId: String,
    paymentDate: Date
  },
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'admin'],
      default: 'web'
    },
    ipAddress: String,
    userAgent: String
  }
}, {
  timestamps: true
});

// Indexes for better performance
applicationSchema.index({ user: 1, createdAt: -1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ type: 1 });
applicationSchema.index({ applicationId: 1 });
applicationSchema.index({ assignedTo: 1 });

// Generate unique application ID
applicationSchema.pre('save', async function(next) {
  if (!this.applicationId) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.applicationId = `APP${year}${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Update lastUpdated on save
applicationSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Virtual for status display
applicationSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'draft': 'Draft',
    'submitted': 'Submitted',
    'under_review': 'Under Review',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'completed': 'Completed'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for processing time remaining
applicationSchema.virtual('processingTimeRemaining').get(function() {
  if (this.status === 'completed' || this.status === 'rejected') {
    return 0;
  }
  
  const daysSinceSubmission = Math.floor(
    (new Date() - this.submissionDate) / (1000 * 60 * 60 * 24)
  );
  
  return Math.max(0, this.estimatedProcessingTime - daysSinceSubmission);
});

// Method to add review comment
applicationSchema.methods.addReviewComment = function(reviewerId, comment, status) {
  this.reviewComments.push({
    reviewer: reviewerId,
    comment,
    status,
    timestamp: new Date()
  });
  
  if (status === 'approved' || status === 'rejected') {
    this.status = status === 'approved' ? 'approved' : 'rejected';
    if (status === 'approved') {
      this.completionDate = new Date();
      this.actualProcessingTime = Math.floor(
        (this.completionDate - this.submissionDate) / (1000 * 60 * 60 * 24)
      );
    }
  }
};

module.exports = mongoose.model('Application', applicationSchema);
