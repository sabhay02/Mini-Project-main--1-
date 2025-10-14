import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useApp } from '../contexts/AppContext';
import { useAuthStore } from '../store/authStore';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const ApplicationFormPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createApplication, uploadApplicationDocuments } = useApp();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const totalSteps = 4;
  const serviceType = searchParams.get('service') || searchParams.get('category');
  const schemeId = searchParams.get('scheme');
  const schemeName = searchParams.get('schemeName');
  const applicationType = searchParams.get('type');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues
  } = useForm();

  const applicationTypes = [
    'Birth Certificate',
    'Death Certificate',
    'Property Tax',
    'Water Connection',
    'Road Maintenance',
    'Community Hall Booking',
    'Sanitation Services',
    'Building Permit',
    'Electricity Connection',
    'Other'
  ];

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast.error('Some files were rejected. Please upload only PNG, JPG, or PDF files up to 10MB.');
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveDraft = () => {
    const formData = getValues();
    localStorage.setItem('applicationDraft', JSON.stringify({
      ...formData,
      uploadedFiles: uploadedFiles.map(file => ({ name: file.name, size: file.size }))
    }));
    toast.success('Application saved as draft');
  };

  const onSubmit = async (data) => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Check if user is verified before submission
    if (!user?.isVerified) {
      toast.error('Please verify your account before submitting applications. Go to your profile to verify.');
      navigate('/profile');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare application data
      const applicationData = {
        type: applicationType === 'scheme' ? `Scheme Application - ${schemeName}` : (data.applicationType || serviceType || 'General Application'),
        title: applicationType === 'scheme' ? `${schemeName} Application` : (data.title || `${data.applicationType || serviceType} Application`),
        description: data.description || (applicationType === 'scheme' ? `Application for ${schemeName}` : data.description),
        applicantName: data.applicantName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        preferredLanguage: data.preferredLanguage,
        urgencyLevel: data.urgencyLevel,
        specialRequirements: data.specialRequirements,
        status: 'pending',
        priority: data.urgencyLevel || 'medium',
        // Add scheme-specific data if this is a scheme application
        ...(applicationType === 'scheme' && {
          schemeId: schemeId,
          schemeName: schemeName
        })
      };

      // Create the application
      const application = await createApplication(applicationData);

      // Upload files if any
      if (uploadedFiles.length > 0) {
        const formData = new FormData();
        uploadedFiles.forEach((file, index) => {
          formData.append(`documents`, file);
        });
        
        await uploadApplicationDocuments(application.id, formData);
      }

      navigate('/applications');
    } catch (error) {
      console.error('Application submission error:', error);
      toast.error(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Applicant Name *
        </label>
        <input
          {...register('applicantName', { required: 'Applicant name is required' })}
          type="text"
          className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary h-12 px-4"
          placeholder="Enter your full name"
        />
        {errors.applicantName && (
          <p className="text-red-600 text-sm mt-1">{errors.applicantName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Application Type *
        </label>
        {applicationType === 'scheme' ? (
          <input
            type="text"
            value={`Scheme Application - ${schemeName}`}
            readOnly
            className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm h-12 px-4 cursor-not-allowed"
          />
        ) : (
          <select
            {...register('applicationType', { required: 'Application type is required' })}
            className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary h-12 px-4"
          >
            <option value="">Select an option</option>
            {applicationTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        )}
        {errors.applicationType && (
          <p className="text-red-600 text-sm mt-1">{errors.applicationType.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description *
        </label>
        <textarea
          {...register('description', { required: 'Description is required' })}
          rows={4}
          className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary p-4"
          placeholder="Describe your application in detail"
        />
        {errors.description && (
          <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Document Upload</h3>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="space-y-2">
            <label className="cursor-pointer">
              <span className="text-primary hover:text-primary/80 font-medium">Upload a file</span>
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400">or drag and drop</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, PDF up to 10MB</p>
          </div>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <AlertCircle className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Personal Information</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email Address *
        </label>
        <input
          {...register('email', { 
            required: 'Email is required',
            pattern: {
              value: /^\S+@\S+$/i,
              message: 'Invalid email address'
            }
          })}
          type="email"
          className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary h-12 px-4"
          placeholder="Enter your email address"
        />
        {errors.email && (
          <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Phone Number *
        </label>
        <input
          {...register('phone', { 
            required: 'Phone number is required',
            pattern: {
              value: /^[6-9]\d{9}$/,
              message: 'Please enter a valid 10-digit phone number'
            }
          })}
          type="tel"
          className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary h-12 px-4"
          placeholder="Enter your phone number"
        />
        {errors.phone && (
          <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Address *
        </label>
        <textarea
          {...register('address', { required: 'Address is required' })}
          rows={3}
          className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary p-4"
          placeholder="Enter your complete address"
        />
        {errors.address && (
          <p className="text-red-600 text-sm mt-1">{errors.address.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date of Birth
          </label>
          <input
            {...register('dateOfBirth')}
            type="date"
            className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary h-12 px-4"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Gender
          </label>
          <select
            {...register('gender')}
            className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary h-12 px-4"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Additional Information</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Preferred Language
        </label>
        <select
          {...register('preferredLanguage')}
          className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary h-12 px-4"
        >
          <option value="">Select Language</option>
          <option value="english">English</option>
          <option value="hindi">Hindi</option>
          <option value="marathi">Marathi</option>
          <option value="gujarati">Gujarati</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Urgency Level
        </label>
        <select
          {...register('urgencyLevel')}
          className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary h-12 px-4"
        >
          <option value="normal">Normal</option>
          <option value="urgent">Urgent</option>
          <option value="very-urgent">Very Urgent</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Special Requirements
        </label>
        <textarea
          {...register('specialRequirements')}
          rows={3}
          className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary p-4"
          placeholder="Any special requirements or notes"
        />
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Application Guidelines</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
              <li>• Ensure all documents are clear and legible</li>
              <li>• Application will be processed within 7-10 working days</li>
              <li>• You will receive updates via SMS and email</li>
              <li>• Keep your application reference number for tracking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Review & Submit</h3>
      
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Application Summary</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Applicant Name:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {watch('applicantName') || 'Not provided'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Application Type:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {watch('applicationType') || 'Not selected'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Email:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {watch('email') || 'Not provided'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Phone:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {watch('phone') || 'Not provided'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Documents:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {uploadedFiles.length} file(s)
            </span>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Final Confirmation</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Please review all information carefully before submitting. Once submitted, you cannot make changes to your application.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/applications')}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Applications
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {applicationType === 'scheme' ? `Apply for ${schemeName}` : 'New Application'}
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {applicationType === 'scheme' 
                  ? `Complete the application form to apply for ${schemeName}`
                  : 'Please fill out the form below to start your application.'
                }
              </p>
              {applicationType === 'scheme' && (
                <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  <span className="mr-2">📋</span>
                  Scheme Application
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Step {currentStep} of {totalSteps}
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                {renderCurrentStep()}
              </div>

              {/* Form Actions */}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save as Draft
                </button>
                
                <div className="flex gap-3">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                    >
                      Previous
                    </button>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? (
                      'Submitting...'
                    ) : currentStep === totalSteps ? (
                      'Submit Application'
                    ) : (
                      <>
                        Next Step
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApplicationFormPage;