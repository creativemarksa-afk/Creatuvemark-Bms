"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  FaUser,
  FaBuilding,
  FaUsers,
  FaFileAlt,
  FaClock,
  FaSpinner,
  FaExclamationTriangle,
  FaUserCheck,
  FaCheck,
  FaBan,
  FaComments,
  FaFileExport,
  FaHistory,
  FaShieldAlt,
  FaDollarSign,
  FaCog,
  FaHandshake,
  FaIdCard,
  FaPassport,
  FaChartLine,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa';
import { getApplication } from '../../../../services/applicationService';
import { paymentService } from '../../../../services/paymentService';
import Timeline from '../../../../components/Timeline';
import { SERVICE_TYPES, PARTNER_TYPES, STATUS_PROGRESS } from '../../../../utils/constants';

// Import new components
import ApplicationHeader from '../../../../components/admin/requests/ApplicationHeader';
import SummaryStat from '../../../../components/admin/requests/SummaryStat';
import Section from '../../../../components/admin/requests/Section';
import KeyValueList from '../../../../components/admin/requests/KeyValueList';
import DocumentCard from '../../../../components/admin/requests/DocumentCard';
import Tabs from '../../../../components/admin/requests/Tabs';
import RegistrationSlipGenerator from '../../../../components/admin/RegistrationSlipGenerator';
import { useTranslation } from '../../../../i18n/TranslationContext';

const ApplicationDetailsPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id;
  
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentPlanModal, setShowPaymentPlanModal] = useState(false);
  const [showRegistrationSlip, setShowRegistrationSlip] = useState(false);
  const [paymentPlanForm, setPaymentPlanForm] = useState({
    totalAmount: '',
    installmentCount: 3
  });
  const [creatingPaymentPlan, setCreatingPaymentPlan] = useState(false);

  useEffect(() => {
    if (applicationId) {
      loadApplicationDetails();
    }
  }, [applicationId]);

  const loadApplicationDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      

      if (!applicationId) {
        setError('Application ID is required');
        return;
      }

      const response = await getApplication(applicationId);
      console.log('Application details response:', response.data);
      
      if (response.success && response.data) {
        if (!response.data.client && !response.data.applicationId) {
          setError('Invalid application data received from server');
          return;
        }
        setApplication(response.data);
      } else {
        setError(response.message || 'Failed to load application details');
      }
    } catch (error) {
      console.error('Error loading application details:', error);
      if (error.response?.status === 404) {
        setError('Application not found');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to view this application');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(error.message || 'Failed to load application details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePaymentPlan = async (e) => {
    e.preventDefault();
    if (!paymentPlanForm.totalAmount || !paymentPlanForm.installmentCount) return;

    setCreatingPaymentPlan(true);
    try {
      const response = await paymentService.createPaymentPlan({
        applicationId: applicationId,
        totalAmount: parseFloat(paymentPlanForm.totalAmount),
        installmentCount: parseInt(paymentPlanForm.installmentCount)
      });

      if (response.success) {
        // Show success message and close modal
        alert('Payment plan created successfully!');
        setShowPaymentPlanModal(false);
        setPaymentPlanForm({ totalAmount: '', installmentCount: 3 });
        // Optionally reload application details to show updated status
        loadApplicationDetails();
      } else {
        alert(response.message || 'Failed to create payment plan');
      }
    } catch (error) {
      console.error('Error creating payment plan:', error);
      alert('Failed to create payment plan');
    } finally {
      setCreatingPaymentPlan(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return typeof value === 'number' ? value.toLocaleString() + ' SAR' : value + ' SAR';
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header Skeleton */}
          <div className="mb-6 sm:mb-8">
            <div className="bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-xl sm:rounded-2xl p-6 sm:p-8 animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-8 w-64 bg-gray-200 rounded"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-lg sm:rounded-xl p-4 sm:p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-6 sm:h-8 w-20 bg-gray-200 rounded"></div>
                  <div className="h-3 sm:h-4 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-xl sm:rounded-2xl p-6 sm:p-8 animate-pulse">
            <div className="space-y-4 sm:space-y-6">
              <div className="h-6 sm:h-8 w-48 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 sm:h-4 w-32 bg-gray-200 rounded"></div>
                    <div className="h-10 sm:h-12 w-full bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="bg-white/95 backdrop-blur-sm border border-red-200/50 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-red-100 rounded-full p-2">
                <FaExclamationTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-red-900">{t('admin.requestDetails.title')} - Error</h3>
                <p className="mt-2 text-sm sm:text-base text-red-700">{error}</p>
                <div className="mt-4 space-x-3">
                  <button
                    onClick={loadApplicationDetails}
                    className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                  >
                    <FaSpinner className="w-4 h-4 mr-2" />
{t('admin.requestDetails.retry')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No application found
  if (!application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
            <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <FaFileAlt className="w-8 h-8 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{t('admin.requestDetails.title')} - Not Found</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">{t('admin.requestDetails.notFound')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Prepare tab content
  const tabs = [
    {
      id: 'overview',
      label: t('admin.requestDetails.overview'),
      icon: FaFileAlt,
      content: (
        <div className="space-y-8">
            {/* Client Information */}
          <Section title={t('admin.requestDetails.clientInfo')} icon={FaUser} color="blue">
            <KeyValueList
              items={[
                {
                  label: 'Full Name',
                  value: <span className="text-lg font-semibold text-gray-900">{application.client?.name || 'N/A'}</span>
                },
                {
                  label: 'Email',
                  value: <span className="text-lg font-semibold text-gray-900">{application.client?.email || 'N/A'}</span>
                },
                {
                  label: 'Phone',
                  value: <span className="text-lg font-semibold text-gray-900">{application.client?.phone || 'N/A'}</span>
                },
                {
                  label: 'Nationality',
                  value: <span className="text-lg font-semibold text-gray-900">{application.client?.nationality || 'N/A'}</span>
                }
              ]}
              columns={2}
            />
          </Section>

            {/* Application Overview */}
          <Section title={t('admin.requestDetails.applicationInfo')} icon={FaBuilding} color="gray">
            <KeyValueList
              items={[
                {
                  label: 'Service Type',
                  value: <span className="text-lg font-semibold text-gray-900">{SERVICE_TYPES[application.serviceDetails?.serviceType] || application.serviceDetails?.serviceType || 'N/A'}</span>
                },
                {
                  label: 'Partner Type',
                  value: <span className="text-lg font-semibold text-gray-900">{PARTNER_TYPES[application.serviceDetails?.partnerType] || application.serviceDetails?.partnerType || 'N/A'}</span>
                },
                {
                  label: 'External Companies',
                  value: <span className="text-lg font-semibold text-gray-900">{application.serviceDetails?.externalCompaniesCount || application.externalCompaniesCount || 0}</span>
                },
                {
                  label: 'Virtual Office',
                  value: (
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${(application.serviceDetails?.needVirtualOffice || application.needVirtualOffice) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-lg font-semibold text-gray-900">{(application.serviceDetails?.needVirtualOffice || application.needVirtualOffice) ? 'Yes' : 'No'}</span>
                    </div>
                  )
                },
                {
                  label: 'Company Arranges External Companies',
                  value: (
                      <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${(application.serviceDetails?.companyArrangesExternalCompanies || application.companyArrangesExternalCompanies) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-lg font-semibold text-gray-900">{(application.serviceDetails?.companyArrangesExternalCompanies || application.companyArrangesExternalCompanies) ? 'Yes' : 'No'}</span>
                    </div>
                  )
                },
                ...(application.serviceDetails?.projectEstimatedValue || application.projectEstimatedValue ? [{
                  label: 'Project Estimated Value',
                  value: <span className="text-2xl font-bold text-gray-900">{formatCurrency(application.serviceDetails?.projectEstimatedValue || application.projectEstimatedValue)}</span>
                }] : [])
              ]}
              columns={2}
            />
          </Section>

            {/* Partner Information */}
          {((application.partner || application.serviceDetails?.partner) || (application.serviceDetails?.saudiPartnerName || application.saudiPartnerName)) && (
            <Section title="Partner Information" icon={FaHandshake} color="purple">
              {(application.serviceDetails?.saudiPartnerName || application.saudiPartnerName) && (
                <div className="mb-8">
                  <KeyValueList
                    items={[{
                      label: 'Saudi Partner Name',
                      value: (
                  <div className="flex items-center space-x-3">
                          <FaIdCard className="w-5 h-5 text-purple-600" />
                          <span className="text-xl font-semibold text-gray-900">{application.serviceDetails?.saudiPartnerName || application.saudiPartnerName}</span>
                    </div>
                      )
                    }]}
                    columns={1}
                  />
              </div>
            )}

              {(application.partner || application.serviceDetails?.partner) && (
                <KeyValueList
                  items={[
                    {
                      label: 'Partner Name',
                      value: <span className="text-lg font-semibold text-gray-900">{(application.partner || application.serviceDetails?.partner)?.name || 'N/A'}</span>
                    },
                    {
                      label: 'Email',
                      value: <span className="text-lg font-semibold text-gray-900">{(application.partner || application.serviceDetails?.partner)?.email || 'N/A'}</span>
                    },
                    {
                      label: 'Phone',
                      value: <span className="text-lg font-semibold text-gray-900">{(application.partner || application.serviceDetails?.partner)?.phone || 'N/A'}</span>
                    }
                  ]}
                  columns={3}
                />
              )}
            </Section>
          )}

          {/* External Companies */}
            {((application.serviceDetails?.externalCompaniesDetails || application.externalCompaniesDetails) && (application.serviceDetails?.externalCompaniesDetails || application.externalCompaniesDetails).length > 0) && (
            <Section title="External Companies" icon={FaBuilding} color="purple">
                  <div className="grid gap-6">
                    {(application.serviceDetails?.externalCompaniesDetails || application.externalCompaniesDetails).map((company, index) => (
                      <div key={index} className="p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-bold text-gray-900">Company #{index + 1}</h3>
                          <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {company.sharePercentage || 0}% Share
                          </div>
                        </div>
                    <KeyValueList
                      items={[
                        {
                          label: 'Company Name',
                          value: <span className="text-gray-900 font-medium">{company.companyName || 'N/A'}</span>
                        },
                        {
                          label: 'Country',
                          value: <span className="text-gray-900 font-medium">{company.country || 'N/A'}</span>
                        },
                        {
                          label: 'CR Number',
                          value: <span className="text-gray-900 font-mono font-medium">{company.crNumber || 'N/A'}</span>
                        }
                      ]}
                      columns={3}
                    />
                  </div>
                ))}
              </div>
            </Section>
            )}

            {/* Family Members */}
            {((application.serviceDetails?.familyMembers || application.familyMembers) && (application.serviceDetails?.familyMembers || application.familyMembers).length > 0) && (
            <Section title="Family Members" icon={FaUsers} color="green">
                  <div className="grid gap-6">
                    {(application.serviceDetails?.familyMembers || application.familyMembers).map((member, index) => (
                      <div key={index} className="p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Family Member #{index + 1}</h3>
                    <KeyValueList
                      items={[
                        {
                          label: 'Full Name',
                          value: <span className="text-gray-900 font-medium">{member.name || 'N/A'}</span>
                        },
                        {
                          label: 'Relationship',
                          value: <span className="text-gray-900 font-medium">{member.relation || 'N/A'}</span>
                        },
                        {
                          label: 'Passport Number',
                          value: <span className="text-gray-900 font-mono font-medium">{member.passportNo || 'N/A'}</span>
                        }
                      ]}
                      columns={3}
                    />
                  </div>
                ))}
              </div>
            </Section>
          )}
                    </div>
      )
    },
    {
      id: 'documents',
      label: t('admin.requestDetails.documents'),
      icon: FaFileAlt,
      badge: application.documents?.length || 0,
      content: (
        <Section title="Uploaded Documents" icon={FaFileAlt} color="amber">
          {application.documents && application.documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {application.documents.map((doc, index) => (
                <DocumentCard key={index} document={doc} />
                    ))}
                  </div>
          ) : (
            <div className="text-center py-12">
              <FaFileAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
              <p className="text-gray-500">This application doesn't have any uploaded documents yet.</p>
              </div>
            )}
        </Section>
      )
    },
    {
      id: 'timeline',
      label: t('admin.requestDetails.timeline'),
      icon: FaClock,
      content: (
        <Section title="Application Timeline" icon={FaClock} color="indigo">
                <Timeline 
                  events={application.timeline || []} 
                  currentStatus={application.status?.current || application.status}
                />
        </Section>
      )
    },
    {
      id: 'actions',
      label: t('admin.requestDetails.actions'),
      icon: FaUserCheck,
      content: (
        <Section title="Admin Actions" icon={FaUserCheck} color="emerald">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button 
                  onClick={loadApplicationDetails}
              className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
              <FaSpinner className="mr-2" />
                  Refresh Data
                </button>
                
                {application.status?.current === 'submitted' && (
                  <>
                <button className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl">
                      <FaCheck className="mr-2" />
                      Approve Application
                    </button>
                <button className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl">
                      <FaBan className="mr-2" />
                      Reject Application
                    </button>
                  </>
                )}

                {application.status?.current === 'approved' && (
                  <button 
                    onClick={() => setShowPaymentPlanModal(true)}
                    className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <FaDollarSign className="mr-2" />
                    Create Payment Plan
                  </button>
                )}
                
            <button className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white font-medium rounded-lg hover:from-yellow-700 hover:to-yellow-800 transition-all duration-200 shadow-lg hover:shadow-xl">
                  <FaComments className="mr-2" />
                  Add Internal Note
                </button>
                
            <button className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl">
              <FaUserCheck className="mr-2" />
                  Assign Employee
                </button>
                
            <button 
                  onClick={() => setShowRegistrationSlip(true)}
                  className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-lg hover:shadow-xl">
                  <FaFileExport className="mr-2" />
                  Generate Registration Slip
                </button>
                
            <button className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl">
                  <FaHistory className="mr-2" />
                  View Audit Log
                </button>
              </div>
        </Section>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Modern Header */}
        <ApplicationHeader application={application} />

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap gap-3 mb-6 sm:mb-8">
          <button
            onClick={() => setShowRegistrationSlip(true)}
            className="group flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FaFileExport className="text-base sm:text-lg" />
            <span className="text-sm sm:text-base">Generate Registration Slip</span>
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <SummaryStat
            title={t('admin.requestDetails.clientName')}
            value={application.client?.name || 'N/A'}
            icon={FaUser}
            color="blue"
          />
          <SummaryStat
            title={t('admin.requestDetails.serviceType')}
            value={SERVICE_TYPES[application.serviceDetails?.serviceType] || 'N/A'}
            icon={FaBuilding}
            color="purple"
          />
          <SummaryStat
            title={t('admin.requestDetails.externalCompanies')}
            value={application.serviceDetails?.externalCompaniesCount || 0}
            icon={FaBuilding}
            color="green"
          />
          <SummaryStat
            title={t('admin.requestDetails.documents')}
            value={application.documents?.length || 0}
            icon={FaFileAlt}
            color="orange"
          />
                </div>
                
        {/* Modern Tabs Interface */}
        <div className="bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-xl sm:rounded-2xl overflow-hidden">
          <Tabs tabs={tabs} defaultTab="overview" />
        </div>
      </div>

      {/* Payment Plan Creation Modal */}
      {showPaymentPlanModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
            <div className="bg-gradient-to-r from-[#242021] to-[#3a3537] p-6 rounded-t-3xl flex justify-between items-center">
              <div>
                <h2 className='text-2xl font-bold text-[#ffd17a]'>Create Payment Plan</h2>
                <p className="text-[#ffd17a]/70 text-sm mt-1">
                  {application?.client?.name || 'Client'} - {application?.serviceType || 'Application'}
                </p>
              </div>
              <button 
                onClick={() => setShowPaymentPlanModal(false)} 
                className="text-[#ffd17a] p-2 hover:bg-white/10 rounded-xl"
              >
                <FaTimes size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreatePaymentPlan} className="p-6 space-y-6">
              <div>
                <label className='block text-gray-700 font-semibold mb-2 text-sm'>Total Amount (SAR)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  required 
                  value={paymentPlanForm.totalAmount} 
                  onChange={(e) => setPaymentPlanForm({...paymentPlanForm, totalAmount: e.target.value})} 
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#242021]" 
                  placeholder="0.00" 
                />
              </div>

              <div>
                <label className='block text-gray-700 font-semibold mb-2 text-sm'>Number of Installments</label>
                <select 
                  value={paymentPlanForm.installmentCount} 
                  onChange={(e) => setPaymentPlanForm({...paymentPlanForm, installmentCount: parseInt(e.target.value)})} 
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#242021]"
                >
                  <option value={1}>Full Payment (1 installment)</option>
                  <option value={3}>3 Installments</option>
                  <option value={4}>4 Installments</option>
                  <option value={5}>5 Installments</option>
                </select>
              </div>

              {paymentPlanForm.totalAmount && paymentPlanForm.installmentCount > 1 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <h3 className="font-semibold text-blue-900 mb-2">Payment Schedule Preview</h3>
                  <div className="text-sm text-blue-800">
                    <div className="flex justify-between mb-1">
                      <span>Total Amount:</span>
                      <span className="font-semibold">SAR {paymentPlanForm.totalAmount}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Installments:</span>
                      <span className="font-semibold">{paymentPlanForm.installmentCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Per Installment:</span>
                      <span className="font-semibold">SAR {(paymentPlanForm.totalAmount / paymentPlanForm.installmentCount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowPaymentPlanModal(false)} 
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!paymentPlanForm.totalAmount || creatingPaymentPlan}
                  className="flex-1 py-3 bg-gradient-to-r from-[#242021] to-[#3a3537] text-[#ffd17a] font-bold rounded-xl hover:from-[#3a3537] hover:to-[#4a4547] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingPaymentPlan ? 'Creating...' : 'Create Payment Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Registration Slip Modal */}
      {showRegistrationSlip && application && (
        <RegistrationSlipGenerator
          application={application}
          onClose={() => setShowRegistrationSlip(false)}
        />
      )}
    </div>
  );
};

export default ApplicationDetailsPage;