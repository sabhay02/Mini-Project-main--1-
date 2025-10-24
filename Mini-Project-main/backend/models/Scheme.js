// models/Scheme.js
import mongoose from 'mongoose';

// Helper function to generate a unique ID portion
function generateUniqueIdPortion(prefix) {
  const timestamp = Date.now().toString(36).slice(-4);
  const randomPart = Math.random().toString(36).substring(2, 6);
  return `${prefix}-${timestamp}${randomPart}`.toUpperCase();
}

const schemeSchema = new mongoose.Schema({
  schemeId: {
    type: String,
    unique: true,
    required: false // Will be auto-generated
  },
  name: {
    type: String,
    required: [true, 'Please provide scheme name'],
    trim: true,
    maxlength: [200, 'Scheme name cannot be more than 200 characters']
  },
  nameHindi: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide scheme description'],
    trim: true
  },
  descriptionHindi: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please specify category'],
    enum: [
      'agriculture',
      'education',
      'healthcare',
      'housing',
      'employment',
      'women_welfare',
      'senior_citizens',
      'disabled_welfare',
      'social_security',
      'infrastructure',
      'environment',
      'other'
    ]
  },
  subCategory: [String],
  department: {
    type: String,
    required: [true, 'Please specify department'],
    enum: [
      'agriculture',
      'education',
      'health',
      'rural_development',
      'women_child_development',
      'social_justice',
      'labour',
      'housing',
      'finance',
      'other'
    ]
  },
  ministry: {
    type: String,
    required: [true, 'Please specify ministry']
  },
  level: {
    type: String,
    enum: ['central', 'state', 'district', 'village'],
    required: true
  },
  eligibility: {
    ageRange: {
      min: {
        type: Number,
        default: 18
      },
      max: {
        type: Number,
        default: 65
      }
    },
    incomeLimit: {
      type: {
        type: Number,
        default: 0
      },
      description: {
        type: String,
        trim: true,
        default: ''
      }
    },
    gender: {
      type: String,
      enum: ['all', 'male', 'female', 'other'],
      default: 'all'
    },
    categories: [String],
    location: {
      states: [String],
      districts: [String],
      villages: [String]
    },
    documents: [String],
    education: [String],
    other: [String]
  },
  benefits: {
    type: {
      type: String,
      enum: ['monetary', 'non_monetary', 'both'],
      required: true
    },
    amount: {
      min: {
        type: Number,
        default: 0
      },
      max: {
        type: Number,
        default: 0
      },
      currency: {
        type: String,
        default: 'INR'
      }
    },
    description: {
      type: String,
      trim: true
    },
    frequency: {
      type: String,
      enum: ['one_time', 'monthly', 'quarterly', 'yearly', 'other'],
      default: 'one_time'
    }
  },
  applicationProcess: {
    online: {
      available: {
        type: Boolean,
        default: true
      },
      portal: String,
      steps: [String]
    },
    offline: {
      available: {
        type: Boolean,
        default: true
      },
      offices: [String],
      steps: [String]
    },
    documents: [String],
    fees: {
      amount: {
        type: Number,
        default: 0
      },
      currency: {
        type: String,
        default: 'INR'
      },
      description: String
    },
    processingTime: {
      days: {
        type: Number,
        default: 7
      },
      description: {
        type: String,
        default: '7 working days'
      }
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'discontinued'],
    default: 'active'
  },
  launchDate: Date,
  endDate: Date,
  contactInfo: {
    helpline: String,
    email: String,
    website: String,
    offices: [String]
  },
  featured: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  image: String,
  tags: [String],
  languages: {
    type: [String],
    default: ['en', 'hi']
  },
  statistics: {
    totalApplications: {
      type: Number,
      default: 0
    },
    approvedApplications: {
      type: Number,
      default: 0
    },
    rejectedApplications: {
      type: Number,
      default: 0
    },
    pendingApplications: {
      type: Number,
      default: 0
    }
  },
  metadata: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    version: {
      type: Number,
      default: 1
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
schemeSchema.index({ schemeId: 1 });
schemeSchema.index({ category: 1, status: 1 });
schemeSchema.index({ department: 1, status: 1 });
schemeSchema.index({ status: 1 });
schemeSchema.index({ featured: 1, status: 1 });
schemeSchema.index({ name: 'text', description: 'text', nameHindi: 'text' });

// Pre-save hook to generate schemeId
schemeSchema.pre('save', async function(next) {
  if (!this.schemeId) {
    // Generate a unique scheme ID
    const prefix = 'SCH';
    this.schemeId = generateUniqueIdPortion(prefix);
    
    // Ensure uniqueness (rare collision check)
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (!isUnique && attempts < maxAttempts) {
      const existing = await mongoose.model('Scheme').findOne({ schemeId: this.schemeId });
      if (!existing) {
        isUnique = true;
      } else {
        this.schemeId = generateUniqueIdPortion(prefix);
        attempts++;
      }
    }
    
    if (!isUnique) {
      return next(new Error('Failed to generate unique scheme ID'));
    }
  }
  next();
});

// Virtual for formatted launch date
schemeSchema.virtual('formattedLaunchDate').get(function() {
  if (!this.launchDate) return null;
  return this.launchDate.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Method to increment application statistics
schemeSchema.methods.incrementApplicationStats = async function(status) {
  this.statistics.totalApplications += 1;
  
  if (status === 'approved') {
    this.statistics.approvedApplications += 1;
  } else if (status === 'rejected') {
    this.statistics.rejectedApplications += 1;
  } else {
    this.statistics.pendingApplications += 1;
  }
  
  await this.save();
};

// Method to update application statistics
schemeSchema.methods.updateApplicationStats = async function(oldStatus, newStatus) {
  // Decrement old status count
  if (oldStatus === 'approved') {
    this.statistics.approvedApplications = Math.max(0, this.statistics.approvedApplications - 1);
  } else if (oldStatus === 'rejected') {
    this.statistics.rejectedApplications = Math.max(0, this.statistics.rejectedApplications - 1);
  } else {
    this.statistics.pendingApplications = Math.max(0, this.statistics.pendingApplications - 1);
  }
  
  // Increment new status count
  if (newStatus === 'approved') {
    this.statistics.approvedApplications += 1;
  } else if (newStatus === 'rejected') {
    this.statistics.rejectedApplications += 1;
  } else {
    this.statistics.pendingApplications += 1;
  }
  
  await this.save();
};

export default mongoose.model('Scheme', schemeSchema);