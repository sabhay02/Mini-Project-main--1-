const mongoose = require('mongoose');
const Service = require('../models/Service');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/e-gram-panchayat', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleServices = [
  {
    serviceId: 'SRV2024000001',
    name: 'Property Tax Payment',
    nameHindi: 'संपत्ति कर भुगतान',
    description: 'Pay your property tax online with ease and convenience.',
    descriptionHindi: 'आसानी और सुविधा के साथ अपने संपत्ति कर का ऑनलाइन भुगतान करें।',
    category: 'essential',
    department: 'finance',
    status: 'active',
    featured: true,
    priority: 'high',
    processingTime: 1,
    fees: { amount: 0, currency: 'INR' },
    requirements: ['Property documents', 'Previous year tax receipt'],
    contactInfo: {
      phone: '9876543210',
      email: 'revenue@panchayat.gov.in',
      address: 'Revenue Department, Panchayat Office'
    },
    metadata: {
      createdBy: '68e5fe15088985e739efb4dc',
      lastModifiedBy: '68e5fe15088985e739efb4dc'
    }
  },
  {
    serviceId: 'SRV2024000002',
    name: 'Water Connection',
    nameHindi: 'पानी कनेक्शन',
    description: 'Apply for new water connection to your property.',
    descriptionHindi: 'अपनी संपत्ति के लिए नए पानी कनेक्शन के लिए आवेदन करें।',
    category: 'essential',
    department: 'rural_development',
    status: 'active',
    featured: true,
    priority: 'high',
    processingTime: 7,
    fees: { amount: 500, currency: 'INR' },
    requirements: ['Property documents', 'Identity proof', 'Address proof'],
    contactInfo: {
      phone: '9876543211',
      email: 'water@panchayat.gov.in',
      address: 'Water Supply Department, Panchayat Office'
    },
    metadata: {
      createdBy: '68e5fe15088985e739efb4dc',
      lastModifiedBy: '68e5fe15088985e739efb4dc'
    }
  },
  {
    serviceId: 'SRV2024000003',
    name: 'Birth Certificate',
    nameHindi: 'जन्म प्रमाण पत्र',
    description: 'Apply for birth certificate online.',
    descriptionHindi: 'जन्म प्रमाण पत्र के लिए ऑनलाइन आवेदन करें।',
    category: 'essential',
    department: 'finance',
    status: 'active',
    featured: true,
    priority: 'high',
    processingTime: 3,
    fees: { amount: 50, currency: 'INR' },
    requirements: ['Hospital birth record', 'Parent identity proof', 'Address proof'],
    contactInfo: {
      phone: '9876543212',
      email: 'certificates@panchayat.gov.in',
      address: 'Revenue Department, Panchayat Office'
    },
    metadata: {
      createdBy: '68e5fe15088985e739efb4dc',
      lastModifiedBy: '68e5fe15088985e739efb4dc'
    }
  },
  {
    serviceId: 'SRV2024000004',
    name: 'Death Certificate',
    nameHindi: 'मृत्यु प्रमाण पत्र',
    description: 'Apply for death certificate online.',
    descriptionHindi: 'मृत्यु प्रमाण पत्र के लिए ऑनलाइन आवेदन करें।',
    category: 'essential',
    department: 'finance',
    status: 'active',
    featured: false,
    priority: 'medium',
    processingTime: 3,
    fees: { amount: 50, currency: 'INR' },
    requirements: ['Hospital death record', 'Applicant identity proof', 'Address proof'],
    contactInfo: {
      phone: '9876543212',
      email: 'certificates@panchayat.gov.in',
      address: 'Revenue Department, Panchayat Office'
    },
    metadata: {
      createdBy: '68e5fe15088985e739efb4dc',
      lastModifiedBy: '68e5fe15088985e739efb4dc'
    }
  },
  {
    serviceId: 'SRV2024000005',
    name: 'Marriage Certificate',
    nameHindi: 'विवाह प्रमाण पत्र',
    description: 'Apply for marriage certificate online.',
    descriptionHindi: 'विवाह प्रमाण पत्र के लिए ऑनलाइन आवेदन करें।',
    category: 'essential',
    department: 'finance',
    status: 'active',
    featured: false,
    priority: 'medium',
    processingTime: 5,
    fees: { amount: 100, currency: 'INR' },
    requirements: ['Marriage registration proof', 'Both parties identity proof', 'Witness details'],
    contactInfo: {
      phone: '9876543212',
      email: 'certificates@panchayat.gov.in',
      address: 'Revenue Department, Panchayat Office'
    },
    metadata: {
      createdBy: '68e5fe15088985e739efb4dc',
      lastModifiedBy: '68e5fe15088985e739efb4dc'
    }
  },
  {
    serviceId: 'SRV2024000006',
    name: 'Community Hall Booking',
    nameHindi: 'सामुदायिक हॉल बुकिंग',
    description: 'Book community hall for events and functions.',
    descriptionHindi: 'कार्यक्रम और समारोह के लिए सामुदायिक हॉल बुक करें।',
    category: 'community',
    department: 'rural_development',
    status: 'active',
    featured: false,
    priority: 'low',
    processingTime: 2,
    fees: { amount: 200, currency: 'INR' },
    requirements: ['Event details', 'Identity proof', 'Security deposit'],
    contactInfo: {
      phone: '9876543213',
      email: 'community@panchayat.gov.in',
      address: 'Community Services Department, Panchayat Office'
    },
    metadata: {
      createdBy: '68e5fe15088985e739efb4dc',
      lastModifiedBy: '68e5fe15088985e739efb4dc'
    }
  }
];

async function addSampleServices() {
  try {
    console.log('Adding sample services...');
    
    // Clear existing services
    await Service.deleteMany({});
    console.log('Cleared existing services');
    
    // Add sample services
    for (const serviceData of sampleServices) {
      const service = new Service(serviceData);
      await service.save();
      console.log(`Added service: ${service.name}`);
    }
    
    console.log('✅ Sample services added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding sample services:', error);
    process.exit(1);
  }
}

addSampleServices();
