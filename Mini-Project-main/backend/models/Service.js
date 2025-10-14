const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  serviceId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide service name'],
    trim: true,
    maxlength: [200, 'Service name cannot be more than 200 characters']
  },
  nameHindi: {
    type: String,
    trim: true,
    maxlength: [200, 'Service name in Hindi cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide service description'],
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
    required: [true, 'Please specify service category'],
    enum: [
      'essential',
      'welfare',
      'community',
      'infrastructure',
      'environment',
      'emergency',
      'sanitation',
      'security',
      'construction',
      'maintenance',
      'information',
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
  features: [String], // List of service features
  requirements: [String], // Required documents or conditions
  processingTime: {
    type: Number, // in days
    default: 7
  },
  fees: {
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'discontinued'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  icon: {
    type: String,
    default: 'FileText'
  },
  image: String,
  contactInfo: {
    phone: String,
    email: String,
    address: String
  },
  applicationProcess: [{
    step: Number,
    title: String,
    description: String,
    required: Boolean
  }],
  eligibility: {
    age: {
      min: Number,
      max: Number
    },
    income: {
      min: Number,
      max: Number
    },
    gender: [String],
    location: {
      states: [String],
      districts: [String]
    },
    other: [String]
  },
  tags: [String],
  languages: [String],
  featured: {
    type: Boolean,
    default: false
  },
  metadata: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    version: {
      type: Number,
      default: 1
    },
    source: {
      type: String,
      enum: ['web', 'mobile', 'admin'],
      default: 'admin'
    }
  }
}, {
  timestamps: true
});

// Index for better performance
serviceSchema.index({ category: 1, status: 1 });
serviceSchema.index({ department: 1, status: 1 });
serviceSchema.index({ featured: 1, status: 1 });
serviceSchema.index({ name: 'text', description: 'text' });

// Static methods
serviceSchema.statics.getFeatured = function(limit = 5) {
  return this.find({ 
    featured: true, 
    status: 'active' 
  })
  .sort({ priority: -1, createdAt: -1 })
  .limit(limit);
};

serviceSchema.statics.getByCategory = function(category, limit = 10) {
  return this.find({ 
    category, 
    status: 'active' 
  })
  .sort({ priority: -1, createdAt: -1 })
  .limit(limit);
};

// Instance methods
serviceSchema.methods.checkEligibility = function(userData) {
  const reasons = [];
  let eligible = true;

  // Check age eligibility
  if (this.eligibility.age) {
    const age = this.calculateAge(userData.dateOfBirth);
    if (this.eligibility.age.min && age < this.eligibility.age.min) {
      eligible = false;
      reasons.push(`Minimum age requirement is ${this.eligibility.age.min} years`);
    }
    if (this.eligibility.age.max && age > this.eligibility.age.max) {
      eligible = false;
      reasons.push(`Maximum age limit is ${this.eligibility.age.max} years`);
    }
  }

  // Check income eligibility
  if (this.eligibility.income && userData.income !== undefined) {
    if (this.eligibility.income.min && userData.income < this.eligibility.income.min) {
      eligible = false;
      reasons.push(`Minimum income requirement is ₹${this.eligibility.income.min}`);
    }
    if (this.eligibility.income.max && userData.income > this.eligibility.income.max) {
      eligible = false;
      reasons.push(`Maximum income limit is ₹${this.eligibility.income.max}`);
    }
  }

  // Check gender eligibility
  if (this.eligibility.gender && this.eligibility.gender.length > 0) {
    if (!this.eligibility.gender.includes(userData.gender)) {
      eligible = false;
      reasons.push(`This service is only available for ${this.eligibility.gender.join(' or ')}`);
    }
  }

  // Check location eligibility
  if (this.eligibility.location) {
    if (this.eligibility.location.states && this.eligibility.location.states.length > 0) {
      if (!this.eligibility.location.states.includes(userData.state)) {
        eligible = false;
        reasons.push(`This service is only available in ${this.eligibility.location.states.join(', ')}`);
      }
    }
    if (this.eligibility.location.districts && this.eligibility.location.districts.length > 0) {
      if (!this.eligibility.location.districts.includes(userData.district)) {
        eligible = false;
        reasons.push(`This service is only available in ${this.eligibility.location.districts.join(', ')}`);
      }
    }
  }

  return { eligible, reasons };
};

serviceSchema.methods.calculateAge = function(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Remove sensitive data from JSON output
serviceSchema.methods.toJSON = function() {
  const service = this.toObject();
  return service;
};

module.exports = mongoose.model('Service', serviceSchema);
