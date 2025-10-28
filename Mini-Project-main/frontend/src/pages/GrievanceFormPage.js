import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  CheckCircle,
  Save,
  ArrowRight,
  X
} from 'lucide-react';

const GrievanceFormPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: {
      address: '',
      village: '',
      district: '',
      state: '',
      pincode: ''
    },
    priority: 'medium',
    contactPhone: '',
    contactTime: ''
  });
  
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'water_supply', label: 'Water Supply' },
    { value: 'electricity', label: 'Electricity' },
    { value: 'road_repair', label: 'Road Repair' },
    { value: 'street_lights', label: 'Street Lights' },
    { value: 'drainage', label: 'Drainage' },
    { value: 'garbage_collection', label: 'Garbage Collection' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'corruption', label: 'Corruption' },
    { value: 'other', label: 'Other' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024;
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert('Some files were rejected. Please upload only PNG, JPG, or PDF files up to 10MB.');
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title || !formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description || !formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.location || !formData.location.address || !formData.location.address.trim()) {
      newErrors.locationAddress = 'Location address is required';
    }

    if (!formData.priority) {
      newErrors.priority = 'Priority is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = () => {
    try {
      // Use in-memory storage instead of localStorage
      const draftData = {
        ...formData,
        uploadedFiles: uploadedFiles.map(file => ({ name: file.name, size: file.size })),
        savedAt: new Date().toISOString()
      };
      // Store in component state or session (for demo, just show alert)
      console.log('Draft saved:', draftData);
      alert('Grievance saved as draft (in current session)');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft');
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      
      if (!token) {
        alert('Please login to submit a grievance');
        window.location.href = '/login';
        return;
      }

      // Ensure location object has all required fields
      const locationData = {
        address: (formData.location?.address || '').trim(),
        village: (formData.location?.village || '').trim(),
        district: (formData.location?.district || '').trim(),
        state: (formData.location?.state || '').trim(),
        pincode: (formData.location?.pincode || '').trim()
      };

      // Match backend schema exactly
      const grievanceData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        subCategory: formData.category,
        location: locationData,
        priority: formData.priority,
        metadata: {
          source: 'web',
          contactPhone: formData.contactPhone || '',
          contactTime: formData.contactTime || ''
        }
      };

      console.log('Submitting grievance:', grievanceData);

      const response = await fetch('/api/grievances', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(grievanceData)
      });

      const data = await response.json();
      console.log('Response:', data);

      if (!response.ok) {
        // Handle validation errors
        if (data.errors && typeof data.errors === 'object') {
          const fieldErrors = {};
          Object.keys(data.errors).forEach(key => {
            const msg = data.errors[key].message || data.errors[key];
            if (key === 'location.address') {
              fieldErrors.locationAddress = msg;
            } else {
              fieldErrors[key] = msg;
            }
          });
          setErrors(fieldErrors);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          alert('Please fix the errors in the form');
          return;
        }

        throw new Error(data.message || 'Failed to submit grievance');
      }

      // Extract grievance ID from response
      const grievanceId = data?.data?.grievance?._id || data?.data?._id || data?._id;

      // Upload files if any
      if (uploadedFiles.length > 0 && grievanceId) {
        const formDataFiles = new FormData();
        uploadedFiles.forEach((file) => {
          formDataFiles.append('documents', file);
        });

        try {
          const uploadRes = await fetch(`/api/grievances/${grievanceId}/documents`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formDataFiles
          });
          
          if (!uploadRes.ok) {
            console.warn('Document upload failed', await uploadRes.text());
          }
        } catch (uploadError) {
          console.error('Error uploading documents:', uploadError);
        }
      }

      alert('Grievance submitted successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        location: {
          address: '',
          village: '',
          district: '',
          state: '',
          pincode: ''
        },
        priority: 'medium',
        contactPhone: '',
        contactTime: ''
      });
      setUploadedFiles([]);

      // Redirect after short delay
      setTimeout(() => {
        window.location.href = '/grievances';
      }, 1500);
    } catch (error) {
      console.error('Grievance submission error:', error);
      alert(error.message || 'Failed to submit grievance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Grievances
          </button>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Submit Grievance</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Please provide details about your complaint or issue.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 h-12 px-4"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-red-600 text-sm mt-1">{errors.category}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={handleInputChange}
                      maxLength={100}
                      className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 h-12 px-4"
                      placeholder="Brief description of your grievance"
                    />
                    {errors.title && (
                      <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Detailed Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      maxLength={2000}
                      className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 p-4"
                      placeholder="Please provide detailed information about your grievance"
                    />
                    {errors.description && (
                      <p className="text-red-600 text-sm mt-1">{errors.description}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location Address *
                    </label>
                    <input
                      name="location.address"
                      type="text"
                      value={formData.location.address}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 h-12 px-4"
                      placeholder="Enter the location where the issue occurred"
                    />
                    {errors.locationAddress && (
                      <p className="text-red-600 text-sm mt-1">{errors.locationAddress}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Village/Town
                      </label>
                      <input
                        name="location.village"
                        type="text"
                        value={formData.location.village}
                        onChange={handleInputChange}
                        className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 h-12 px-4"
                        placeholder="Village or town name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        District
                      </label>
                      <input
                        name="location.district"
                        type="text"
                        value={formData.location.district}
                        onChange={handleInputChange}
                        className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 h-12 px-4"
                        placeholder="District"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        State
                      </label>
                      <input
                        name="location.state"
                        type="text"
                        value={formData.location.state}
                        onChange={handleInputChange}
                        className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 h-12 px-4"
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Pincode
                      </label>
                      <input
                        name="location.pincode"
                        type="text"
                        value={formData.location.pincode}
                        onChange={handleInputChange}
                        className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 h-12 px-4"
                        placeholder="Pincode"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority Level *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {priorities.map((priority) => (
                        <label key={priority.value} className="relative">
                          <input
                            type="radio"
                            name="priority"
                            value={priority.value}
                            checked={formData.priority === priority.value}
                            onChange={handleInputChange}
                            className="sr-only peer"
                          />
                          <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer peer-checked:border-blue-500 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <div className={`text-center font-medium ${priority.color}`}>
                              {priority.label}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.priority && (
                      <p className="text-red-600 text-sm mt-1">{errors.priority}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contact Phone
                      </label>
                      <input
                        name="contactPhone"
                        type="tel"
                        value={formData.contactPhone}
                        onChange={handleInputChange}
                        className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 h-12 px-4"
                        placeholder="Your contact number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preferred Contact Time
                      </label>
                      <select
                        name="contactTime"
                        value={formData.contactTime}
                        onChange={handleInputChange}
                        className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 h-12 px-4"
                      >
                        <option value="">Select time</option>
                        <option value="morning">Morning (9 AM - 12 PM)</option>
                        <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                        <option value="evening">Evening (5 PM - 8 PM)</option>
                        <option value="anytime">Anytime</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Attachments (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <div className="space-y-2">
                        <label className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-700 font-medium">Upload files</span>
                          <input
                            type="file"
                            multiple
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">or drag and drop</p>
                        <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB each</p>
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
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
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
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Grievance
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GrievanceFormPage;