const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  schemeId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide scheme name'],
    trim: true,
    maxlength: [200, 'Scheme name cannot be more than 200 characters']
  },
  nameHindi: {
    type: String,
    trim: true,
    maxlength: [200, 'Scheme name in Hindi cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide scheme description'],
    trim: true,
    maxlength: [5000, 'Description cannot be more than 5000 characters']
  },
  descriptionHindi: {
    type: String,
    trim: true,
    maxlength: [5000, 'Description in Hindi cannot be more than 5000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please specify scheme category'],
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
      min: Number,
      max: Number
    },
    incomeLimit: {
      type: Number,
      description: String
    },
    education: [String],
    gender: {
      type: String,
      enum: ['all', 'male', 'female', 'other']
    },
    categories: [String], // SC, ST, OBC, General, etc.
    location: {
      states: [String],
      districts: [String],
      villages: [String]
    },
    documents: [String],
    other: [String]
  },
  benefits: {
    type: {
      type: String,
      enum: ['monetary', 'non_monetary', 'both'],
      required: true
    },
    amount: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'INR'
      }
    },
    description: String,
    frequency: {
      type: String,
      enum: ['one_time', 'monthly', 'quarterly', 'yearly', 'other']
    }
  },
  applicationProcess: {
    online: {
      available: Boolean,
      portal: String,
      steps: [String]
    },
    offline: {
      available: Boolean,
      offices: [String],
      steps: [String]
    },
    documents: [String],
    fees: {
      amount: Number,
      currency: String,
      description: String
    },
    processingTime: {
      days: Number, // in days
      description: String
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'discontinued'],
    default: 'active'
  },
  launchDate: Date,
  endDate: Date,
  lastUpdated: Date,
  contactInfo: {
    helpline: String,
    email: String,
    website: String,
    offices: [{
      name: String,
      address: String,
      phone: String,
      email: String
    }]
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
  tags: [String],
  languages: [String],
  featured: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    default: 0
  },
  image: String,
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  metadata: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    source: String,
    version: {
      type: Number,
      default: 1
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
schemeSchema.index({ name: 'text', description: 'text', nameHindi: 'text', descriptionHindi: 'text' });
schemeSchema.index({ category: 1 });
schemeSchema.index({ department: 1 });
schemeSchema.index({ level: 1 });
schemeSchema.index({ status: 1 });
schemeSchema.index({ featured: 1 });
schemeSchema.index({ priority: -1 });
schemeSchema.index({ tags: 1 });

// Generate unique scheme ID
schemeSchema.pre('save', async function(next) {
  if (!this.schemeId) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.schemeId = `SCH${year}${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Update lastUpdated on save
schemeSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Virtual for category display
schemeSchema.virtual('categoryDisplay').get(function() {
  const categoryMap = {
    'agriculture': 'Agriculture',
    'education': 'Education',
    'healthcare': 'Healthcare',
    'housing': 'Housing',
    'employment': 'Employment',
    'women_welfare': 'Women Welfare',
    'senior_citizens': 'Senior Citizens',
    'disabled_welfare': 'Disabled Welfare',
    'social_security': 'Social Security',
    'infrastructure': 'Infrastructure',
    'environment': 'Environment',
    'other': 'Other'
  };
  return categoryMap[this.category] || this.category;
});

// Virtual for status display
schemeSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'active': 'Active',
    'inactive': 'Inactive',
    'suspended': 'Suspended',
    'discontinued': 'Discontinued'
  };
  return statusMap[this.status] || this.status;
});

// Method to check eligibility
schemeSchema.methods.checkEligibility = function(userData) {
  const eligibility = this.eligibility;
  const results = {
    eligible: true,
    reasons: []
  };

  // Check age
  if (eligibility.ageRange) {
    const userAge = new Date().getFullYear() - new Date(userData.dateOfBirth).getFullYear();
    if (userAge < eligibility.ageRange.min || userAge > eligibility.ageRange.max) {
      results.eligible = false;
      results.reasons.push(`Age must be between ${eligibility.ageRange.min} and ${eligibility.ageRange.max} years`);
    }
  }

  // Check income
  if (eligibility.incomeLimit && userData.income > eligibility.incomeLimit) {
    results.eligible = false;
    results.reasons.push(`Annual income must be less than ₹${eligibility.incomeLimit}`);
  }

  // Check gender
  if (eligibility.gender && eligibility.gender !== 'all' && userData.gender !== eligibility.gender) {
    results.eligible = false;
    results.reasons.push(`Scheme is only for ${eligibility.gender}s`);
  }

  // Check location
  if (eligibility.location) {
    if (eligibility.location.states && eligibility.location.states.length > 0) {
      if (!eligibility.location.states.includes(userData.state)) {
        results.eligible = false;
        results.reasons.push(`Scheme is only available in ${eligibility.location.states.join(', ')}`);
      }
    }
  }

  return results;
};

// Method to update statistics
schemeSchema.methods.updateStatistics = function(type, increment = 1) {
  if (type === 'application') {
    this.statistics.totalApplications += increment;
  } else if (type === 'approved') {
    this.statistics.approvedApplications += increment;
  } else if (type === 'rejected') {
    this.statistics.rejectedApplications += increment;
  } else if (type === 'pending') {
    this.statistics.pendingApplications += increment;
  }
};

// Static method to search schemes
schemeSchema.statics.searchSchemes = function(query, filters = {}) {
  const searchQuery = {
    status: 'active',
    ...filters
  };

  if (query) {
    searchQuery.$text = { $search: query };
  }

  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' }, priority: -1, createdAt: -1 });
};

module.exports = mongoose.model('Scheme', schemeSchema);
