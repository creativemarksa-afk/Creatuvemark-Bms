"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  FaUser, 
  FaGraduationCap, 
  FaFileAlt, 
  FaUpload, 
  FaCheckCircle,
  FaArrowLeft,
  FaArrowRight,
  FaQuestionCircle,
  FaHeadset,
  FaDownload,
  FaSave,
  FaTimes,
  FaSpinner
} from 'react-icons/fa';
import { 
  PersonalDetailsStep, 
  ServiceDetailsStep, 
  ContactInfoStep, 
  DocumentUploadStep, 
  ReviewStep 
} from '../request/RequestSteps';
import { submitApplication, getMockApplications } from '../../services/clientService';

const RequestFormContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draftId');
  
  const [currentStep, setCurrentStep] = useState(0);
  const [currentDraftId, setCurrentDraftId] = useState(draftId);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    firstName: '',
    middleName: '',
    lastName: '',
    maritalStatus: '',
    gender: '',
    dateOfBirth: '',
    fatherName: '',
    profilePicture: null,
    serviceType: '',
    serviceDescription: '',
    priority: 'Medium',
    estimatedBudget: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    documents: [],
    termsAccepted: false
  });

  const steps = [
    { 
      id: 1, 
      title: "Personal Details", 
      icon: FaUser,
      description: "Basic personal information"
    },
    { 
      id: 2, 
      title: "Service Details", 
      icon: FaGraduationCap,
      description: "Service type and requirements"
    },
    { 
      id: 3, 
      title: "Contact Information", 
      icon: FaFileAlt,
      description: "Contact and address details"
    },
    { 
      id: 4, 
      title: "Document Upload", 
      icon: FaUpload,
      description: "Upload required documents"
    },
    { 
      id: 5, 
      title: "Review & Submit", 
      icon: FaCheckCircle,
      description: "Review and submit your request"
    }
  ];

  useEffect(() => {
    const initializeForm = async () => {
      setLoading(true);
      try {
        if (draftId) {
          try {
            const draftData = await clientService.getRequestById(draftId);
            if (draftData.status === 'Draft' && draftData.formData) {
              setFormData(draftData.formData);
              setCurrentStep(draftData.stepNumber || 0);
              setCurrentDraftId(draftId);
            }
          } catch (error) {
            console.error('Error loading draft:', error);
          }
        }
      } catch (error) {
        console.error('Error initializing form:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    initializeForm();
  }, [draftId, router]);

  useEffect(() => {
    if (!autoSaveEnabled) return;
    const timeoutId = setTimeout(() => {
      handleSaveDraft(true);
    }, 5000);
    return () => clearTimeout(timeoutId);
  }, [formData, currentStep, autoSaveEnabled]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveDraft = async (silent = false) => {
    if (!silent) setSaving(true);
    try {
      // Validate required data before sending
      if (!formData) {
        throw new Error('Form data is required');
      }

      // Ensure we have at least some basic data
      const hasBasicData = formData.firstName || formData.serviceType || formData.email;
      if (!hasBasicData) {
        throw new Error('Please fill in at least one field before saving');
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock draft save - just save to localStorage
      const draftData = {
        draftId: currentDraftId || `draft_${Date.now()}`,
        formData: formData,
        currentStep: currentStep,
        stepName: steps[currentStep]?.title || 'Personal Details',
        savedAt: new Date().toISOString()
      };

      localStorage.setItem('draft_' + draftData.draftId, JSON.stringify(draftData));
      
      if (!currentDraftId) {
        setCurrentDraftId(draftData.draftId);
      }
      
      setLastSaved(new Date());
      if (!silent) {
        alert('Draft saved successfully!');
      }
      
      return draftData.draftId;
    } catch (error) {
      console.error('Error saving draft:', error);
      
      if (!silent) {
        const errorMessage = error.message || 'Error saving draft. Please try again.';
        alert(`Error: ${errorMessage}`);
      }
      throw error;
    } finally {
      if (!silent) setSaving(false);
    }
  };

  const handleSaveAndExit = async () => {
    try {
      await handleSaveDraft(true);
      router.push('/client/requests?tab=drafts');
    } catch (error) {
      console.error('Error saving draft before exit:', error);
      alert('Error saving draft. Please try again.');
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      console.log('Submitting request with mock data:', formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock request submission
      const requestData = {
        type: formData.serviceType,
        title: formData.serviceType,
        description: formData.serviceDescription,
        priority: formData.priority || 'Medium',
        serviceCategory: formData.serviceType,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        documents: formData.documents || []
      };
      
      // Use mock submission
      const response = await submitApplication(requestData);
      
      if (response.success) {
        alert('Request submitted successfully!');
        router.push('/client/requests?tab=submitted');
      } else {
        throw new Error(response.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      alert(`Error submitting request: ${error.message || 'Please try again.'}`);
    } finally {
      setSaving(false);
    }
  };

  const isStepValid = (step) => {
    switch (step) {
      case 0:
        return formData.firstName && formData.lastName && formData.gender && formData.dateOfBirth;
      case 1:
        return formData.serviceType && formData.serviceDescription;
      case 2:
        return formData.email && formData.phone && formData.address;
      case 3:
        return true; // Document upload is optional
      case 4:
        return formData.termsAccepted;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <PersonalDetailsStep formData={formData} handleInputChange={handleInputChange} />;
      case 1:
        return <ServiceDetailsStep formData={formData} handleInputChange={handleInputChange} />;
      case 2:
        return <ContactInfoStep formData={formData} handleInputChange={handleInputChange} />;
      case 3:
        return <DocumentUploadStep formData={formData} handleInputChange={handleInputChange} />;
      case 4:
        return <ReviewStep formData={formData} handleInputChange={handleInputChange} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-green-600 mb-4" />
          <p className="text-xl text-gray-800 font-semibold">Loading draft...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="border-b border-gray-300 pb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
              <div className="text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">
                  {currentDraftId ? 'Continue Request' : 'New Service Request'}
                </h1>
                <p className="text-base text-gray-600 font-medium mt-2">
                  Complete the step-by-step process to submit your service request
                </p>
                {lastSaved && (
                  <div className="mt-3 inline-flex items-center px-3 py-1 text-sm bg-green-100 text-green-800">
                    <FaSave className="mr-2" />
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </div>
                )}
              </div>
              
              {/* Save Controls */}
              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
                <label className="flex items-center text-sm text-gray-600 bg-gray-100 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={autoSaveEnabled}
                    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                    className="mr-2"
                  />
                  Auto-save
                </label>
                
                <button
                  onClick={() => handleSaveDraft(false)}
                  disabled={saving}
                  className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
                  Save Draft
                </button>
                
                <button
                  onClick={handleSaveAndExit}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  <FaTimes className="mr-2" />
                  Save & Exit
                </button>
              </div>
            </div>
          </div>

          {/* Step Navigation */}
          <div className="bg-white border border-gray-300 p-4 sm:p-6">
            <div className="overflow-x-auto hide-scrollbar">
              <div className="flex items-center justify-between min-w-max space-x-2 sm:space-x-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-shrink-0">
                    <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 border-2 border-gray-300 transition-all duration-300 ${
                      index === currentStep 
                        ? 'bg-green-600 text-white border-green-600' 
                        : index < currentStep 
                        ? 'bg-green-100 text-green-600 border-green-600'
                        : 'bg-white text-gray-400'
                    }`}>
                      <step.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="ml-2 sm:ml-3 min-w-0">
                      <p className={`text-xs sm:text-sm font-semibold transition-colors duration-300 ${
                        index === currentStep ? 'text-green-600' : 
                        index < currentStep ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {step.id}. {step.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 hidden sm:block max-w-24 sm:max-w-32">{step.description}</p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-8 sm:w-12 h-1 mx-2 sm:mx-4 bg-gray-300 transition-all duration-300 ${
                        index < currentStep ? 'bg-green-600' : ''
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white border border-gray-300">
            {/* Content Header */}
            <div className="px-4 sm:px-6 py-4 bg-green-50 border-b border-gray-300">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                {steps[currentStep].title}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mt-1">{steps[currentStep].description}</p>
            </div>

            {/* Content Body */}
            <div className="px-4 sm:px-6 py-6">
              {renderStepContent()}
            </div>

            {/* Navigation Footer */}
            <div className="px-4 sm:px-6 py-4 bg-green-50 border-t border-gray-300">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className={`flex items-center px-4 py-2 text-sm font-medium transition-colors ${
                    currentStep === 0 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-green-600 hover:text-white hover:border-green-600'
                  }`}
                >
                  <FaArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </button>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button className="flex items-center px-4 py-2 text-sm font-medium text-green-600 bg-white border border-green-300 hover:bg-green-600 hover:text-white transition-colors">
                    <FaHeadset className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Online Help</span>
                    <span className="sm:hidden">Help</span>
                  </button>
                  <button className="flex items-center px-4 py-2 text-sm font-medium text-green-600 bg-white border border-green-300 hover:bg-green-600 hover:text-white transition-colors">
                    <FaDownload className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Download Manual</span>
                    <span className="sm:hidden">Manual</span>
                  </button>
                </div>

                {currentStep === steps.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={!isStepValid(currentStep) || saving}
                    className={`px-6 py-2 text-sm font-medium transition-colors ${
                      isStepValid(currentStep) && !saving
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {saving ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={!isStepValid(currentStep)}
                    className={`flex items-center px-4 py-2 text-sm font-medium transition-colors ${
                      isStepValid(currentStep)
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Next
                    <FaArrowRight className="ml-2 h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RequestForm = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    }>
      <RequestFormContent />
    </Suspense>
  );
};

export default RequestForm;