"use client";
import { useState, useEffect, useMemo } from "react";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Download, 
  Search, 
  Filter, 
  AlertCircle, 
  Receipt, 
  User, 
  Calendar, 
  DollarSign,
  ChevronDown,
  SortAsc,
  SortDesc,
  TrendingUp,
  TrendingDown,
  BarChart3,
  History,
  ExternalLink,
  X,
  FileText
} from "lucide-react";
import Swal from 'sweetalert2';
import { useTranslation } from "../../../i18n/TranslationContext";
import { useAuth } from "../../../contexts/AuthContext";
import { paymentService } from "../../../services/paymentService";
import BeautifulInvoice from "../../../components/admin/BeautifulInvoice";

export default function AdminPaymentsPage() {
  const { t } = useTranslation();
  const { user: currentUser, loading, requireAuth } = useAuth();
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [verificationAction, setVerificationAction] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [dateRange, setDateRange] = useState("all");
  const [activeTab, setActiveTab] = useState("pending");
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [selectedPaymentForInvoice, setSelectedPaymentForInvoice] = useState(null);

  // Load payments on component mount
  useEffect(() => {
    if (loading) return;
    if (!currentUser || currentUser.role !== 'admin') return;
    
    loadPayments();
  }, [currentUser, loading]);

  const loadPayments = async () => {
    try {
      // Load ALL payments (not just pending) to show payment history
      const response = await paymentService.getAllPayments();
      // getAllPayments returns { payments, stats }, extract the payments array
      setPayments(response.data?.payments || []);
    } catch (error) {
      console.error("Error loading payments:", error);
      setPayments([]);
      
      // Show error alert only if it's a critical error
      if (error.response?.status >= 500) {
        Swal.fire({
          title: 'Loading Error',
          html: `
            <div class="text-center">
              <p class="text-gray-700 mb-3">Failed to load payments from the server.</p>
              <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p class="text-sm text-amber-700">The page will retry automatically, or you can refresh manually.</p>
              </div>
            </div>
          `,
          icon: 'warning',
          confirmButtonColor: '#f59e0b',
          confirmButtonText: 'Refresh Page',
          showCancelButton: true,
          cancelButtonColor: '#6b7280',
          cancelButtonText: 'Dismiss',
          background: '#ffffff',
          customClass: {
            popup: 'rounded-2xl shadow-2xl',
            title: 'text-gray-900 font-semibold',
            content: 'text-gray-600',
            confirmButton: 'rounded-lg font-medium px-6 py-3',
            cancelButton: 'rounded-lg font-medium px-6 py-3'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
      }
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    if (!verificationAction || !selectedPayment) return;

    // Show loading alert
    Swal.fire({
      title: verificationAction === 'approve' ? 
        'Approving Payment...' : 
        'Rejecting Payment...',
      html: `
        <div class="text-center">
          <p class="text-gray-600 mb-2">Please wait while we process the payment verification.</p>
          ${typeof selectedPayment.installmentIndex === 'number' ? 
            `<p class="text-sm text-gray-500">Installment #${selectedPayment.installmentIndex + 1}</p>` : 
            '<p class="text-sm text-gray-500">Full Payment</p>'
          }
        </div>
      `,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      background: '#ffffff',
      customClass: {
        popup: 'rounded-2xl shadow-2xl',
        title: 'text-gray-900 font-semibold'
      },
      didOpen: () => {
        Swal.showLoading();
      }
    });

    setVerifying(true);
    try {
      let response;
      
      // Check if it's an installment (must be a number, not null or undefined)
      if (typeof selectedPayment.installmentIndex === 'number') {
        // Verify installment
        response = await paymentService.verifyInstallmentPayment(
          selectedPayment._id,
          selectedPayment.installmentIndex,
          {
            action: verificationAction,
            adminNotes: adminNotes
          }
        );
      } else {
        // Verify full payment
        response = await paymentService.verifyPayment(
          selectedPayment._id,
          {
            action: verificationAction,
            adminNotes: adminNotes
          }
        );
      }

      if (response.success) {
        await loadPayments();
        setIsVerificationModalOpen(false);
        setVerificationAction("");
        setAdminNotes("");
        setSelectedPayment(null);
        
        // Show success alert
        Swal.fire({
          title: verificationAction === 'approve' ? 
            'Payment Approved!' : 
            'Payment Rejected',
          html: `
            <div class="text-center">
              <div class="mb-4">
                <div class="w-16 h-16 mx-auto mb-3 rounded-full ${
                  verificationAction === 'approve' ? 
                  'bg-gradient-to-br from-green-400 to-green-600' : 
                  'bg-gradient-to-br from-red-400 to-red-600'
                } flex items-center justify-center">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    ${verificationAction === 'approve' ? 
                      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>' :
                      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>'
                    }
                  </svg>
                </div>
              </div>
              <p class="text-gray-700 mb-2">
                ${verificationAction === 'approve' ? 
                  'The payment has been successfully approved and processed.' :
                  'The payment has been rejected.'
                }
              </p>
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-3">
                <p class="text-sm text-gray-600">
                  <strong>Client:</strong> ${selectedPayment.clientId?.fullName || 'N/A'}
                </p>
                <p class="text-sm text-gray-600">
                  <strong>Amount:</strong> ${
                    typeof selectedPayment.installmentIndex === 'number' ? 
                    (selectedPayment.installments[selectedPayment.installmentIndex]?.amount || 0) :
                    selectedPayment.totalAmount
                  } SAR
                </p>
              </div>
            </div>
          `,
          icon: 'success',
          confirmButtonColor: verificationAction === 'approve' ? '#059669' : '#dc2626',
          confirmButtonText: 'OK',
          background: '#ffffff',
          customClass: {
            popup: 'rounded-2xl shadow-2xl',
            title: 'text-gray-900 font-bold',
            content: 'text-gray-600',
            confirmButton: 'rounded-lg font-medium px-6 py-3'
          }
        });
      } else {
        // Show error alert
        Swal.fire({
          title: 'Verification Failed',
          html: `
            <div class="text-center">
              <p class="text-gray-700 mb-3">${response.message || 'Failed to process payment verification'}</p>
              <div class="bg-red-50 border border-red-200 rounded-lg p-3">
                <p class="text-sm text-red-700">Please try again or contact support if the issue persists.</p>
              </div>
            </div>
          `,
          icon: 'error',
          confirmButtonColor: '#dc2626',
          confirmButtonText: 'OK',
          background: '#ffffff',
          customClass: {
            popup: 'rounded-2xl shadow-2xl',
            title: 'text-gray-900 font-semibold',
            content: 'text-gray-600',
            confirmButton: 'rounded-lg font-medium px-6 py-3'
          }
        });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      
      // Show error alert
      Swal.fire({
        title: 'Verification Error',
        html: `
          <div class="text-center">
            <p class="text-gray-700 mb-3">An error occurred while verifying the payment.</p>
            <div class="bg-red-50 border border-red-200 rounded-lg p-3">
              <p class="text-sm text-red-700 font-mono">${error.message || 'Unknown error'}</p>
            </div>
          </div>
        `,
        icon: 'error',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'Try Again',
        background: '#ffffff',
        customClass: {
          popup: 'rounded-2xl shadow-2xl',
          title: 'text-gray-900 font-semibold',
          content: 'text-gray-600',
          confirmButton: 'rounded-lg font-medium px-6 py-3'
        }
      });
    } finally {
      setVerifying(false);
    }
  };

  const openVerificationModal = async (payment, installmentIndex = null, action = "") => {
    // Show confirmation dialog first
    const result = await Swal.fire({
      title: action === 'approve' ? 'Approve Payment?' : 'Reject Payment?',
      html: `
        <div class="text-left">
          <p class="text-gray-700 mb-4">
            Are you sure you want to <strong class="${action === 'approve' ? 'text-green-600' : 'text-red-600'}">${action}</strong> this payment?
          </p>
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p class="text-gray-600 text-sm mb-2">
              <strong>Client:</strong> ${payment.clientId?.fullName || 'N/A'}
            </p>
            <p class="text-gray-600 text-sm mb-2">
              <strong>Amount:</strong> ${
                typeof installmentIndex === 'number' ? 
                (payment.installments[installmentIndex]?.amount || (payment.totalAmount / 3)) :
                payment.totalAmount
              } SAR
            </p>
            <p class="text-gray-600 text-sm">
              <strong>Type:</strong> ${
                typeof installmentIndex === 'number' ? 
                `Installment #${installmentIndex + 1}` : 
                'Full Payment'
              }
            </p>
          </div>
          ${action === 'reject' ? `
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
              <p class="text-sm text-amber-800">⚠️ The client will be notified about this rejection.</p>
            </div>
          ` : `
            <div class="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
              <p class="text-sm text-green-800">✓ The client will be notified and the application will proceed.</p>
            </div>
          `}
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: action === 'approve' ? '#059669' : '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, ${action === 'approve' ? 'Approve' : 'Reject'}`,
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      background: '#ffffff',
      customClass: {
        popup: 'rounded-2xl shadow-2xl',
        title: 'text-gray-900 font-semibold',
        content: 'text-gray-600',
        confirmButton: 'rounded-lg font-medium px-6 py-3',
        cancelButton: 'rounded-lg font-medium px-6 py-3'
      }
    });

    // If confirmed, open the verification modal
    if (result.isConfirmed) {
      setSelectedPayment({ ...payment, installmentIndex });
      setVerificationAction(action);
      setIsVerificationModalOpen(true);
      setIsPaymentDetailsOpen(false);
    }
  };

  // Enhanced filtering and sorting logic
  const filteredAndSortedPayments = useMemo(() => {
    let filtered = payments.filter((payment) => {
      const matchesFilter = filter === "all" || 
        (filter === "submitted" && payment.status === "submitted") ||
        (filter === "approved" && payment.status === "approved") ||
        (filter === "rejected" && payment.status === "rejected") ||
        (filter === "pending" && payment.status === "pending") ||
        (filter === "installments" && payment.paymentPlan === "installments") ||
        (filter === "full" && payment.paymentPlan === "full");
      
      const matchesSearch = payment.applicationId?.serviceType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           payment.clientId?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Date range filtering
      let matchesDateRange = true;
      if (dateRange !== "all") {
        const now = new Date();
        const paymentDate = new Date(payment.createdAt);
        
        switch (dateRange) {
          case "today":
            matchesDateRange = paymentDate.toDateString() === now.toDateString();
            break;
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDateRange = paymentDate >= weekAgo;
            break;
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDateRange = paymentDate >= monthAgo;
            break;
          case "year":
            const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            matchesDateRange = paymentDate >= yearAgo;
            break;
        }
      }
      
      return matchesFilter && matchesSearch && matchesDateRange;
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "amount-high":
          return b.totalAmount - a.totalAmount;
        case "amount-low":
          return a.totalAmount - b.totalAmount;
        case "status":
          const statusOrder = { pending: 0, submitted: 1, approved: 2, rejected: 3 };
          return statusOrder[a.status] - statusOrder[b.status];
        default:
          return 0;
      }
    });

    return filtered;
  }, [payments, filter, searchQuery, dateRange, sortBy]);

  const stats = useMemo(() => {
    const totalPayments = payments.length;
    const submittedPayments = payments.filter(p => p.status === "submitted").length;
    const approvedPayments = payments.filter(p => p.status === "approved").length;
    const rejectedPayments = payments.filter(p => p.status === "rejected").length;
    const pendingPayments = payments.filter(p => p.status === "pending").length;
    const fullPayments = payments.filter(p => p.paymentPlan === "full").length;
    const installmentPayments = payments.filter(p => p.paymentPlan === "installments").length;
    
    // Additional statistics
    const totalAmount = payments.reduce((sum, payment) => sum + payment.totalAmount, 0);
    const submittedAmount = payments.filter(p => p.status === "submitted").reduce((sum, payment) => sum + payment.totalAmount, 0);
    const approvedAmount = payments.filter(p => p.status === "approved").reduce((sum, payment) => sum + payment.totalAmount, 0);
    const averageAmount = totalPayments > 0 ? totalAmount / totalPayments : 0;
    
    // Processing time statistics (mock data - you might want to calculate this from actual data)
    const avgProcessingTime = "2.5 hours"; // This could be calculated from actual verification times
    
    return {
      totalPayments,
      submittedPayments,
      approvedPayments,
      rejectedPayments,
      pendingPayments,
      fullPayments,
      installmentPayments,
      totalAmount,
      submittedAmount,
      approvedAmount,
      averageAmount,
      avgProcessingTime
    };
  }, [payments]);

  const getStatusIcon = (status) => {
    if (status === "approved") return <CheckCircle size={16} className="text-green-600" />;
    if (status === "submitted") return <Clock size={16} className="text-blue-600" />;
    if (status === "rejected") return <XCircle size={16} className="text-red-600" />;
    if (status === "pending") return <Clock size={16} className="text-amber-600" />;
    return null;
  };

  const getStatusStyle = (status) => {
    if (status === "approved") return "bg-green-50 text-green-700 border-green-200";
    if (status === "submitted") return "bg-blue-50 text-blue-700 border-blue-200";
    if (status === "rejected") return "bg-red-50 text-red-700 border-red-200";
    if (status === "pending") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#242021] mb-2 tracking-tight">
                {t('admin.paymentManagement.paymentVerification')}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                {t('admin.paymentManagement.reviewAndVerify')}
              </p>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-gray-200 w-full lg:w-auto">
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                  activeTab === "pending" 
                    ? "bg-[#242021] text-[#ffd17a] shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Clock size={16} />
                <span className="hidden sm:inline">{t('admin.paymentManagement.pending')}</span>
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                  activeTab === "history" 
                    ? "bg-[#242021] text-[#ffd17a] shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <History size={16} />
                <span className="hidden sm:inline">{t('admin.paymentManagement.history')}</span>
              </button>
            </div>
          </div>

          {/* Statistics Cards - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {/* Total Pending - Primary Card */}
            <div className="p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl bg-gradient-to-br from-[#242021] to-[#3a3537] text-[#ffd17a] shadow-xl lg:shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className='text-xs sm:text-sm font-semibold uppercase tracking-wide opacity-80'>
                  {t('admin.paymentManagement.totalPayments') || 'Total Payments'}
                </span>
                <div className="p-1.5 sm:p-2 rounded-lg lg:rounded-xl bg-[#ffd17a]/20">
                  <DollarSign size={16} className="sm:w-[18px] sm:h-[18px]" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-1">
                {stats.totalPayments}
              </div>
              <div className='text-xs opacity-70'>
                {t('admin.paymentManagement.payments')}
              </div>
            </div>

            {/* Submitted Payments */}
            <div className="p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className='text-xs sm:text-sm font-semibold uppercase tracking-wide text-gray-600'>
                  {t('admin.paymentManagement.submitted')}
                </span>
                <div className="p-1.5 sm:p-2 rounded-lg lg:rounded-xl bg-blue-100">
                  <Receipt size={16} className="sm:w-[18px] sm:h-[18px] text-blue-600" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-1">
                {stats.submittedPayments}
              </div>
              <div className="text-xs text-gray-500">
                {t('admin.paymentManagement.awaitingReview')}
              </div>
            </div>

            {/* Full Payments */}
            <div className="p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className='text-xs sm:text-sm font-semibold uppercase tracking-wide text-gray-600'>
                  {t('admin.paymentManagement.fullPayments')}
                </span>
                <div className="p-1.5 sm:p-2 rounded-lg lg:rounded-xl bg-green-100">
                  <DollarSign size={16} className="sm:w-[18px] sm:h-[18px] text-green-600" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-1">
                {stats.fullPayments}
              </div>
              <div className='text-xs text-gray-500'>
                {t('admin.paymentManagement.oneTime')}
              </div>
            </div>

            {/* Installment Payments */}
            <div className="p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className='text-xs sm:text-sm font-semibold uppercase tracking-wide text-gray-600'>
                  {t('admin.paymentManagement.installments')}
                </span>
                <div className="p-1.5 sm:p-2 rounded-lg lg:rounded-xl bg-purple-100">
                  <Calendar size={16} className="sm:w-[18px] sm:h-[18px] text-purple-600" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-1">
                {stats.installmentPayments}
              </div>
              <div className='text-xs text-gray-500'>
                {t('admin.paymentManagement.multiPart')}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
          {/* Payment List - Takes up more space on larger screens */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-gray-200 p-4 sm:p-6">
              {/* Header with Filters */}
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className='text-xl sm:text-2xl font-bold text-[#242021]'>
                    {activeTab === "pending" ? t('admin.paymentManagement.pendingPayments') : t('admin.paymentManagement.paymentHistory')}
                  </h2>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setIsHistoryModalOpen(true)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                      <History size={16} />
                      <span className="hidden sm:inline">{t('admin.paymentManagement.viewAll')}</span>
                    </button>
                    <button className="px-3 py-2 bg-[#242021] text-[#ffd17a] text-sm font-semibold rounded-xl hover:bg-[#3a3537] transition-colors flex items-center gap-2">
                      <Download size={16} />
                      <span className="hidden sm:inline">{t('admin.paymentManagement.export')}</span>
                    </button>
                  </div>
                </div>

                {/* Enhanced Filter Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Search */}
                  <div className="lg:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="text" 
                        placeholder={t('admin.paymentManagement.searchPlaceholder')} 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className="w-full bg-gray-50 text-gray-800 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#242021] border border-gray-200 text-sm" 
                      />
                    </div>
                  </div>

                  {/* Date Range Filter */}
                  <div className="relative">
                    <select 
                      value={dateRange} 
                      onChange={(e) => setDateRange(e.target.value)}
                      className="w-full bg-gray-50 text-gray-800 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#242021] border border-gray-200 text-sm appearance-none"
                    >
                      <option value="all">{t('admin.paymentManagement.allTime')}</option>
                      <option value="today">{t('admin.paymentManagement.today')}</option>
                      <option value="week">{t('admin.paymentManagement.thisWeek')}</option>
                      <option value="month">{t('admin.paymentManagement.thisMonth')}</option>
                      <option value="year">{t('admin.paymentManagement.thisYear')}</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  </div>

                  {/* Sort By */}
                  <div className="relative">
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-gray-50 text-gray-800 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#242021] border border-gray-200 text-sm appearance-none"
                    >
                      <option value="newest">{t('admin.paymentManagement.newestFirst')}</option>
                      <option value="oldest">{t('admin.paymentManagement.oldestFirst')}</option>
                      <option value="amount-high">{t('admin.paymentManagement.amountHighToLow')}</option>
                      <option value="amount-low">{t('admin.paymentManagement.amountLowToHigh')}</option>
                      <option value="status">{t('admin.paymentManagement.status')}</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                </div>

                {/* Status Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                  {                  [
                    { key: "all", label: t('admin.paymentManagement.all'), count: stats.totalPayments },
                    { key: "submitted", label: t('admin.paymentManagement.submitted'), count: stats.submittedPayments },
                    { key: "approved", label: t('admin.paymentManagement.approved') || 'Approved', count: stats.approvedPayments },
                    { key: "rejected", label: t('admin.paymentManagement.rejected') || 'Rejected', count: stats.rejectedPayments },
                    { key: "full", label: t('admin.paymentManagement.full'), count: stats.fullPayments },
                    { key: "installments", label: t('admin.paymentManagement.installments'), count: stats.installmentPayments }
                  ].map(({ key, label, count }) => (
                    <button 
                      key={key}
                      onClick={() => setFilter(key)} 
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                        filter === key 
                          ? "bg-[#242021] text-[#ffd17a] shadow-sm" 
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {label}
                      <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                        filter === key ? "bg-[#ffd17a]/20 text-[#ffd17a]" : "bg-gray-200 text-gray-600"
                      }`}>
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment List */}
              <div className="space-y-3 sm:space-y-4 max-h-[70vh] overflow-y-auto">
                {filteredAndSortedPayments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Receipt size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('admin.paymentManagement.noPaymentsFound')}</h3>
                    <p className="text-gray-500">{t('admin.paymentManagement.tryAdjustingFilters')}</p>
                  </div>
                ) : (
                  filteredAndSortedPayments.map((payment) => (
                    <div key={payment._id} className="group p-4 sm:p-6 bg-gray-50 hover:bg-white rounded-2xl transition-all border border-gray-200 hover:shadow-md hover:border-gray-300">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Payment Info */}
                        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                          <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-[#242021] to-[#3a3537] text-[#ffd17a] flex-shrink-0">
                            <Receipt size={18} className="sm:w-5 sm:h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                                {payment.applicationId?.serviceType?.charAt(0).toUpperCase() + payment.applicationId?.serviceType?.slice(1)} {t('admin.paymentManagement.application')}
                              </h3>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border w-fit ${getStatusStyle(payment.status)}`}>
                                  {getStatusIcon(payment.status)}
                                  {payment.status}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                                  payment.paymentPlan === "full" 
                                    ? "bg-green-50 text-green-700 border-green-200" 
                                    : "bg-purple-50 text-purple-700 border-purple-200"
                                }`}>
                                  {payment.paymentPlan}
                                </span>
                              </div>
                            </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <User size={14} className="text-gray-400" />
                                  <span className="font-medium">{payment.clientId?.fullName}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign size={14} className="text-gray-400" />
                                  <span className="font-medium">{payment.totalAmount} SAR</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar size={14} className="text-gray-400" />
                                  <span>{t('admin.paymentManagement.submitted')}: {payment.createdAt ? formatDate(payment.createdAt) : t('admin.paymentManagement.nA')}</span>
                                </div>
                              </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 sm:gap-3 flex-shrink-0 flex-wrap">
                          {payment.status === "submitted" && (
                            <>
                              <button 
                                onClick={() => openVerificationModal(payment, null, "approve")}
                                className="px-3 sm:px-4 py-2 bg-green-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 sm:gap-2"
                              >
                                <CheckCircle size={14} className="sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">{t('admin.paymentManagement.approve')}</span>
                              </button>
                              <button 
                                onClick={() => openVerificationModal(payment, null, "reject")}
                                className="px-3 sm:px-4 py-2 bg-red-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1 sm:gap-2"
                              >
                                <XCircle size={14} className="sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">{t('admin.paymentManagement.reject')}</span>
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => { setSelectedPaymentForInvoice(payment); setIsInvoiceOpen(true); }}
                            className="px-3 sm:px-4 py-2 bg-[#242021] text-[#ffd17a] text-xs sm:text-sm font-semibold rounded-lg hover:bg-[#3a3537] transition-colors flex items-center gap-1 sm:gap-2"
                            title="Generate Invoice"
                          >
                            <FileText size={14} className="sm:w-4 sm:h-4" />
                            <span className="hidden md:inline">Invoice</span>
                          </button>
                          <button 
                            onClick={() => { setSelectedPayment(payment); setIsPaymentDetailsOpen(true); }} 
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors group-hover:bg-white"
                            title="View Details"
                          >
                            <Eye size={16} className="text-gray-400 group-hover:text-gray-600" />
                          </button>
                        </div>
                      </div>

                      {/* Installments Preview */}
                      {payment.paymentPlan === "installments" && payment.installments && payment.installments.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('admin.paymentManagement.installmentSchedule')}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {payment.installments.map((installment, index) => (
                              <div key={index} className="p-3 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-semibold text-gray-700">
                                    {t('admin.paymentManagement.installment')} {index + 1}
                                  </span>
                                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyle(installment.status)}`}>
                                    {getStatusIcon(installment.status)}
                                    {installment.status}
                                  </span>
                                </div>
                                <div className="text-lg font-bold text-gray-900 mb-2">{installment.amount} SAR</div>
                                {installment.status === "submitted" && (
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => openVerificationModal(payment, index, "approve")}
                                      className="flex-1 px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700 transition-colors"
                                    >
                                      {t('admin.paymentManagement.approve')}
                                    </button>
                                    <button
                                      onClick={() => openVerificationModal(payment, index, "reject")}
                                      className="flex-1 px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 transition-colors"
                                    >
                                      {t('admin.paymentManagement.reject')}
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Receipt Preview */}
                      {(payment.receiptImage || (payment.installments && payment.installments.some(inst => inst.receiptImage))) && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Receipt size={16} className="text-gray-600" />
                            <span className="text-sm font-semibold text-gray-700">{t('admin.paymentManagement.paymentReceipts')}</span>
                          </div>
                          
                          {/* Main Payment Receipt */}
                          {payment.receiptImage && (
                            <div className="mb-4 p-3 bg-white rounded-xl border border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-gray-700">{t('admin.paymentManagement.mainPaymentReceipt')}</span>
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">{t('admin.paymentManagement.fullPayment')}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <img 
                                  src={payment.receiptImage} 
                                  alt="Main Payment Receipt" 
                                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-200"
                                />
                                <div className="flex-1">
                                  <p className="text-sm text-gray-600 mb-1">{t('admin.paymentManagement.mainPaymentReceiptUploaded')}</p>
                                  <button 
                                    onClick={() => window.open(payment.receiptImage, '_blank')}
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                  >
                                    <Eye size={14} />
                                    {t('admin.paymentManagement.viewFullSize')}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Installment Receipts */}
                          {payment.installments && payment.installments.some(inst => inst.receiptImage) && (
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium text-gray-700">{t('admin.paymentManagement.installmentReceipts')}</h4>
                              {payment.installments.map((installment, index) => (
                                installment.receiptImage && (
                                  <div key={index} className="p-3 bg-white rounded-xl border border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-sm font-medium text-gray-700">{t('admin.paymentManagement.installment')} {index + 1} {t('admin.paymentManagement.receipt')}</span>
                                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                                        installment.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        installment.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        installment.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-700'
                                      }`}>
                                        {installment.status}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <img 
                                        src={installment.receiptImage} 
                                        alt={`Installment ${index + 1} Receipt`} 
                                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-200"
                                      />
                                      <div className="flex-1">
                                        <p className="text-sm text-gray-600 mb-1">
                                          {t('admin.paymentManagement.amount')}: {installment.amount} SAR
                                        </p>
                                        <p className="text-sm text-gray-600 mb-1">
                                          {t('admin.paymentManagement.uploaded')}: {installment.uploadedAt ? formatDate(installment.uploadedAt) : t('admin.paymentManagement.nA')}
                                        </p>
                                        <button 
                                          onClick={() => window.open(installment.receiptImage, '_blank')}
                                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                        >
                                          <Eye size={14} />
                                          {t('admin.paymentManagement.viewFullSize')}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-4 sm:space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-gray-200 p-4 sm:p-6">
              <h2 className='text-lg sm:text-xl font-bold text-[#242021] mb-4 sm:mb-6'>{t('admin.paymentManagement.quickActions')}</h2>
              <div className="space-y-3">
                <button className="w-full p-3 sm:p-4 bg-gradient-to-r from-[#242021] to-[#3a3537] text-[#ffd17a] rounded-xl text-left flex items-center gap-3 hover:shadow-lg transition-all">
                  <CheckCircle size={18} className="sm:w-5 sm:h-5" />
                  <span className='font-medium text-sm'>{t('admin.paymentManagement.bulkApprove')}</span>
                </button>
                <button className="w-full p-3 sm:p-4 bg-white rounded-xl text-left flex items-center gap-3 border border-gray-200 hover:shadow-md transition-all">
                  <FileText size={18} className="sm:w-5 sm:h-5 text-gray-600" />
                  <div>
                    <span className='font-medium text-gray-900 text-sm block'>Generate Invoices</span>
                    <span className='text-xs text-gray-500'>Bulk invoice generation</span>
                  </div>
                </button>
                <button className="w-full p-3 sm:p-4 bg-white rounded-xl text-left flex items-center gap-3 border border-gray-200 hover:shadow-md transition-all">
                  <Download size={18} className="sm:w-5 sm:h-5 text-gray-600" />
                  <span className='font-medium text-gray-900 text-sm'>{t('admin.paymentManagement.exportReports')}</span>
                </button>
                <button 
                  onClick={() => setIsHistoryModalOpen(true)}
                  className="w-full p-3 sm:p-4 bg-white rounded-xl text-left flex items-center gap-3 border border-gray-200 hover:shadow-md transition-all"
                >
                  <History size={18} className="sm:w-5 sm:h-5 text-gray-600" />
                  <span className='font-medium text-gray-900 text-sm'>{t('admin.paymentManagement.viewHistory')}</span>
                </button>
              </div>
            </div>

            {/* Payment Insights */}
            <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-gray-200 p-4 sm:p-6">
              <h3 className='text-lg font-bold text-[#242021] mb-4'>{t('admin.paymentManagement.paymentInsights')}</h3>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={16} className="text-blue-600" />
                    <span className="text-sm font-semibold text-blue-900">{t('admin.paymentManagement.totalAmount')}</span>
                  </div>
                  <div className="text-lg font-bold text-blue-900">{stats.totalAmount.toFixed(2)} SAR</div>
                </div>
                
                <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-sm font-semibold text-green-900">{t('admin.paymentManagement.averageAmount')}</span>
                  </div>
                  <div className="text-lg font-bold text-green-900">{stats.averageAmount.toFixed(2)} SAR</div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={16} className="text-amber-600" />
                    <span className="text-sm font-semibold text-amber-900">{t('admin.paymentManagement.avgProcessingTime')}</span>
                  </div>
                  <div className="text-lg font-bold text-amber-900">{stats.avgProcessingTime}</div>
                </div>
              </div>
            </div>

            {/* Admin Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl lg:rounded-3xl border border-blue-200 p-4 sm:p-6">
              <h3 className='text-lg font-bold text-gray-900 mb-3 sm:mb-4'>{t('admin.paymentManagement.adminTips')}</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>{t('admin.paymentManagement.reviewReceiptsCarefully')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>{t('admin.paymentManagement.addDetailedNotes')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>{t('admin.paymentManagement.processWithin24Hours')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Verification Modal - Extra Compact */}
      {isVerificationModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[70vh] sm:max-h-[75vh] my-2 flex flex-col">
            {/* Header - Extra Compact */}
            <div className="bg-gradient-to-r from-[#242021] to-[#3a3537] p-2 sm:p-3 rounded-t-xl flex justify-between items-center gap-2 flex-shrink-0">
              <div className="flex-1 min-w-0">
                <h2 className='text-sm sm:text-base font-bold text-[#ffd17a] break-words leading-tight'>
                  {verificationAction === 'approve' ? t('admin.paymentManagement.approvePayment') : t('admin.paymentManagement.rejectPayment')}
                </h2>
                <p className="text-[#ffd17a]/80 text-xs leading-tight">
                  {typeof selectedPayment.installmentIndex === 'number'
                    ? `Installment #${selectedPayment.installmentIndex + 1}`
                    : t('admin.paymentManagement.fullPayment')
                  }
                </p>
              </div>
              <button 
                onClick={() => setIsVerificationModalOpen(false)} 
                className="text-[#ffd17a] p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
              >
                <X size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            </div>
            
            {/* Scrollable Content - Extra Compact */}
            <div className="overflow-y-auto flex-1 p-2 sm:p-3">
              <form onSubmit={handleVerification} className="space-y-2 sm:space-y-3">
                {/* Extra Compact Payment Details */}
                <div className="p-2 bg-gray-50 rounded border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-1 text-xs flex items-center gap-1">
                    <User size={11} className="text-gray-600" />
                    {t('admin.paymentManagement.paymentDetails')}
                  </h3>
                  <div className="space-y-0.5 text-xs text-gray-600">
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">{t('admin.paymentManagement.client')}:</span>
                      <span className="font-semibold text-right break-words text-gray-900">{selectedPayment.clientId?.fullName}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">{t('admin.paymentManagement.amount')}:</span>
                      <span className="font-bold text-gray-900">
                        {typeof selectedPayment.installmentIndex === 'number'
                          ? selectedPayment.installments[selectedPayment.installmentIndex]?.amount || (selectedPayment.totalAmount / 3).toFixed(2)
                          : selectedPayment.totalAmount
                        } SAR
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">{t('admin.paymentManagement.service')}:</span>
                      <span className="font-semibold text-right break-words text-gray-900">
                        {selectedPayment.applicationId?.serviceType?.charAt(0).toUpperCase() + selectedPayment.applicationId?.serviceType?.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Receipt Image - Extra Compact - Only relevant receipt */}
                {(() => {
                  // If verifying a specific installment, show only that installment's receipt
                  if (typeof selectedPayment.installmentIndex === 'number' && selectedPayment.installments) {
                    const installment = selectedPayment.installments[selectedPayment.installmentIndex];
                    if (installment?.receiptImage) {
                      return (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1 text-xs flex items-center gap-1">
                            <Receipt size={11} className="text-gray-600" />
                            {t('admin.paymentManagement.installment')} #{selectedPayment.installmentIndex + 1} {t('admin.paymentManagement.receipt')}
                          </h3>
                          <div className="border border-gray-200 rounded p-1.5 bg-gray-50">
                            <div className="mb-1 text-xs text-gray-600 flex justify-between items-center">
                              <span className="font-medium">{installment.amount} SAR</span>
                              {installment.uploadedAt && (
                                <span className="text-xs text-gray-400">{new Date(installment.uploadedAt).toLocaleDateString()}</span>
                              )}
                            </div>
                            <img 
                              src={installment.receiptImage} 
                              alt={`Installment ${selectedPayment.installmentIndex + 1} Receipt`} 
                              className="w-full max-h-32 sm:max-h-36 object-contain rounded border border-gray-200 bg-white"
                            />
                          </div>
                        </div>
                      );
                    }
                  }
                  // If verifying full payment, show main receipt only
                  else if (selectedPayment.receiptImage) {
                    return (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1 text-xs flex items-center gap-1">
                          <Receipt size={11} className="text-gray-600" />
                          {t('admin.paymentManagement.paymentReceipt')}
                        </h3>
                        <div className="border border-gray-200 rounded p-1.5 bg-gray-50">
                          <img 
                            src={selectedPayment.receiptImage} 
                            alt="Payment Receipt" 
                            className="w-full max-h-32 sm:max-h-36 object-contain rounded border border-gray-200 bg-white"
                          />
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Extra Compact Admin Notes */}
                <div>
                  <label className='block text-gray-700 font-semibold mb-1 text-xs flex items-center gap-1'>
                    <FileText size={11} />
                    {t('admin.paymentManagement.adminNotes')}
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder={t('admin.paymentManagement.addNotesPlaceholder')}
                    className="w-full p-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#242021] resize-none text-xs"
                    rows={2}
                  />
                </div>

                {/* Extra Compact Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded p-2">
                  <div className="flex items-start gap-1.5">
                    <AlertCircle size={12} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-800 leading-tight">
                      {verificationAction === "approve" 
                        ? t('admin.paymentManagement.approveMessage')
                        : t('admin.paymentManagement.rejectMessage')
                      }
                    </p>
                  </div>
                </div>

                {/* Action Buttons - Extra Compact & Sticky */}
                <div className="flex gap-2 pt-1 sticky bottom-0 bg-white pb-1 -mx-2 px-2 sm:-mx-3 sm:px-3">
                  <button 
                    type="button" 
                    onClick={() => setIsVerificationModalOpen(false)} 
                    className="flex-1 py-1.5 bg-gray-100 text-gray-700 font-semibold rounded hover:bg-gray-200 transition-colors text-xs"
                  >
                    {t('admin.paymentManagement.cancel')}
                  </button>
                  <button 
                    type="submit" 
                    disabled={verifying}
                    className={`flex-1 py-1.5 font-bold rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs ${
                      verificationAction === "approve"
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
                    {verifying ? '...' : `${verificationAction === "approve" ? '✓ ' + t('admin.paymentManagement.approve') : '✗ ' + t('admin.paymentManagement.reject')}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Beautiful Invoice - Bilingual */}
      {isInvoiceOpen && selectedPaymentForInvoice && (
        <BeautifulInvoice
          payment={selectedPaymentForInvoice}
          onClose={() => {
            setIsInvoiceOpen(false);
            setSelectedPaymentForInvoice(null);
          }}
        />
      )}

      {/* Payment History Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-[#242021] to-[#3a3537] p-6 rounded-t-3xl flex justify-between items-center">
              <div>
                <h2 className='text-2xl font-bold text-[#ffd17a]'>{t('admin.paymentManagement.completePaymentHistory')}</h2>
                <p className="text-[#ffd17a]/70 text-sm mt-1">{t('admin.paymentManagement.viewAllTransactions')}</p>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-[#ffd17a] p-2 hover:bg-white/10 rounded-xl">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* History Filters */}
              <div className="mb-6 p-4 bg-gray-50 rounded-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="relative">
                    <select 
                      value={filter} 
                      onChange={(e) => setFilter(e.target.value)}
                      className="w-full bg-white text-gray-800 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#242021] border border-gray-200 text-sm"
                    >
                      <option value="all">{t('admin.paymentManagement.allStatus')}</option>
                      <option value="submitted">{t('admin.paymentManagement.submitted')}</option>
                      <option value="approved">{t('admin.paymentManagement.approved')}</option>
                      <option value="rejected">{t('admin.paymentManagement.rejected')}</option>
                    </select>
                  </div>
                  <div className="relative">
                    <select 
                      value={dateRange} 
                      onChange={(e) => setDateRange(e.target.value)}
                      className="w-full bg-white text-gray-800 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#242021] border border-gray-200 text-sm"
                    >
                      <option value="all">{t('admin.paymentManagement.allTime')}</option>
                      <option value="today">{t('admin.paymentManagement.today')}</option>
                      <option value="week">{t('admin.paymentManagement.thisWeek')}</option>
                      <option value="month">{t('admin.paymentManagement.thisMonth')}</option>
                      <option value="year">{t('admin.paymentManagement.thisYear')}</option>
                    </select>
                  </div>
                  <div className="relative">
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-white text-gray-800 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#242021] border border-gray-200 text-sm"
                    >
                      <option value="newest">{t('admin.paymentManagement.newestFirst')}</option>
                      <option value="oldest">{t('admin.paymentManagement.oldestFirst')}</option>
                      <option value="amount-high">{t('admin.paymentManagement.amountHighToLow')}</option>
                      <option value="amount-low">{t('admin.paymentManagement.amountLowToHigh')}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment History Timeline */}
              <div className="space-y-4">
                {filteredAndSortedPayments.map((payment, index) => (
                  <div key={payment._id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-[#242021] to-[#3a3537] text-[#ffd17a] flex-shrink-0">
                          <Receipt size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {payment.applicationId?.serviceType?.charAt(0).toUpperCase() + payment.applicationId?.serviceType?.slice(1)} Application
                            </h3>
                            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border w-fit ${getStatusStyle(payment.status)}`}>
                              {getStatusIcon(payment.status)}
                              {payment.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">{t('admin.paymentManagement.client')}:</span> {payment.clientId?.fullName}
                            </div>
                            <div>
                              <span className="font-medium">{t('admin.paymentManagement.amount')}:</span> {payment.totalAmount} SAR
                            </div>
                            <div>
                              <span className="font-medium">{t('admin.paymentManagement.paymentPlan')}:</span> {payment.paymentPlan}
                            </div>
                            <div>
                              <span className="font-medium">{t('admin.paymentManagement.submitted')}:</span> {formatDate(payment.createdAt)}
                            </div>
                          </div>
                          
                          {/* Installment Details */}
                          {payment.paymentPlan === "installments" && payment.installments && payment.installments.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('admin.paymentManagement.installmentDetails')}</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {payment.installments.map((installment, idx) => (
                                  <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-semibold text-gray-700">
                                        {t('admin.paymentManagement.installment')} {idx + 1}
                                      </span>
                                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyle(installment.status)}`}>
                                        {getStatusIcon(installment.status)}
                                        {installment.status}
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      <div className="font-medium">{installment.amount} SAR</div>
                                      {installment.date && (
                                        <div className="text-xs text-gray-500">{t('admin.paymentManagement.due')}: {formatDate(installment.date)}</div>
                                      )}
                                      {installment.uploadedAt && (
                                        <div className="text-xs text-gray-500">{t('admin.paymentManagement.uploaded')}: {formatDate(installment.uploadedAt)}</div>
                                      )}
                                    </div>
                                    {installment.receiptImage && (
                                      <div className="mt-2">
                                        <img 
                                          src={installment.receiptImage} 
                                          alt={`Installment ${idx + 1} Receipt`} 
                                          className="w-full h-20 object-cover rounded-lg border border-gray-200"
                                        />
                                        <button 
                                          onClick={() => window.open(installment.receiptImage, '_blank')}
                                          className="text-xs text-blue-600 hover:text-blue-800 mt-1 flex items-center gap-1"
                                        >
                                          <Eye size={12} />
                                          {t('admin.paymentManagement.viewReceipt')}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Receipt Summary */}
                          {(payment.receiptImage || (payment.installments && payment.installments.some(inst => inst.receiptImage))) && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('admin.paymentManagement.receiptSummary')}</h4>
                              <div className="space-y-2">
                                {payment.receiptImage && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <CheckCircle size={14} className="text-green-600" />
                                    <span>{t('admin.paymentManagement.mainPaymentReceiptUploaded')}</span>
                                  </div>
                                )}
                                {payment.installments && payment.installments.map((installment, idx) => (
                                  installment.receiptImage && (
                                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                      <CheckCircle size={14} className="text-green-600" />
                                      <span>{t('admin.paymentManagement.installment')} {idx + 1} {t('admin.paymentManagement.receiptUploaded')}</span>
                                    </div>
                                  )
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 lg:flex-col">
                        <button 
                          onClick={() => { setSelectedPaymentForInvoice(payment); setIsInvoiceOpen(true); }} 
                          className="px-4 py-2 bg-[#242021] text-[#ffd17a] text-sm font-semibold rounded-lg hover:bg-[#3a3537] transition-colors flex items-center gap-2"
                        >
                          <FileText size={16} />
                          Invoice
                        </button>
                        <button 
                          onClick={() => { setSelectedPayment(payment); setIsPaymentDetailsOpen(true); setIsHistoryModalOpen(false); }} 
                          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                          <Eye size={16} />
                          {t('admin.paymentManagement.viewDetails')}
                        </button>
                        {payment.status === "submitted" && (
                          <button 
                            onClick={() => { openVerificationModal(payment, null, "approve"); setIsHistoryModalOpen(false); }}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
                          >
                            {t('admin.paymentManagement.verifyPayment')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredAndSortedPayments.length === 0 && (
                  <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Receipt size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('admin.paymentManagement.noPaymentHistoryFound')}</h3>
                    <p className="text-gray-500">{t('admin.paymentManagement.noPaymentsMatchFilters')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}