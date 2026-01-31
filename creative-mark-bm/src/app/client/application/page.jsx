"use client";

import React, { useState, useEffect, useContext } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Upload, 
  X, 
  Plus, 
  Building2, 
  Users, 
  FileText, 
  CreditCard, 
  Eye, 
  Shield,
  User,
  Globe,
  Briefcase,
  Building,
  Heart,
  FileImage,
  DollarSign as RiyalSign,
  CheckCircle
} from "lucide-react";
import { createApplication } from "../../../services/applicationService";
import AuthContext from "../../../contexts/AuthContext";
import RequirementsModal from "../../../components/client/RequirementsModal";
import { getCurrentUser } from "../../../services/auth";
import { useTranslation } from "../../../i18n/TranslationContext";

export default function ModernMultiStepForm() {
  const { user } = useContext(AuthContext);
  const { t, language } = useTranslation();
  const isRTL = language === 'ar';
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [applicationId, setApplicationId] = useState(null);
  const [showRequirementsModal, setShowRequirementsModal] = useState(true);
  const [requirementsAccepted, setRequirementsAccepted] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    nationality: "",
    residencyStatus: "",
    externalCompaniesCount: 0,
    externalCompaniesDetails: [],
    serviceType: "",
    projectEstimatedValue: "",
    familyMembers: [],
    needVirtualOffice: false,
    uploadedFiles: {},
    passportFile: null,
    docOption: "uploadDocs",
    companyArrangesExternalCompanies: false,
    status: "submitted",
    approvedBy: "",
    approvedAt: "",
    assignedEmployees: []
  });

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user.data);
        
        // Update form with user data
        if (user.data) {
          setForm(prev => ({
            ...prev,
            fullName: user.data.fullName || prev.fullName,
            email: user.data.email || prev.email,
            phone: user.data.phone || prev.phone,
            nationality: user.data.nationality || prev.nationality,
            residencyStatus: user.data.residencyStatus || prev.residencyStatus
          }));
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    fetchCurrentUser();
  }, []);


  function getRequirements() {
    const svc = form.serviceType;

    if (svc === "engineering") {
      return {
        requiredExternalCompanies: 4,
        note: t('application.requirements.engineering')
      };
    }
    if (svc === "commercial" || svc === "trade") {
      return {
        requiredExternalCompanies: 3,
        note: t('application.requirements.commercialSole')
      };
    }
    if (svc === "real_estate") {
      return {
        requiredExternalCompanies: 1,
        note: t('application.requirements.realEstate')
      };
    }
    if (svc === "industrial" || svc === "agricultural" || svc === "service") {
      return {
        requiredExternalCompanies: 1,
        note: t('application.requirements.industrial')
      };
    }
    if (svc === "advertising") {
      return {
        requiredExternalCompanies: 0,
        note: t('application.requirements.advertising')
      };
    }
    return { requiredExternalCompanies: 0, note: t('application.requirements.noSpecialRules') };
  }

  const globalRequirements = getRequirements();

  // Enhanced validation functions
  const validateField = (name, value, formData = form) => {
    let error = "";
    
    switch (name) {
      case "fullName":
        if (!value?.trim()) error = t('validation.fullNameRequired');
        else if (value.trim().length < 2) error = t('validation.fullNameMinLength');
        break;
      case "email":
        if (!value?.trim()) error = t('validation.emailRequired');
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = t('validation.emailInvalid');
        }
        break;
      case "phone":
        if (!value?.trim()) error = t('validation.phoneRequired');
        else if (!/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ""))) {
          error = t('validation.phoneInvalid');
        }
        break;
      case "nationality":
        if (!value?.trim()) error = t('validation.nationalityRequired');
        break;
      case "residencyStatus":
        if (!value?.trim()) error = t('validation.residencyStatusRequired');
        break;
      case "serviceType":
        if (!value) error = t('validation.serviceTypeRequired');
        break;
      case "projectEstimatedValue":
        if (formData.serviceType === 'real_estate') {
          if (!value || isNaN(parseFloat(value))) {
            error = t('validation.projectValueRequired');
          } else if (parseFloat(value) < 300000000) {
            error = t('validation.projectValueMinimum');
          }
        } else if (value && isNaN(parseFloat(value))) {
          error = t('validation.projectValueValidNumber');
        } else if (value && parseFloat(value) < 0) {
          error = t('validation.projectValueNegative');
        }
        break;
      case "companyArrangesExternalCompanies":
        // This validation is handled in validateStep for step 5
        // No individual field validation needed here
        break;
      default:
        break;
    }
    
    return error;
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};
    
    switch (stepNumber) {
      case 1:
        // Only validate phone if name and email are already filled from profile
        if (form.fullName && form.email) {
          const phoneError = validateField("phone", form.phone);
          if (phoneError) newErrors.phone = phoneError;
        } else {
          // Validate all fields if not pre-filled
          ["fullName", "email", "phone"].forEach(field => {
            const error = validateField(field, form[field]);
            if (error) newErrors[field] = error;
          });
        }
        break;
      case 2:
        // Only validate if fields are not pre-filled from profile
        if (!form.nationality) {
          const nationalityError = validateField("nationality", form.nationality);
          if (nationalityError) newErrors.nationality = nationalityError;
        }
        if (!form.residencyStatus) {
          const residencyError = validateField("residencyStatus", form.residencyStatus);
          if (residencyError) newErrors.residencyStatus = residencyError;
        }
        break;
      case 3:
        const serviceError = validateField("serviceType", form.serviceType);
        if (serviceError) newErrors.serviceType = serviceError;
        
        if (form.serviceType === "real_estate") {
          const projectError = validateField("projectEstimatedValue", form.projectEstimatedValue);
          if (projectError) newErrors.projectEstimatedValue = projectError;
        }
        break;
      case 4:
        // External companies validation
        const companyRequirements = getRequirements();
        
        // If service requires external companies and user has 0 companies
        if (companyRequirements.requiredExternalCompanies > 0 && form.externalCompaniesCount === 0) {
          // Check if user has selected "CreativeMark will provide"
          if (!form.companyArrangesExternalCompanies) {
            newErrors.companyArrangesExternalCompanies = t('validation.selectOptionOrAddCompanies');
          }
        }
        
        // Only validate company details if user has provided companies
        if (form.externalCompaniesCount > 0) {
          for (let i = 0; i < form.externalCompaniesDetails.length; i++) {
            const company = form.externalCompaniesDetails[i];
            if (!company) {
              newErrors[`company_${i}_missing`] = t('validation.companyDetailsRequired');
              continue;
            }
            if (!company.companyName?.trim()) {
              newErrors[`company_${i}_name`] = t('validation.companyNameRequired');
            }
            if (!company.country?.trim()) {
              newErrors[`company_${i}_country`] = t('validation.countryRequired');
            }
            if (!company.crNumber?.trim()) {
              newErrors[`company_${i}_crNumber`] = t('validation.crNumberRequired');
            }
          }
        }
        break;
      case 7:
        // Document validation
        const docRequirements = getRequirements();
        
        // Always require passport
        if (!form.passportFile) {
          newErrors.passportFile = t('application.validation.passportRequired');
        }
        
        // Always require ID card
        if (!form.uploadedFiles.idCard || form.uploadedFiles.idCard.length === 0) {
          newErrors.idCard = t('application.validation.idCardRequired');
        }
        
        // If service requires external companies
        if (docRequirements.requiredExternalCompanies > 0) {
          // If user has sufficient companies and chose to upload docs
          if (form.externalCompaniesCount >= docRequirements.requiredExternalCompanies && form.docOption === "uploadDocs") {
            // Check if at least one company document is uploaded
            let hasCompanyDocuments = false;
            for (let i = 0; i < Math.min(form.externalCompaniesCount, docRequirements.requiredExternalCompanies); i++) {
              if ((form.uploadedFiles[`cr_${i}`] && form.uploadedFiles[`cr_${i}`].length > 0) ||
                  (form.uploadedFiles[`fs_${i}`] && form.uploadedFiles[`fs_${i}`].length > 0) ||
                  (form.uploadedFiles[`aoa_${i}`] && form.uploadedFiles[`aoa_${i}`].length > 0)) {
                hasCompanyDocuments = true;
                break;
              }
            }
            if (!hasCompanyDocuments) {
              newErrors.companyDocuments = t('application.validation.companyDocumentsRequired');
            }
          }
          // If user doesn't have sufficient companies or chose passport only, no additional validation needed
        }
        
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const newValue = type === "checkbox" ? checked : 
                    name === "externalCompaniesCount" ? parseInt(value) || 0 :
                    value;
    
    setForm(prev => ({ ...prev, [name]: newValue }));
    
    // Real-time validation
    const error = validateField(name, newValue);
    setErrors(prev => ({ ...prev, [name]: error }));

    // Clear checkbox error when user changes external companies count or checks the box
    if (name === "externalCompaniesCount" || name === "companyArrangesExternalCompanies") {
      setErrors(prev => ({ ...prev, companyArrangesExternalCompanies: "" }));
    }

    // Auto-generate company slots when count changes
    if (name === "externalCompaniesCount") {
      const count = parseInt(value) || 0;
      setForm(prev => ({
        ...prev,
        externalCompaniesDetails: Array.from({ length: count }, (_, i) => 
          prev.externalCompaniesDetails[i] || {
            companyName: "",
            country: "",
            crNumber: "",
            sharePercentage: 0
          }
        )
      }));
    }
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  }

  const getInputClassName = (fieldName) => {
    const hasError = touched[fieldName] && errors[fieldName];
    const baseClasses = "w-full px-6 py-4 border-2 transition-all duration-300 placeholder-gray-400 text-gray-900 font-medium shadow-sm hover:shadow-md focus:shadow-lg";
    
    if (hasError) {
      return `${baseClasses} border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-100/50`;
    }
    return `${baseClasses} border-gray-200/50 bg-white/80 hover:border-gray-300 focus:border-gray-400 focus:ring-4 focus:ring-gray-100/50 backdrop-blur-sm`;
  };

  const renderErrorMessage = (fieldName) => {
    if (touched[fieldName] && errors[fieldName]) {
      return (
        <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
          <X className="w-4 h-4" />
          {errors[fieldName]}
        </div>
      );
    }
    return null;
  };

  // File handling functions
  function handleFileChange(e) {
    const { name, files } = e.target;
    setForm(prev => ({ ...prev, uploadedFiles: { ...prev.uploadedFiles, [name]: files } }));
  }

  function handlePassportChange(e) {
    setForm(prev => ({ ...prev, passportFile: e.target.files?.[0] || null }));
  }


  // Dynamic field management
  function addFamilyMember() {
    setForm(prev => ({
      ...prev,
      familyMembers: [...prev.familyMembers, { name: "", relation: "spouse", passportNo: "" }]
    }));
  }

  function removeFamilyMember(index) {
    setForm(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.filter((_, i) => i !== index)
    }));
  }

  function updateFamilyMember(index, field, value) {
    setForm(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }));
  }

  function updateExternalCompany(index, field, value) {
    setForm(prev => ({
      ...prev,
      externalCompaniesDetails: prev.externalCompaniesDetails.map((company, i) => 
        i === index ? { ...company, [field]: value } : company
      )
    }));
    
    const errorKey = `company_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: "" }));
    }
  }

  function nextStep() {
    if (validateStep(step)) {
      setStep(s => s + 1);
    } else {
      // Mark fields as touched to show errors
      const fieldsToTouch = {};
      switch (step) {
        case 1:
          // Only mark phone as touched if name and email are pre-filled
          if (form.fullName && form.email) {
            fieldsToTouch.phone = true;
          } else {
            ["fullName", "email", "phone"].forEach(field => fieldsToTouch[field] = true);
          }
          break;
        case 2:
          // Only mark fields as touched if they're not pre-filled
          if (!form.nationality) fieldsToTouch.nationality = true;
          if (!form.residencyStatus) fieldsToTouch.residencyStatus = true;
          break;
        case 3:
          fieldsToTouch.serviceType = true;
          if (form.serviceType === "real_estate") fieldsToTouch.projectEstimatedValue = true;
          break;
        case 4:
          fieldsToTouch.externalCompaniesCount = true;
          if (getRequirements().requiredExternalCompanies > 0 && form.externalCompaniesCount === 0) {
            fieldsToTouch.companyArrangesExternalCompanies = true;
          }
          break;
        case 6:
          fieldsToTouch.passportFile = true;
          fieldsToTouch.idCard = true;
          if (getRequirements().requiredExternalCompanies > 0 && form.externalCompaniesCount >= getRequirements().requiredExternalCompanies && form.docOption === "uploadDocs") {
            fieldsToTouch.companyDocuments = true;
          }
          break;
      }
      setTouched(prev => ({ ...prev, ...fieldsToTouch }));
    }
  }

  function prevStep() {
    setStep(s => Math.max(1, s - 1));
  }

  async function submitForm() {
    if (!user || !user.id) {
      setSubmitError("User not authenticated. Please log in again.");
      return;
    }

    // Validate required fields before submission
    const validationErrors = {};
    
    // Check serviceType
    if (!form.serviceType || form.serviceType.trim() === "") {
      validationErrors.serviceType = "Service type is required";
    }
    
    
    // If there are validation errors, show them and stop submission
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitError("Please fix the validation errors before submitting.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Prepare application data for backend
      const applicationData = {
        // userId removed - will be taken from authenticated user in middleware
        serviceType: form.serviceType?.trim(), // Ensure no whitespace
        externalCompaniesCount: parseInt(form.externalCompaniesCount) || 0,
        externalCompaniesDetails: form.externalCompaniesDetails || [],
        projectEstimatedValue: form.projectEstimatedValue ? parseFloat(form.projectEstimatedValue) : null,
        familyMembers: form.familyMembers || [],
        needVirtualOffice: Boolean(form.needVirtualOffice),
        companyArrangesExternalCompanies: Boolean(form.companyArrangesExternalCompanies),
        // Additional fields from backend
        status: "submitted", // Always set to submitted for new applications
        approvedBy: null, // Never set for client submissions
        approvedAt: null, // Never set for client submissions
        assignedEmployees: [] // Never set for client submissions
      };

      // Final validation before sending
      if (!applicationData.serviceType) {
        throw new Error("Service type is required");
      }


      // Prepare files for upload
      const filesToUpload = {};
      
      // Add passport file if available
      if (form.passportFile) {
        filesToUpload.passport = [form.passportFile];
      }

      // Add ID card file if available
      if (form.uploadedFiles.idCard && form.uploadedFiles.idCard.length > 0) {
        filesToUpload.idCard = Array.from(form.uploadedFiles.idCard);
      }


      // Add commercial registration files if user chose to upload docs
      if (form.docOption === "uploadDocs" && form.uploadedFiles) {
        Object.keys(form.uploadedFiles).forEach(key => {
          if (key.startsWith('cr_')) {
            // Commercial Registration documents
            if (form.uploadedFiles[key] && form.uploadedFiles[key].length > 0) {
              filesToUpload.commercial_registration = filesToUpload.commercial_registration || [];
              filesToUpload.commercial_registration.push(...Array.from(form.uploadedFiles[key]));
            }
          } else if (key.startsWith('fs_')) {
            // Financial Statement documents
            if (form.uploadedFiles[key] && form.uploadedFiles[key].length > 0) {
              filesToUpload.financial_statement = filesToUpload.financial_statement || [];
              filesToUpload.financial_statement.push(...Array.from(form.uploadedFiles[key]));
            }
          } else if (key.startsWith('aoa_')) {
            // Articles of Association documents
            if (form.uploadedFiles[key] && form.uploadedFiles[key].length > 0) {
              filesToUpload.articles_of_association = filesToUpload.articles_of_association || [];
              filesToUpload.articles_of_association.push(...Array.from(form.uploadedFiles[key]));
            }
          }
        });
      }

      // Call the backend API
      const response = await createApplication(applicationData, filesToUpload);
      setApplicationId(response.data?.applicationId);
      setSubmitted(true);
      
      // Redirect to client dashboard after successful submission
      setTimeout(() => {
        window.location.href = '/client/track-application';
      }, 3000);

    } catch (error) {
      console.error("Submission error:", error);
      setSubmitError(error.message || "Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const steps = [
    { id: 1, title: t('application.steps.personalInfo') || 'Personal Info', icon: User, description: t('application.steps.basicInformation') || 'Basic information' },
    { id: 2, title: t('application.steps.background') || 'Background', icon: Globe, description: t('application.steps.nationalityStatus') || 'Nationality & status' },
    { id: 3, title: t('application.steps.serviceType') || 'Service Type', icon: Briefcase, description: t('application.steps.businessActivity') || 'Business activity' },
    { id: 4, title: t('application.steps.companies') || 'Companies', icon: Building, description: t('application.steps.externalCompanies') || 'External companies' },
    { id: 5, title: t('application.steps.family') || 'Family', icon: Heart, description: t('application.steps.familyMembers') || 'Family members' },
    { id: 6, title: t('application.steps.documents') || 'Documents', icon: FileImage, description: t('application.steps.fileUploads') || 'File uploads' },
    { id: 7, title: t('application.steps.fee') || 'Fee', icon: RiyalSign, description: t('application.steps.feeDetails') || 'Fee details' },
    { id: 8, title: t('application.steps.review') || 'Review', icon: CheckCircle, description: t('application.steps.finalReview') || 'Final review' }
  ];

  // Handle requirements modal acceptance
  const handleRequirementsAccept = () => {
    setRequirementsAccepted(true);
    setShowRequirementsModal(false);
  };

  const handleRequirementsClose = () => {
    setShowRequirementsModal(false);
    // Optionally redirect back to client dashboard
    window.location.href = '/client';
  };

  // Show requirements modal first
  if (showRequirementsModal) {
    return (
      <RequirementsModal
        isOpen={showRequirementsModal}
        onClose={handleRequirementsClose}
        onAccept={handleRequirementsAccept}
        showTriggerButton={false}
      />
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="bg-white rounded-2xl shadow-xl border border-[#ffd17a]/20 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#ffd17a] to-[#ffd17a]/80 p-6 sm:p-8 text-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {t('application.success.title')}
              </h1>
              <p className="text-white/90 text-sm sm:text-base">
                {t('application.success.subtitle', { serviceType: form.serviceType ? form.serviceType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'your service' })}
              </p>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
              <div className="max-w-3xl mx-auto">
                <div className="bg-[#ffd17a]/10 border border-[#ffd17a]/20 rounded-xl p-6 mb-6">
                  <p className="text-[#242021] text-base sm:text-lg leading-relaxed mb-4">
                    {t('application.success.description')}
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-[#242021] mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#ffd17a] rounded-full"></div>
                      {t('application.success.nextSteps')}
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="w-8 h-8 bg-[#ffd17a] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[#242021] font-bold text-sm">1</span>
                        </div>
                        <div>
                          <p className="text-[#242021] font-medium">{t('application.success.step1')}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="w-8 h-8 bg-[#ffd17a] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[#242021] font-bold text-sm">2</span>
                        </div>
                        <div>
                          <p className="text-[#242021] font-medium">{t('application.success.step2')}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="w-8 h-8 bg-[#ffd17a] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[#242021] font-bold text-sm">3</span>
                        </div>
                        <div>
                          <p className="text-[#242021] font-medium">{t('application.success.step3')}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="w-8 h-8 bg-[#ffd17a] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[#242021] font-bold text-sm">4</span>
                        </div>
                        <div>
                          <p className="text-[#242021] font-medium">{t('application.success.step4')}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#ffd17a]/5 border border-[#ffd17a]/20 rounded-xl p-6">
                    <p className="text-[#242021] text-sm sm:text-base leading-relaxed">
                      {t('application.success.trackMessage')}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-[#242021] font-medium text-base sm:text-lg mb-6">
                      {t('application.success.thankYou')}
                    </p>
                  </div>

                  {applicationId && (
                    <div className="bg-white border-2 border-[#ffd17a]/20 rounded-xl p-4 text-center">
                      <p className="text-xs font-bold uppercase tracking-wide text-[#242021]/60 mb-1">{t('application.success.applicationId')}</p>
                      <p className="font-mono text-lg font-bold text-[#242021]">{applicationId}</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                      onClick={() => window.location.href = '/client/track-application'}
                      className="px-8 py-4 bg-[#ffd17a] hover:bg-[#ffd17a]/90 text-[#242021] text-sm font-bold uppercase tracking-wider transition-all duration-200 shadow-lg hover:shadow-xl rounded-lg transform hover:scale-105"
                    >
                      {t('application.success.trackApplication')}
                    </button>
                    <button 
                      onClick={() => window.location.href = '/client'}
                      className="px-8 py-4 bg-white border-2 border-[#ffd17a] text-[#ffd17a] hover:bg-[#ffd17a] hover:text-[#242021] text-sm font-bold uppercase tracking-wider transition-all duration-200 shadow-lg hover:shadow-xl rounded-lg transform hover:scale-105"
                    >
                      {t('application.success.backToDashboard')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header Section */}
        <div className="backdrop-blur-sm lg:rounded-3xl lg:m-2 border-b border-[#ffd17a]/20 bg-[#242021]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-2 h-2 rounded-full shadow-lg animate-pulse bg-[#ffd17a]"></div>
                  <span className="text-sm font-medium uppercase tracking-wider text-[#ffd17a]/80">{t('application.title')}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight mb-3 text-[#ffd17a]">
                  {t('application.subtitle')}
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-white/70">
                  {t('application.description')}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <button
                  onClick={() => window.location.href = '/client'}
                  className="w-full sm:w-auto px-6 py-3 text-sm font-semibold uppercase tracking-wider border border-[#ffd17a]/30 bg-[#ffd17a]/10 text-[#ffd17a] rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:bg-[#ffd17a]/20 group"
                >
                  <span className='group-hover:scale-105 transition-transform duration-300'>{t('application.backToDashboard')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Progress Steps */}
        <div className="bg-white border border-[#ffd17a]/10 overflow-hidden group hover:shadow-lg transition-all duration-300 mb-8 sm:mb-10 rounded-lg shadow-sm">
          <div className="p-4 sm:p-6 lg:p-8 bg-[#242021]">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2 sm:mb-3">
                  <div className="w-2 h-2 rounded-full shadow-lg animate-pulse bg-[#ffd17a]"></div>
                  <span className="text-sm font-medium uppercase tracking-wider text-[#ffd17a]/80">{t('application.progress.title')}</span>
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 text-[#ffd17a]">{t('application.progress.step')} {step} {t('application.progress.of')} {steps.length}</h2>
                <p className="text-sm sm:text-base text-white/70">{steps[step - 1]?.title || 'Step'} - {steps[step - 1]?.description || 'Description'}</p>
              </div>
              <div className="text-center sm:text-right">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 text-[#ffd17a]">
                  {Math.round((step / steps.length) * 100)}%
                </div>
                <p className='text-xs sm:text-sm font-semibold text-[#ffd17a]/80'>{t('application.progress.complete')}</p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 lg:p-8">

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 h-2 sm:h-3 mb-6 sm:mb-8 rounded-lg overflow-hidden">
              <div
                className="h-2 sm:h-3 transition-all duration-1000 ease-out bg-gradient-to-r from-[#ffd17a] to-[#ffd17a]/80 rounded-lg"
                style={{ width: `${(step / steps.length) * 100}%` }}
              />
            </div>

            {/* Step Icons */}
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3 sm:gap-4 lg:gap-6">
              {steps.map((stepItem) => {
                const Icon = stepItem.icon;
                const isActive = step === stepItem.id;
                const isCompleted = step > stepItem.id;

                return (
                  <div key={stepItem.id} className="flex flex-col items-center group">
                    <div className={`
                      w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex items-center justify-center transition-all duration-300 rounded-lg
                      ${isActive
                        ? 'shadow-lg scale-110 bg-gradient-to-br from-[#ffd17a] to-[#ffd17a]/80 text-[#242021]'
                        : isCompleted 
                        ? 'shadow-md bg-gradient-to-br from-[#ffd17a] to-[#ffd17a]/80 text-[#242021]'
                        : 'bg-gray-50 border border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600 hover:scale-105'
                      }
                    `}>
                      {isCompleted ? <Check className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" /> : <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />}
                    </div>
                    <span className={`mt-2 sm:mt-3 text-xs font-semibold text-center transition-all duration-300 ${
                      isActive ? 'font-bold scale-105 text-[#ffd17a]' : isCompleted ? 'text-[#ffd17a]' : 'text-gray-500'
                    }`}>
                      {stepItem.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white border border-[#ffd17a]/10 overflow-hidden group hover:shadow-lg transition-all duration-300 rounded-lg shadow-sm">
        <div className="p-4 sm:p-6 lg:p-8 bg-[#242021]">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-[#ffd17a] to-[#ffd17a]/80 rounded-lg">
              {React.createElement(steps[step - 1]?.icon, { className: "w-6 h-6 sm:w-7 sm:h-7 text-[#242021]" })}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#ffd17a]">{steps[step - 1]?.title}</h2>
              <p className="text-sm sm:text-base text-white/70">{steps[step - 1]?.description}</p>
            </div>
          </div>
        </div>
          <div className="p-4 sm:p-6 lg:p-8">
            
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-6 shadow-xl" style={{ backgroundColor: '#ffd17a' }}>
                    <User className="w-8 h-8" style={{ color: '#242021' }} />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                    {t('application.steps.personalInfo')}
                  </h3>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    {t('application.steps.basicInformation')}
                  </p>
                  
                  {/* Show pre-filled data notification */}
                  {(form.fullName || form.email) && (
                    <div className="mt-6 max-w-md mx-auto">
                      <div className="bg-[#ffd17a]/10 border border-[#ffd17a]/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-[#242021]">
                          <Check className="w-5 h-5 text-[#ffd17a]" />
                          <span className='font-medium text-sm'>{t('application.personalInfo.profileDataLoaded')}</span>
                        </div>
                        <p className="text-[#242021]/80 text-sm mt-1">
                          {t('application.personalInfo.profileDataDescription')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#ffd17a] rounded-full"></span>
                      {t('application.personalInfo.fullName')} *
                      {form.fullName && (
                        <span className="text-xs bg-[#ffd17a]/20 text-[#242021] px-2 py-1 rounded-full font-medium">
                          {t('application.personalInfo.fromProfile')}
                        </span>
                      )}
                    </label>
                    <input 
                      name="fullName" 
                      value={form.fullName} 
                      readOnly
                      placeholder={t('application.personalInfo.enterFullName')} 
                      className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50 text-gray-700 font-medium shadow-sm cursor-not-allowed" 
                    />
                    {form.fullName && (
                      <p className='text-xs text-gray-500 mt-1'>{t('application.personalInfo.fieldLocked')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#ffd17a] rounded-full"></span>
                      {t('application.personalInfo.emailAddress')} *
                      {form.email && (
                        <span className="text-xs bg-[#ffd17a]/20 text-[#242021] px-2 py-1 rounded-full font-medium">
                          {t('application.personalInfo.fromProfile')}
                        </span>
                      )}
                    </label>
                    <input 
                      name="email" 
                      type="email"
                      value={form.email} 
                      readOnly
                      placeholder={t('application.personalInfo.enterEmail')} 
                      className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50 text-gray-700 font-medium shadow-sm cursor-not-allowed" 
                    />
                    {form.email && (
                      <p className='text-xs text-gray-500 mt-1'>{t('application.personalInfo.fieldLocked')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#ffd17a] rounded-full"></span>
                      {t('application.personalInfo.phoneNumber')} *
                      {form.phone && (
                        <span className="text-xs bg-[#ffd17a]/20 text-[#242021] px-2 py-1 rounded-full font-medium">
                          {t('application.personalInfo.fromProfileEditable')}
                        </span>
                      )}
                    </label>
                    <input 
                      name="phone" 
                      value={form.phone} 
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={t('application.personalInfo.enterPhone')} 
                      className={getInputClassName("phone")} 
                    />
                    {renderErrorMessage("phone")}
                    {form.phone && (
                      <p className='text-xs text-[#242021]/60 mt-1'>{t('application.personalInfo.phoneUpdateNote')}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Background Information */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#ffd17a] to-[#ffd17a]/80 mb-6 shadow-xl">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                    {t('application.steps.background')}
                  </h3>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    {t('application.steps.nationalityStatus')}
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      {t('application.background.nationality')} *
                      {form.nationality && (
                        <span className="text-xs bg-[#ffd17a]/20 text-[#242021] px-2 py-1 rounded-full font-medium">
                          {t('application.personalInfo.fromProfileEditable')}
                        </span>
                      )}
                    </label>
                    <input 
                      name="nationality" 
                      value={form.nationality} 
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={t('application.background.nationalityPlaceholder')} 
                      className={getInputClassName("nationality")} 
                    />
                    {renderErrorMessage("nationality")}
                    {form.nationality && (
                      <p className='text-xs text-[#242021]/60 mt-1'>{t('application.background.nationalityUpdateNote')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      {t('application.background.residencyStatus')} *
                      {form.residencyStatus && (
                        <span className="text-xs bg-[#ffd17a]/20 text-[#242021] px-2 py-1 rounded-full font-medium">
                          {t('application.personalInfo.fromProfileEditable')}
                        </span>
                      )}
                    </label>
                    <select 
                      name="residencyStatus" 
                      value={form.residencyStatus} 
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={getInputClassName("residencyStatus")}
                    >
                      <option value=''>{t('application.background.selectResidencyStatus')}</option>
                      <option value='saudi'>{t('application.background.saudiNational')}</option>
                      <option value='gulf'>{t('application.background.gulfNational')}</option>
                      <option value='premium'>{t('application.background.premiumResidency')}</option>
                      <option value='foreign'>{t('application.background.foreignNational')}</option>
                    </select>
                    {renderErrorMessage("residencyStatus")}
                    {form.residencyStatus && (
                      <p className='text-xs text-[#242021]/60 mt-1'>{t('application.background.residencyUpdateNote')}</p>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="needVirtualOffice" 
                        checked={form.needVirtualOffice} 
                        onChange={handleChange}
                        className="mt-1 w-5 h-5 text-[#ffd17a] border-gray-300 rounded focus:ring-[#ffd17a]/20" 
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">{t('application.background.virtualOfficeService')}</span>
                        <p className="text-sm text-gray-600 mt-1">{t('application.background.virtualOfficeDescription')}</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Service Selection */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#ffd17a] to-[#ffd17a]/80 mb-6 shadow-xl">
                    <Briefcase className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                    {t('application.steps.serviceType')}
                  </h3>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    {t('application.steps.businessActivity')}
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('application.serviceType.serviceType')} *</label>
                    <select 
                      name="serviceType" 
                      value={form.serviceType} 
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={getInputClassName("serviceType")}
                    >
                      <option value=''>{t('application.serviceType.selectBusinessService')}</option>
                      <option value='commercial'>{t('application.serviceType.commercialActivity')}</option>
                      <option value='engineering'>{t('application.serviceType.engineeringConsulting')}</option>
                      <option value='real_estate'>{t('application.serviceType.realEstateDevelopment')}</option>
                      <option value='industrial'>{t('application.serviceType.industrialActivity')}</option>
                      <option value='agricultural'>{t('application.serviceType.agriculturalActivity')}</option>
                      <option value='service'>{t('application.serviceType.serviceActivity')}</option>
                      <option value='advertising'>{t('application.serviceType.advertisingPromotions')}</option>
                    </select>
                    {renderErrorMessage("serviceType")}
                  </div>


                  {form.serviceType === "real_estate" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('application.serviceType.firstProjectValue')} *</label>
                      <input 
                        name="projectEstimatedValue" 
                        type="number"
                        value={form.projectEstimatedValue} 
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder={t('application.serviceType.minimumProjectValue')} 
                        className={getInputClassName("projectEstimatedValue")} 
                      />
                      {renderErrorMessage("projectEstimatedValue")}
                      <p className='text-sm text-gray-600 mt-2'>{t('application.serviceType.realEstateRequirement')}</p>
                    </div>
                  )}

                  {form.serviceType && (
                  <div className="bg-gray-50 border border-gray-200 p-4 transition-all duration-300 hover:shadow-md">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('application.serviceType.requirementsSummary')}</h3>
                    <p className="text-sm text-gray-700">{globalRequirements.note}</p>
                  </div>
                  )}
                </div>
              </div>
            )}


            {/* Step 4: External Companies */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#ffd17a] to-[#ffd17a]/80 mb-6 shadow-xl">
                    <Building className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                    {t('application.steps.companies')}
                  </h3>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    {t('application.steps.externalCompanies')}
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('application.companies.numberOfExternalCompanies')}</label>
                    <input 
                      name="externalCompaniesCount" 
                      type="number" 
                      min="0" 
                      max="10" 
                      value={form.externalCompaniesCount} 
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={getInputClassName("externalCompaniesCount")} 
                      placeholder={t('application.companies.enterNumberOfCompanies')}
                    />
                    {renderErrorMessage("externalCompaniesCount")}
                    <p className='text-sm text-gray-600 mt-2'>{t('application.companies.externalCompaniesNote')}</p>
                  </div>

                  {globalRequirements.requiredExternalCompanies > 0 && (
                    <div className="bg-gray-50 border border-gray-200 p-4 transition-all duration-300 hover:shadow-md">
                      <h3 className="font-semibold text-gray-900 mb-2">{t('application.companies.requirements')}</h3>
                      <p className="text-sm text-gray-700 mb-2">
                        {t('application.companies.serviceRequires', { count: globalRequirements.requiredExternalCompanies })}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">{globalRequirements.note}</p>
                      <div className="bg-gray-100 border border-gray-200 p-3 transition-all duration-300 hover:shadow-md">
                        <p className="text-sm text-gray-700 font-medium">
                          💡 {t('application.companies.dontHaveCompanies')}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {t('application.companies.enterZeroCompanies')}
                        </p>
                        <div className="mt-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name="companyArrangesExternalCompanies"
                              checked={form.companyArrangesExternalCompanies}
                              onChange={handleChange}
                              className={`w-4 h-4 text-[#ffd17a] border-gray-300 focus:ring-[#ffd17a]/20 ${
                                errors.companyArrangesExternalCompanies ? 'border-red-300' : ''
                              }`}
                            />
                            <span className="text-sm text-[#242021] font-medium">
                              {t('application.companies.arrangeCompanies')}
                            </span>
                          </label>
                          {errors.companyArrangesExternalCompanies && (
                            <div className="flex items-center gap-2 text-red-600 text-sm mt-2 ml-6">
                              <X className="w-4 h-4" />
                              {errors.companyArrangesExternalCompanies}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* External Companies Details */}
                  {form.externalCompaniesDetails.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">{t('application.companies.companyDetails')}</h3>
                      
                      {form.externalCompaniesDetails.map((company, index) => (
                        <div key={index} className="border border-gray-200 rounded-xl p-4 sm:p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">{t('application.companies.companyNumber', { number: index + 1 })}</h4>
                            <span className="text-sm text-gray-600">{t('application.companies.required')}</span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">{t('application.companies.companyName')} *</label>
                              <input 
                                value={company.companyName} 
                                onChange={(e) => updateExternalCompany(index, 'companyName', e.target.value)}
                                placeholder={t('application.companies.enterCompanyName')}
                                className={errors[`company_${index}_name`] ? 
                                  "w-full px-3 py-2 rounded-lg border-2 border-red-300 bg-red-50 focus:border-red-500 text-sm" : 
                                  "w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-[#ffd17a] text-sm"
                                } 
                              />
                              {errors[`company_${index}_name`] && (
                                <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                                  <X className="w-4 h-4" />
                                  {errors[`company_${index}_name`]}
                                </div>
                              )}
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">{t('application.companies.country')} *</label>
                              <input 
                                value={company.country} 
                                onChange={(e) => updateExternalCompany(index, 'country', e.target.value)}
                                placeholder={t('application.companies.enterCountry')}
                                className={errors[`company_${index}_country`] ? 
                                  "w-full px-3 py-2 rounded-lg border-2 border-red-300 bg-red-50 focus:border-red-500 text-sm" : 
                                  "w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-[#ffd17a] text-sm"
                                } 
                              />
                              {errors[`company_${index}_country`] && (
                                <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                                  <X className="w-4 h-4" />
                                  {errors[`company_${index}_country`]}
                                </div>
                              )}
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">{t('application.companies.crNumber')} *</label>
                              <input 
                                value={company.crNumber} 
                                onChange={(e) => updateExternalCompany(index, 'crNumber', e.target.value)}
                                placeholder={t('application.companies.enterCrNumber')}
                                className={errors[`company_${index}_crNumber`] ? 
                                  "w-full px-3 py-2 rounded-lg border-2 border-red-300 bg-red-50 focus:border-red-500 text-sm" : 
                                  "w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-[#ffd17a] text-sm"
                                } 
                              />
                              {errors[`company_${index}_crNumber`] && (
                                <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                                  <X className="w-4 h-4" />
                                  {errors[`company_${index}_crNumber`]}
                                </div>
                              )}
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">{t('application.companies.yourShare')}</label>
                              <input 
                                type="number"
                                min="0"
                                max="100"
                                value={company.sharePercentage} 
                                onChange={(e) => updateExternalCompany(index, 'sharePercentage', parseFloat(e.target.value) || 0)}
                                placeholder={t('application.companies.ownershipPercentage')}
                                className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 text-sm" 
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {form.externalCompaniesCount === 0 && (
                    <div className="text-center py-8">
                      <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-600 mb-2">{t('application.companies.noCompaniesConfigure')}</p>
                      {globalRequirements.requiredExternalCompanies > 0 ? (
                        <div className="bg-[#ffd17a]/10 border border-[#ffd17a]/20 rounded-lg p-4 max-w-md mx-auto">
                          <p className="text-sm text-[#242021] font-medium mb-2">
                            ✅ {t('application.companies.weWillArrange', { count: globalRequirements.requiredExternalCompanies })}
                          </p>
                          <p className="text-sm text-[#242021]/80">
                            {t('application.companies.proceedToNextStep')}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">{t('application.companies.canProceed')}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Family Members */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#ffd17a] to-[#ffd17a]/80 mb-6 shadow-xl">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                    {t('application.family.title')}
                  </h3>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    {t('application.family.subtitle')}
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{t('application.family.familyMembers')}</h3>
                    <button
                      type="button"
                      onClick={addFamilyMember}
                      className="flex items-center gap-2 px-4 py-2 bg-[#242021] text-white font-medium rounded-xl hover:bg-[#242021]/90 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      {t('application.family.addMember')}
                    </button>
                  </div>
                  
                  {form.familyMembers.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">{t('application.family.noFamilyMembers')}</p>
                      <p className="text-sm">{t('application.family.clickAddMember')}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {form.familyMembers.map((member, index) => (
                        <div key={index} className="border border-gray-200 rounded-xl p-4 sm:p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-900">{t('application.family.familyMember', { number: index + 1 })}</h4>
                            <button
                              type="button"
                              onClick={() => removeFamilyMember(index)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              <X className="w-4 h-4" />
                              {t('application.family.remove')}
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">{t('application.family.fullName')}</label>
                              <input 
                                value={member.name} 
                                onChange={(e) => updateFamilyMember(index, 'name', e.target.value)}
                                placeholder={t('application.family.enterFullName')}
                                className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 text-sm" 
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">{t('application.family.relationship')}</label>
                              <select 
                                value={member.relation} 
                                onChange={(e) => updateFamilyMember(index, 'relation', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 text-sm"
                              >
                                <option value="spouse">{t('application.family.spouse')}</option>
                                <option value="child">{t('application.family.child')}</option>
                                <option value="parent">{t('application.family.parent')}</option>
                                <option value="other">{t('application.family.other')}</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">{t('application.family.passportNumber')}</label>
                              <input 
                                value={member.passportNo} 
                                onChange={(e) => updateFamilyMember(index, 'passportNo', e.target.value)}
                                placeholder={t('application.family.enterPassportNumber')}
                                className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 text-sm" 
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 6: Document Upload */}
            {step === 6 && (
              <div className="space-y-6">
                <div className={`mb-8 ${isRTL ? 'text-right' : 'text-center'}`}>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#ffd17a] to-[#ffd17a]/80 mb-6 shadow-xl">
                    <FileImage className="w-8 h-8 text-white" />
                  </div>
                  <h3 className={`text-2xl sm:text-3xl font-bold text-gray-900 mb-4 ${isRTL ? 'text-right' : 'text-center'}`}>
                    {t('application.documents.title')}
                  </h3>
                  <p className={`text-lg text-gray-600 max-w-2xl leading-relaxed ${isRTL ? 'text-right ml-auto' : 'text-center mx-auto'}`}>
                    {t('application.documents.subtitle')}
                  </p>
                </div>

                <div className="space-y-6">
                  {globalRequirements.requiredExternalCompanies > 0 ? (
                    <div className="space-y-6">
                      {Number(form.externalCompaniesCount) >= globalRequirements.requiredExternalCompanies ? (
                        <div className="space-y-4">
                        <div className="bg-[#ffd17a]/10 border border-[#ffd17a]/20 rounded-xl p-4">
                          <h3 className="font-semibold text-[#242021] mb-2">{t('application.documents.documentOptions')}</h3>
                          <p className="text-sm text-[#242021]/80 mb-3">
                              {t('application.documents.sufficientCompanies')}
                            </p>

                            <div className="space-y-3">
                              <label className="flex items-start gap-3 cursor-pointer p-3 border border-[#ffd17a]/20 rounded-lg hover:bg-[#ffd17a]/5">
                                <input
                                  type="radio"
                                  name="docOption"
                                  value="uploadDocs"
                                  checked={form.docOption === "uploadDocs"}
                                  onChange={handleChange}
                                  className="mt-1 text-[#ffd17a]"
                                />
                                <div>
                                  <span className="font-medium text-[#242021]">{t('application.documents.uploadCompanyDocuments')}</span>
                                  <p className="text-sm text-[#242021]/80 mt-1">{t('application.documents.haveAllDocuments')}</p>
                                </div>
                              </label>
                              <label className="flex items-start gap-3 cursor-pointer p-3 border border-[#ffd17a]/20 rounded-lg hover:bg-[#ffd17a]/5">
                                <input
                                  type="radio"
                                  name="docOption"
                                  value="passportOnly"
                                  checked={form.docOption === "passportOnly"}
                                  onChange={handleChange}
                                  className="mt-1 text-[#ffd17a]"
                                />
                                <div>
                                  <span className="font-medium text-[#242021]">{t('application.documents.provideDocumentsForMe')}</span>
                                  <p className="text-sm text-[#242021]/80 mt-1">{t('application.documents.providePassportId')}</p>
                                </div>
                              </label>
                            </div>
                          </div>

                          {form.docOption === "uploadDocs" && (
                            <div className="space-y-6">
                              <h3 className="text-lg font-semibold text-gray-900">{t('application.documents.companyDocuments')}</h3>
                              {Array.from({ length: Math.min(form.externalCompaniesCount, globalRequirements.requiredExternalCompanies) }).map((_, idx) => (
                                <div key={idx} className="border border-gray-200 rounded-xl p-4 sm:p-6">
                                    <h4 className="font-semibold text-gray-900 mb-4">
                                    {form.externalCompaniesDetails[idx]?.companyName || t('application.documents.companyNumber', { number: idx + 1 })}
                                  </h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                      <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {t('application.documents.commercialRegistration')}
                                      </label>
                                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#ffd17a]/50 transition-colors">
                                        <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                                        <input
                                          type="file"
                                          name={`cr_${idx}`}
                                          onChange={handleFileChange}
                                          className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#ffd17a]/10 file:text-[#242021]"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {t('application.documents.financialStatement')}
                                      </label>
                                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#ffd17a]/50 transition-colors">
                                        <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                                        <input
                                          type="file"
                                          name={`fs_${idx}`}
                                          onChange={handleFileChange}
                                          className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#ffd17a]/10 file:text-[#242021]"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {t('application.documents.articlesOfAssociation')}
                                      </label>
                                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#ffd17a]/50 transition-colors">
                                        <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                                        <input
                                          type="file"
                                          name={`aoa_${idx}`}
                                          onChange={handleFileChange}
                                          className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#ffd17a]/10 file:text-[#242021]"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {form.docOption === "passportOnly" && (
                            <div className="bg-[#ffd17a]/10 border border-[#ffd17a]/20 rounded-xl p-6 space-y-4">
                              <h3 className="font-semibold text-[#242021] mb-2">{t('application.documents.personalDocumentsRequired')}</h3>
                              <p className="text-sm text-[#242021]/80 mb-4">
                                {t('application.documents.uploadPersonalDocuments')}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('application.documents.passport')}</label>
                                  <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                                    touched.passportFile && errors.passportFile 
                                      ? 'border-red-300 bg-red-50/50' 
                                      : 'border-[#ffd17a]/30 hover:border-[#ffd17a]/50'
                                  }`}>
                                    <Upload className="w-6 h-6 mx-auto mb-2 text-[#ffd17a]" />
                                    <input
                                      type="file"
                                      accept="image/*,.pdf"
                                      onChange={handlePassportChange}
                                      className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#ffd17a]/20 file:text-[#242021]"
                                    />
                                  </div>
                                  {touched.passportFile && errors.passportFile && (
                                    <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                                      <X className="w-4 h-4" />
                                      {errors.passportFile}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('application.documents.iqamaIdCard')}</label>
                                  <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                                    touched.idCard && errors.idCard 
                                      ? 'border-red-300 bg-red-50/50' 
                                      : 'border-[#ffd17a]/30 hover:border-[#ffd17a]/50'
                                  }`}>
                                    <Upload className="w-6 h-6 mx-auto mb-2 text-[#ffd17a]" />
                                    <input
                                      type="file"
                                      name="idCard"
                                      onChange={handleFileChange}
                                      className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#ffd17a]/20 file:text-[#242021]"
                                    />
                                  </div>
                                  {touched.idCard && errors.idCard && (
                                    <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                                      <X className="w-4 h-4" />
                                      {errors.idCard}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-[#ffd17a]/10 border border-[#ffd17a]/20 rounded-xl p-6 space-y-4">
                          <h3 className="font-semibold text-[#242021] mb-2">{t('application.documents.weWillArrangeCompanies')}</h3>
                          <p className="text-sm text-[#242021]/80 mb-4">
                            {t('application.documents.missingCompanies', {
                              count: form.externalCompaniesCount,
                              required: globalRequirements.requiredExternalCompanies,
                              missing: globalRequirements.requiredExternalCompanies - form.externalCompaniesCount
                            })}
                          </p>
                          <div className="bg-white border border-[#ffd17a]/20 rounded-lg p-4 mb-4">
                            <h4 className="font-medium text-[#242021] mb-2">{t('application.documents.whatWeNeed')}</h4>
                            <ul className="text-sm text-[#242021]/80 space-y-1">
                              <li>• {t('application.documents.yourPassportCopy')}</li>
                              <li>• {t('application.documents.yourIqamaCopy')}</li>
                              <li>• {t('application.documents.weWillHandleRest')}</li>
                            </ul>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('application.documents.passport')}</label>
                              <div className="border-2 border-dashed border-[#ffd17a]/30 rounded-lg p-4 text-center hover:border-[#ffd17a]/50 transition-colors">
                                <Upload className="w-6 h-6 mx-auto mb-2 text-[#ffd17a]" />
                                <input
                                  type="file"
                                  accept="image/*,.pdf"
                                  onChange={handlePassportChange}
                                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#ffd17a]/20 file:text-[#242021]"
                                />
                              </div>
                            </div>
                            <div>
                              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('application.documents.iqamaIdCard')}</label>
                              <div className="border-2 border-dashed border-[#ffd17a]/30 rounded-lg p-4 text-center hover:border-[#ffd17a]/50 transition-colors">
                                <Upload className="w-6 h-6 mx-auto mb-2 text-[#ffd17a]" />
                                <input
                                  type="file"
                                  name="idCard"
                                  onChange={handleFileChange}
                                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#ffd17a]/20 file:text-[#242021]"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-[#ffd17a]/10 border border-[#ffd17a]/20 rounded-xl p-6">
                      <h3 className="font-semibold text-[#242021] mb-2">{t('application.documents.personalDocumentsRequired')}</h3>
                      <p className="text-sm text-[#242021]/80 mb-4">
                        {t('application.documents.noExternalRequirements')}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('application.documents.passport')}</label>
                              <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                                touched.passportFile && errors.passportFile 
                                  ? 'border-red-300 bg-red-50/50' 
                                  : 'border-[#ffd17a]/30 hover:border-[#ffd17a]/50'
                              }`}>
                                <Upload className="w-6 h-6 mx-auto mb-2 text-[#ffd17a]" />
                                <input
                                  type="file"
                                  name="passport"
                                  onChange={handlePassportChange}
                                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#ffd17a]/20 file:text-[#242021]"
                                />
                              </div>
                              {touched.passportFile && errors.passportFile && (
                                <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                                  <X className="w-4 h-4" />
                                  {errors.passportFile}
                                </div>
                              )}
                            </div>
                        <div>
                          <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('application.documents.iqamaIdCard')}</label>
                          <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                            touched.idCard && errors.idCard 
                              ? 'border-red-300 bg-red-50/50' 
                              : 'border-[#ffd17a]/30 hover:border-[#ffd17a]/50'
                          }`}>
                            <Upload className="w-6 h-6 mx-auto mb-2 text-[#ffd17a]" />
                            <input
                              type="file"
                              name="idCard"
                              onChange={handleFileChange}
                              className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#ffd17a]/20 file:text-[#242021]"
                            />
                          </div>
                          {touched.idCard && errors.idCard && (
                            <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                              <X className="w-4 h-4" />
                              {errors.idCard}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 7: Fee Details */}
            {step === 7 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#ffd17a] to-[#ffd17a]/80 mb-6 shadow-xl">
                    <RiyalSign className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                    {t('application.fee.title')}
                  </h3>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    {t('application.fee.subtitle')}
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      {t('application.fee.feeBreakdown')}
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-700">{t('application.fee.investorVisaFee')}</span>
                        <span className="font-medium">{t('application.fee.investorVisaFeeAmount')}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-700">{t('application.fee.passportProcessingFee')}</span>
                        <span className="font-medium">{t('application.fee.passportProcessingFeeAmount')}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-700">{t('application.fee.workPermit')}</span>
                        <span className="font-medium">{t('application.fee.workPermitAmount')}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-700">{t('application.fee.transferFee')}</span>
                        <span className="font-medium">{t('application.fee.transferFeeAmount')}</span>
                      </div>
                      <div className="flex justify-between py-3 text-lg font-bold text-gray-900 bg-white rounded-lg px-3">
                        <span>{t('application.fee.totalEstimated')}</span>
                        <span className="text-[#ffd17a]">{t('application.fee.totalEstimatedAmount')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#ffd17a]/10 border border-[#ffd17a]/20 rounded-xl p-4">
                    <h4 className="font-medium text-[#242021] mb-2">{t('application.fee.paymentInformation')}</h4>
                    <p className="text-sm text-[#242021]/80">
                      {t('application.fee.paymentDescription')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 8: Review */}
            {step === 8 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#ffd17a] to-[#ffd17a]/80 mb-6 shadow-xl">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                    {t('application.review.title')}
                  </h3>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    {t('application.review.subtitle')}
                  </p>
                </div>

                <div className="space-y-6">
                  {submitError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-red-800">
                        <X className="w-5 h-5" />
                        <span className="font-medium">{submitError}</span>
                      </div>
                    </div>
                  )}

                  <div className="bg-gradient-to-br from-[#ffd17a]/10 to-[#ffd17a]/5 border border-[#ffd17a]/20 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-[#242021] mb-4 flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      {t('application.review.readyForSubmission')}
                    </h3>
                    <p className="text-sm text-[#242021]/80 mb-4">
                      {t('application.review.applicationComplete')}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#ffd17a] rounded-full"></div>
                        <span className="text-[#242021]/80">{t('application.review.submitted')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#ffd17a]/60 rounded-full"></div>
                        <span className="text-[#242021]/80">{t('application.review.underReview')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#ffd17a]/40 rounded-full"></div>
                        <span className="text-[#242021]/80">{t('application.review.inProcess')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#ffd17a] rounded-full"></div>
                        <span className="text-[#242021]/80">{t('application.review.completed')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Application Summary */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('application.review.applicationSummary')}</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">{t('application.review.personalInformation')}</h4>
                        <div className="space-y-1 text-gray-600">
                          <p><span className="font-medium">{t('application.review.name')}</span> {form.fullName || t('application.review.notProvided')}</p>
                          <p><span className="font-medium">{t('application.review.email')}</span> {form.email || t('application.review.notProvided')}</p>
                          <p><span className="font-medium">{t('application.review.phone')}</span> {form.phone || t('application.review.notProvided')}</p>
                          <p><span className="font-medium">{t('application.review.nationality')}</span> {form.nationality || t('application.review.notProvided')}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">{t('application.review.serviceDetails')}</h4>
                        <div className="space-y-1 text-gray-600">
                          <p><span className="font-medium">{t('application.review.serviceType')}</span> {form.serviceType ? form.serviceType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : t('application.review.notSelected')}</p>
                          <p><span className="font-medium">{t('application.review.virtualOffice')}</span> {form.needVirtualOffice ? t('application.review.yes') : t('application.review.no')}</p>
                          {form.projectEstimatedValue && (
                            <p><span className="font-medium">{t('application.review.projectValue')}</span> {Number(form.projectEstimatedValue).toLocaleString()} SAR</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">{t('application.review.externalCompanies')}</h4>
                        <div className="space-y-1 text-gray-600">
                          <p><span className="font-medium">{t('application.review.count')}</span> {form.externalCompaniesCount}</p>
                          <p><span className="font-medium">{t('application.review.required')}</span> {globalRequirements.requiredExternalCompanies}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">{t('application.review.familyMembers')}</h4>
                        <div className="space-y-1 text-gray-600">
                          <p><span className="font-medium">{t('application.review.count')}</span> {form.familyMembers.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
              {step > 1 && (
                <button 
                  type="button" 
                  onClick={prevStep}
                  className="group flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md rounded-lg" 
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                  <span className="text-sm sm:text-base">{t('application.navigation.previousStep')}</span>
                </button>
              )}
              
              <div className="flex-1"></div>
              
              {step < 9 ? (
                <button 
                  type="button" 
                  onClick={nextStep}
                  className="group flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#ffd17a] to-[#ffd17a]/80 text-[#242021] font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl rounded-lg"
                >
                  <span className="text-sm sm:text-base">{t('application.navigation.continue')}</span>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              ) : (
                <button 
                  type="button" 
                  onClick={submitForm}
                  disabled={isSubmitting}
                  className={`group flex items-center justify-center gap-2 sm:gap-3 px-8 sm:px-10 py-3 sm:py-4 font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl rounded-lg ${
                    isSubmitting 
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed scale-100" 
                      : "bg-gradient-to-r from-[#ffd17a] to-[#ffd17a]/80 text-[#242021]"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm sm:text-base">{t('application.navigation.submittingApplication')}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm sm:text-base">{t('application.navigation.submitApplication')}</span>
                      <Check className="w-4 h-4 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-300" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}