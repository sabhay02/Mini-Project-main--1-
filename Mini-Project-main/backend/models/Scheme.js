const mongoose = require('mongoose');

// Helper function to generate a unique ID portion (safer than relying on count)
function generateUniqueIdPortion(prefix) {
    const timestamp = Date.now().toString(36).slice(-4); // Last 4 chars of timestamp
    const randomPart = Math.random().toString(36).substring(2, 6); // 4 random chars
    return `${prefix}-${timestamp}${randomPart}`.toUpperCase();
}

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

// 🌟 CORRECTION 1: Replace vulnerable ID generation logic with safer method
schemeSchema.pre('save', function(next) {
  if (this.isNew && !this.schemeId) {
    // Generate a unique ID using a random hash/timestamp to avoid race conditions
    this.schemeId = generateUniqueIdPortion('SCH');
  }
  next();
});

// Update lastUpdated on save
schemeSchema.pre('save', function(next) {
    if (this.isModified()) {
        this.lastUpdated = new Date();
    }
  next();
});

// 🌟 CORRECTION 2: Dedicated method for accurate age calculation
schemeSchema.methods._calculateAge = function(dateOfBirth) {
    const birthDate = new Date(dateOfBirth);
    
    if (isNaN(birthDate.getTime())) {
        return null; // Invalid date
    }
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust age if birthday hasn't passed this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};


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
  if (eligibility.ageRange && userData.dateOfBirth) {
    const userAge = this._calculateAge(userData.dateOfBirth);
    
    if (userAge === null) {
        results.eligible = false;
        results.reasons.push('Invalid Date of Birth provided for age check.');
    } else if (userAge < eligibility.ageRange.min || userAge > eligibility.ageRange.max) {
      results.eligible = false;
      results.reasons.push(`Age must be between ${eligibility.ageRange.min} and ${eligibility.ageRange.max} years`);
    }
  }

  // Check income
  if (eligibility.incomeLimit && userData.income !== undefined && userData.income > eligibility.incomeLimit) {
    results.eligible = false;
    results.reasons.push(`Annual income must be less than ₹${eligibility.incomeLimit}`);
  }

  // Check gender (Ensure case-insensitive comparison for user input)
  if (eligibility.gender && eligibility.gender !== 'all' && userData.gender) {
    if (userData.gender.toLowerCase() !== eligibility.gender.toLowerCase()) {
        results.eligible = false;
        results.reasons.push(`Scheme is only for ${eligibility.gender}s`);
    }
  }

  // Check location (States)
  if (eligibility.location) {
    if (eligibility.location.states && eligibility.location.states.length > 0 && userData.state) {
      if (!eligibility.location.states.includes(userData.state)) {
        results.eligible = false;
        results.reasons.push(`Scheme is only available in ${eligibility.location.states.join(', ')}`);
      }
    }
    // Add check for Districts for completeness
    if (eligibility.location.districts && eligibility.location.districts.length > 0 && userData.district) {
        if (!eligibility.location.districts.includes(userData.district)) {
            results.eligible = false;
            results.reasons.push(`Scheme is not available in district ${userData.district}`);
        }
    }
  }
  
  // Final check based on reasons collected
  if (results.reasons.length > 0) {
      results.eligible = false;
  } else {
      results.eligible = true;
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