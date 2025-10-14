import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useApp } from '../contexts/AppContext';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  MapPin,
  Calendar,
  Save,
  ArrowRight,
  Camera,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

const GrievanceFormPage = () => {
  const navigate = useNavigate();
  const { createGrievance, uploadGrievanceDocuments } = useApp();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues
  } = useForm();

  const categories = [
    'Infrastructure',
    'Water Supply',
    'Sanitation',
    'Electricity',
    'Road Maintenance',
    'Health',
    'Education',
    'Environment',
    'Other'
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-red-600' }
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
    localStorage.setItem('grievanceDraft', JSON.stringify({
      ...formData,
      uploadedFiles: uploadedFiles.map(file => ({ name: file.name, size: file.size }))
    }));
    toast.success('Grievance saved as draft');
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Prepare grievance data
      const grievanceData = {
        title: data.title,
        description: data.description,
        category: data.category,
        subcategory: data.category, // Using category as subcategory for now
        location: data.location,
        priority: data.priority,
        contactPhone: data.contactPhone,
        contactTime: data.contactTime,
        status: 'pending'
      };

      // Create the grievance
      const grievance = await createGrievance(grievanceData);

      // Upload files if any
      if (uploadedFiles.length > 0) {
        const formData = new FormData();
        uploadedFiles.forEach((file, index) => {
          formData.append(`documents`, file);
        });
        
        await uploadGrievanceDocuments(grievance.id, formData);
      }

      navigate('/grievances');
    } catch (error) {
      console.error('Grievance submission error:', error);
      toast.error(error.message || 'Failed to submit grievance. Please try again.');
    } finally {
      setIsSubmitting(false);
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
                onClick={() => navigate('/grievances')}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Grievances
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
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Submit Grievance</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Please provide details about your complaint or issue.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="space-y-6">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      {...register('category', { required: 'Category is required' })}
                      className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary h-12 px-4"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      {...register('title', { required: 'Title is required' })}
                      type="text"
                      className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary h-12 px-4"
                      placeholder="Brief description of your grievance"
                    />
                    {errors.title && (
                      <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Detailed Description *
                    </label>
                    <textarea
                      {...register('description', { required: 'Description is required' })}
                      rows={4}
                      className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary p-4"
                      placeholder="Please provide detailed information about your grievance"
                    />
                    {errors.description && (
                      <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location *
                    </label>
                    <input
                      {...register('location', { required: 'Location is required' })}
                      type="text"
                      className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary h-12 px-4"
                      placeholder="Enter the location where the issue occurred"
                    />
                    {errors.location && (
                      <p className="text-red-600 text-sm mt-1">{errors.location.message}</p>
                    )}
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority Level *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {priorities.map((priority) => (
                        <label key={priority.value} className="relative">
                          <input
                            {...register('priority', { required: 'Priority is required' })}
                            type="radio"
                            value={priority.value}
                            className="sr-only peer"
                          />
                          <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer peer-checked:border-primary peer-checked:bg-primary/5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <div className={`text-center font-medium ${priority.color}`}>
                              {priority.label}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.priority && (
                      <p className="text-red-600 text-sm mt-1">{errors.priority.message}</p>
                    )}
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contact Phone
                      </label>
                      <input
                        {...register('contactPhone')}
                        type="tel"
                        className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary h-12 px-4"
                        placeholder="Your contact number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preferred Contact Time
                      </label>
                      <select
                        {...register('contactTime')}
                        className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary h-12 px-4"
                      >
                        <option value="">Select time</option>
                        <option value="morning">Morning (9 AM - 12 PM)</option>
                        <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                        <option value="evening">Evening (5 PM - 8 PM)</option>
                        <option value="anytime">Anytime</option>
                      </select>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Attachments (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <div className="space-y-2">
                        <label className="cursor-pointer">
                          <span className="text-primary hover:text-primary/80 font-medium">Upload files</span>
                          <input
                            type="file"
                            multiple
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">or drag and drop</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, PDF up to 10MB each</p>
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

                  {/* Guidelines */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Grievance Guidelines</h4>
                        <ul className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1">
                          <li>• Provide clear and specific details about the issue</li>
                          <li>• Include location and time when the issue occurred</li>
                          <li>• Attach relevant photos or documents if available</li>
                          <li>• Grievances will be processed within 15 working days</li>
                          <li>• You will receive updates via SMS and email</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
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
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    'Submitting...'
                  ) : (
                    <>
                      Submit Grievance
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GrievanceFormPage;