const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Scheme = require('../models/Scheme');
const Announcement = require('../models/Announcement');

// Sample data
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@egrampanchayat.gov.in',
    phone: '9876543210',
    password: 'admin123',
    role: 'admin',
    isVerified: true,
    address: {
      village: 'Sample Village',
      district: 'Sample District',
      state: 'Sample State',
      pincode: '123456'
    }
  },
  {
    name: 'Staff User',
    email: 'staff@egrampanchayat.gov.in',
    phone: '9876543211',
    password: 'staff123',
    role: 'staff',
    isVerified: true,
    address: {
      village: 'Sample Village',
      district: 'Sample District',
      state: 'Sample State',
      pincode: '123456'
    }
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '9876543212',
    password: 'user123',
    role: 'citizen',
    isVerified: true,
    address: {
      village: 'Sample Village',
      district: 'Sample District',
      state: 'Sample State',
      pincode: '123456'
    }
  }
];

const sampleSchemes = [
  {
    schemeId: 'SCH2024000001',
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    nameHindi: 'प्रधानमंत्री किसान सम्मान निधि (पीएम-किसान)',
    description: 'The PM-KISAN scheme provides income support to small and marginal farmer families across India. Under this scheme, eligible farmer families receive an annual financial assistance of ₹6,000, disbursed in three equal installments of ₹2,000 every four months.',
    descriptionHindi: 'पीएम-किसान योजना भारत भर में छोटे और सीमांत किसान परिवारों को आय सहायता प्रदान करती है। इस योजना के तहत, पात्र किसान परिवारों को ₹6,000 की वार्षिक वित्तीय सहायता मिलती है, जो हर चार महीने में ₹2,000 की तीन समान किस्तों में दी जाती है।',
    category: 'agriculture',
    department: 'agriculture',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    level: 'central',
    eligibility: {
      ageRange: { min: 18, max: 65 },
      incomeLimit: 100000,
      gender: 'all',
      categories: ['All farmers'],
      documents: ['Land records', 'Aadhaar card', 'Bank account details']
    },
    benefits: {
      type: 'monetary',
      amount: { min: 2000, max: 2000 },
      frequency: 'quarterly',
      description: '₹2,000 every 4 months'
    },
    applicationProcess: {
      online: {
        available: true,
        portal: 'https://pmkisan.gov.in',
        steps: ['Register on portal', 'Fill application form', 'Upload documents', 'Submit application']
      },
      offline: {
        available: true,
        offices: ['Block Development Office', 'Village Panchayat Office'],
        steps: ['Visit office', 'Fill application form', 'Submit documents', 'Get acknowledgment']
      },
      documents: ['Land records', 'Aadhaar card', 'Bank account details'],
      fees: { amount: 0, description: 'No fees required' },
      processingTime: { days: 15, description: '15 days' }
    },
    status: 'active',
    featured: true,
    priority: 1,
    languages: ['en', 'hi']
  },
  {
    schemeId: 'SCH2024000002',
    name: 'Pradhan Mantri Awas Yojana (PMAY)',
    nameHindi: 'प्रधानमंत्री आवास योजना (पीएमएवाई)',
    description: 'PMAY aims to provide housing for all by 2022. The scheme provides financial assistance to construct pucca houses for eligible beneficiaries.',
    descriptionHindi: 'पीएमएवाई का उद्देश्य 2022 तक सभी के लिए आवास प्रदान करना है। यह योजना पात्र लाभार्थियों के लिए पक्के घर बनाने के लिए वित्तीय सहायता प्रदान करती है।',
    category: 'housing',
    department: 'housing',
    ministry: 'Ministry of Housing and Urban Affairs',
    level: 'central',
    eligibility: {
      ageRange: { min: 18, max: 70 },
      incomeLimit: 300000,
      gender: 'all',
      categories: ['EWS', 'LIG', 'MIG'],
      documents: ['Income certificate', 'Aadhaar card', 'Bank account details']
    },
    benefits: {
      type: 'monetary',
      amount: { min: 150000, max: 250000 },
      frequency: 'one_time',
      description: 'Up to ₹2.5 lakh for house construction'
    },
    applicationProcess: {
      online: {
        available: true,
        portal: 'https://pmaymis.gov.in',
        steps: ['Register on portal', 'Fill application form', 'Upload documents', 'Submit application']
      },
      offline: {
        available: true,
        offices: ['Municipal Corporation', 'Gram Panchayat Office'],
        steps: ['Visit office', 'Fill application form', 'Submit documents', 'Get acknowledgment']
      },
      documents: ['Income certificate', 'Aadhaar card', 'Bank account details'],
      fees: { amount: 0, description: 'No fees required' },
      processingTime: { days: 30, description: '30 days' }
    },
    status: 'active',
    featured: true,
    priority: 2,
    languages: ['en', 'hi']
  }
];

const sampleAnnouncements = [
  {
    announcementId: 'ANN2024000001',
    title: 'New Agricultural Scheme Launched',
    titleHindi: 'नई कृषि योजना शुरू',
    content: 'The Gram Panchayat has launched a new scheme to support local farmers. Apply now to receive benefits under the agricultural support program.',
    contentHindi: 'ग्राम पंचायत ने स्थानीय किसानों का समर्थन करने के लिए एक नई योजना शुरू की है। कृषि सहायता कार्यक्रम के तहत लाभ प्राप्त करने के लिए अब आवेदन करें।',
    type: 'scheme_launch',
    priority: 'high',
    category: 'schemes',
    targetAudience: 'all',
    status: 'published',
    featured: true,
    pinned: true,
    language: 'en'
  },
  {
    announcementId: 'ANN2024000002',
    title: 'Important Update: Road Construction',
    titleHindi: 'महत्वपूर्ण अपडेट: सड़क निर्माण',
    content: 'Road construction work will commence on Main Street from next week. Please plan your travel accordingly.',
    contentHindi: 'अगले सप्ताह से मुख्य सड़क पर सड़क निर्माण कार्य शुरू होगा। कृपया अपनी यात्रा की योजना बनाएं।',
    type: 'general',
    priority: 'medium',
    category: 'general',
    targetAudience: 'all',
    status: 'published',
    featured: false,
    pinned: false,
    language: 'en'
  },
  {
    announcementId: 'ANN2024000003',
    title: 'Deadline Reminder: Property Tax',
    titleHindi: 'डेडलाइन रिमाइंडर: संपत्ति कर',
    content: 'The deadline for property tax payment is approaching. Ensure timely payment to avoid penalties.',
    contentHindi: 'संपत्ति कर भुगतान की समय सीमा निकट है। जुर्माना से बचने के लिए समय पर भुगतान सुनिश्चित करें।',
    type: 'deadline_reminder',
    priority: 'high',
    category: 'deadlines',
    targetAudience: 'all',
    status: 'published',
    featured: true,
    pinned: false,
    language: 'en'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Scheme.deleteMany({});
    await Announcement.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const users = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      users.push(user);
      console.log(`Created user: ${user.name} (${user.role})`);
    }

    // Create schemes
    for (const schemeData of sampleSchemes) {
      const scheme = new Scheme({
        ...schemeData,
        metadata: {
          createdBy: users[0]._id, // Admin user
          lastModifiedBy: users[0]._id
        }
      });
      await scheme.save();
      console.log(`Created scheme: ${scheme.name}`);
    }

    // Create announcements
    for (const announcementData of sampleAnnouncements) {
      const announcement = new Announcement({
        ...announcementData,
        author: users[0]._id, // Admin user
        approvedBy: users[0]._id
      });
      await announcement.save();
      console.log(`Created announcement: ${announcement.title}`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\nSample users created:');
    console.log('Admin: admin@egrampanchayat.gov.in / admin123');
    console.log('Staff: staff@egrampanchayat.gov.in / staff123');
    console.log('User: john@example.com / user123');
    console.log('\nYou can now login with these credentials.');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
