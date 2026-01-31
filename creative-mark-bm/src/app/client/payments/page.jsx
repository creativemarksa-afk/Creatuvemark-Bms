"use client";
import { useState, useEffect, useMemo } from "react";
import { 
  CreditCard, 
  DollarSign as RiyalSign, 
  TrendingUp, 
  Calendar, 
  Download, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ChevronRight, 
  Plus, 
  FileText, 
  X, 
  Upload, 
  Eye, 
  AlertCircle, 
  Receipt,
  Filter,
  SortAsc,
  SortDesc,
  ChevronDown,
  History,
  BarChart3,
  TrendingDown,
  Info,
  ExternalLink
} from "lucide-react";
import { useTranslation } from "../../../i18n/TranslationContext";
import { useAuth } from "../../../contexts/AuthContext";
import { paymentService } from "../../../services/paymentService";
import BeautifulInvoice from "../../../components/admin/BeautifulInvoice";

export default function ClientPaymentDashboard() {
  const { t } = useTranslation();
  const { user: currentUser, loading, requireAuth } = useAuth();
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false);
  const [isReceiptUploadOpen, setIsReceiptUploadOpen] = useState(false);
  const [isPaymentPlanModalOpen, setIsPaymentPlanModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState("full");
  const [sortBy, setSortBy] = useState("newest");
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("all");
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [selectedPaymentForInvoice, setSelectedPaymentForInvoice] = useState(null);

  // Load payments on component mount
  useEffect(() => {
    if (loading) return;
    if (!currentUser || currentUser.role !== 'client') return;
    
    loadPayments();
  }, [currentUser, loading]);

  const loadPayments = async () => {
    try {
      const response = await paymentService.getClientPayments();
      setPayments(response.data || []);
    } catch (error) {
      console.error("Error loading payments:", error);
      setPayments([]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handlePaymentSubmission = async (e) => {
    e.preventDefault();
    if (!selectedFile || !selectedPayment) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('receipt', selectedFile);
      formData.append('paymentPlan', selectedPaymentPlan);

      const response = await paymentService.submitPayment(
        selectedPayment._id,
        formData
      );

      if (response.success) {
        await loadPayments();
        setIsReceiptUploadOpen(false);
        setSelectedFile(null);
        setSelectedPayment(null);
        setSelectedPaymentPlan("full");
        alert('Payment submitted successfully!');
      } else {
        alert(response.message || 'Failed to submit payment');
      }
    } catch (error) {
      console.error("Error submitting payment:", error);
      alert('Failed to submit payment. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleInstallmentUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !selectedPayment) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('receipt', selectedFile);

      let response;
      
      // If this is the first installment (installmentIndex is 0) or full payment
      if (selectedPayment.installmentIndex === 0 || selectedPayment.installmentIndex === null || selectedPayment.installmentIndex === undefined) {
        // Submit payment with payment plan
        formData.append('paymentPlan', selectedPaymentPlan);
        response = await paymentService.submitPayment(
          selectedPayment._id,
          formData
        );
      } else {
        // Upload subsequent installment receipt
        response = await paymentService.uploadInstallmentReceipt(
          selectedPayment._id,
          selectedPayment.installmentIndex,
          formData
        );
      }

      if (response.success) {
        await loadPayments();
        setIsReceiptUploadOpen(false);
        setSelectedFile(null);
        setSelectedPayment(null);
        setSelectedPaymentPlan("full");
        alert('Payment submitted successfully!');
      } else {
        alert(response.message || 'Failed to upload receipt');
      }
    } catch (error) {
      console.error("Error uploading receipt:", error);
      alert('Failed to upload receipt. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Enhanced filtering and sorting logic
  const filteredAndSortedPayments = useMemo(() => {
    let filtered = payments.filter((payment) => {
      const matchesFilter = filter === "all" || 
        (filter === "pending" && payment.status === "pending") ||
        (filter === "submitted" && payment.status === "submitted") ||
        (filter === "approved" && payment.status === "approved") ||
        (filter === "rejected" && payment.status === "rejected");
      
      const matchesSearch = payment.applicationId?.serviceType?.toLowerCase().includes(searchQuery.toLowerCase());
      
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
    const totalAmount = payments.reduce((sum, payment) => sum + payment.totalAmount, 0);
    const pendingAmount = payments.filter(p => p.status === "pending").reduce((sum, payment) => sum + payment.totalAmount, 0);
    const submittedAmount = payments.filter(p => p.status === "submitted").reduce((sum, payment) => sum + payment.totalAmount, 0);
    const approvedAmount = payments.filter(p => p.status === "approved").reduce((sum, payment) => sum + payment.totalAmount, 0);
    const rejectedAmount = payments.filter(p => p.status === "rejected").reduce((sum, payment) => sum + payment.totalAmount, 0);
    
    // Additional statistics
    const totalPayments = payments.length;
    const pendingPayments = payments.filter(p => p.status === "pending").length;
    const submittedPayments = payments.filter(p => p.status === "submitted").length;
    const approvedPayments = payments.filter(p => p.status === "approved").length;
    const rejectedPayments = payments.filter(p => p.status === "rejected").length;
    
    // Average payment amount
    const averageAmount = totalPayments > 0 ? totalAmount / totalPayments : 0;
    
    // Completion rate
    const completionRate = totalPayments > 0 ? ((approvedPayments / totalPayments) * 100) : 0;
    
    return {
      totalAmount,
      pendingAmount,
      submittedAmount,
      approvedAmount,
      rejectedAmount,
      totalPayments,
      pendingPayments,
      submittedPayments,
      approvedPayments,
      rejectedPayments,
      averageAmount,
      completionRate
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
      day: 'numeric'
    });
  };

  const openPaymentPlanModal = (payment) => {
    setSelectedPayment(payment);
    setIsPaymentPlanModalOpen(true);
  };

  const openReceiptUpload = (payment, installmentIndex = null) => {
    setSelectedPayment({ ...payment, installmentIndex });
    setIsReceiptUploadOpen(true);
    setIsPaymentPlanModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#242021] mb-2 tracking-tight">
                {t('payments.dashboard.title')}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                {t('payments.dashboard.subtitle')}
              </p>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-gray-200 w-full lg:w-auto">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                  activeTab === "overview" 
                    ? "bg-[#242021] text-[#ffd17a] shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <BarChart3 size={16} />
                <span className="hidden sm:inline">{t('payments.client.overview')}</span>
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
                <span className="hidden sm:inline">{t('payments.client.history')}</span>
              </button>
            </div>
          </div>

          {/* Statistics Cards - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {/* Total Amount - Primary Card */}
            <div className="p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl bg-gradient-to-br from-[#242021] to-[#3a3537] text-[#ffd17a] shadow-xl lg:shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className='text-xs sm:text-sm font-semibold uppercase tracking-wide opacity-80'>
                  {t('payments.dashboard.totalAmount')}
                </span>
                <div className="p-1.5 sm:p-2 rounded-lg lg:rounded-xl bg-[#ffd17a]/20">
                  <RiyalSign size={16} className="sm:w-[18px] sm:h-[18px]" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-1">
                {stats.totalAmount.toFixed(2)} SAR
              </div>
              <div className='text-xs opacity-70'>
                {stats.totalPayments} {t('payments.title')}
              </div>
            </div>

            {/* Pending Amount */}
            <div className="p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className='text-xs sm:text-sm font-semibold uppercase tracking-wide text-gray-600'>
                  {t('payments.dashboard.pendingAmount')}
                </span>
                <div className="p-1.5 sm:p-2 rounded-lg lg:rounded-xl bg-amber-100">
                  <Clock size={16} className="sm:w-[18px] sm:h-[18px] text-amber-600" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-1">
                {stats.pendingAmount.toFixed(2)} SAR
              </div>
              <div className="text-xs text-gray-500">
                {stats.pendingPayments} {t('payments.dashboard.awaitingPayment')}
              </div>
            </div>

            {/* Submitted Amount */}
            <div className="p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className='text-xs sm:text-sm font-semibold uppercase tracking-wide text-gray-600'>
                  {t('payments.dashboard.submittedAmount')}
                </span>
                <div className="p-1.5 sm:p-2 rounded-lg lg:rounded-xl bg-blue-100">
                  <Upload size={16} className="sm:w-[18px] sm:h-[18px] text-blue-600" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-1">
                {stats.submittedAmount.toFixed(2)} SAR
              </div>
              <div className='text-xs text-gray-500'>
                {stats.submittedPayments} {t('payments.dashboard.underReview')}
              </div>
            </div>

            {/* Approved Amount */}
            <div className="p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className='text-xs sm:text-sm font-semibold uppercase tracking-wide text-gray-600'>
                  {t('payments.dashboard.approvedAmount')}
                </span>
                <div className="p-1.5 sm:p-2 rounded-lg lg:rounded-xl bg-green-100">
                  <CheckCircle size={16} className="sm:w-[18px] sm:h-[18px] text-green-600" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-1">
                {stats.approvedAmount.toFixed(2)} SAR
              </div>
              <div className='text-xs text-gray-500'>
                {stats.approvedPayments} {t('payments.dashboard.verified')}
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
                    {activeTab === "overview" ? t('payments.dashboard.paymentPlans') : t('payments.dashboard.paymentHistory')}
                  </h2>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setIsHistoryModalOpen(true)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                      <History size={16} />
                      <span className="hidden sm:inline">{t('payments.client.viewAll')}</span>
                    </button>
                    <button className="px-3 py-2 bg-[#242021] text-[#ffd17a] text-sm font-semibold rounded-xl hover:bg-[#3a3537] transition-colors flex items-center gap-2">
                      <Download size={16} />
                      <span className="hidden sm:inline">{t('payments.client.export')}</span>
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
                        placeholder={t('payments.dashboard.searchByService')} 
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
                      <option value="all">{t('payments.client.allTime')}</option>
                      <option value="today">{t('payments.client.today')}</option>
                      <option value="week">{t('payments.client.thisWeek')}</option>
                      <option value="month">{t('payments.client.thisMonth')}</option>
                      <option value="year">{t('payments.client.thisYear')}</option>
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
                      <option value="newest">{t('payments.client.newestFirst')}</option>
                      <option value="oldest">{t('payments.client.oldestFirst')}</option>
                      <option value="amount-high">{t('payments.client.amountHighToLow')}</option>
                      <option value="amount-low">{t('payments.client.amountLowToHigh')}</option>
                      <option value="status">{t('payments.client.status')}</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                </div>

                {/* Status Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "all", label: t('payments.all'), count: stats.totalPayments },
                    { key: "pending", label: t('payments.status.pending'), count: stats.pendingPayments },
                    { key: "submitted", label: t('payments.status.submitted'), count: stats.submittedPayments },
                    { key: "approved", label: t('payments.status.approved'), count: stats.approvedPayments },
                    { key: "rejected", label: t('payments.status.rejected'), count: stats.rejectedPayments }
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('payments.client.noPaymentsFound')}</h3>
                    <p className="text-gray-500">{t('payments.client.tryAdjustingFilters')}</p>
                  </div>
                ) : (
                  filteredAndSortedPayments.map((payment) => (
                    <div key={payment._id} className="group p-4 sm:p-6 bg-gray-50 hover:bg-white rounded-2xl transition-all border border-gray-200 hover:shadow-md hover:border-gray-300">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Payment Info */}
                        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                          <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-[#242021] to-[#3a3537] text-[#ffd17a] flex-shrink-0">
                            <Receipt size={18} className="sm:w-5 sm:h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                                {payment.applicationId?.serviceType?.charAt(0).toUpperCase() + payment.applicationId?.serviceType?.slice(1)} Application
                              </h3>
                              <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border w-fit ${getStatusStyle(payment.status)}`}>
                                {getStatusIcon(payment.status)}
                                {payment.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <RiyalSign size={14} className="text-gray-400" />
                                <span className="font-medium">{payment.totalAmount} SAR</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar size={14} className="text-gray-400" />
                                <span>{t('payments.client.due')}: {payment.dueDate ? formatDate(payment.dueDate) : 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={14} className="text-gray-400" />
                                <span>{t('payments.client.created')}: {formatDate(payment.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 sm:gap-3 flex-shrink-0 flex-wrap">
                          {payment.status === "pending" && (
                            <button 
                              onClick={() => openPaymentPlanModal(payment)}
                              className="px-3 sm:px-4 py-2 bg-[#242021] text-[#ffd17a] text-xs sm:text-sm font-semibold rounded-lg hover:bg-[#3a3537] transition-colors whitespace-nowrap"
                            >
                              {t('payments.dashboard.choosePaymentPlan')}
                            </button>
                          )}
                          {(payment.status === "approved" || payment.status === "submitted") && (
                            <button 
                              onClick={() => { setSelectedPaymentForInvoice(payment); setIsInvoiceOpen(true); }}
                              className="px-3 sm:px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                              title={t('invoice.title')}
                            >
                              <FileText size={14} className="sm:w-4 sm:h-4" />
                              <span className="hidden md:inline">{t('invoice.title')}</span>
                            </button>
                          )}
                          <button 
                            onClick={() => { setSelectedPayment(payment); setIsPaymentDetailsOpen(true); }} 
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors group-hover:bg-white"
                          >
                            <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
                          </button>
                        </div>
                      </div>

                      {/* Installments Preview */}
                      {payment.paymentPlan === "installments" && payment.installments && payment.installments.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('payments.client.installmentSchedule')}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {payment.installments.slice(0, 3).map((installment, index) => (
                              <div key={index} className="p-3 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-semibold text-gray-700">
                                    {t('payments.installments.installment')} {index + 1}
                                  </span>
                                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyle(installment.status)}`}>
                                    {getStatusIcon(installment.status)}
                                    {installment.status}
                                  </span>
                                </div>
                                <div className="text-lg font-bold text-gray-900 mb-2">{installment.amount} SAR</div>
                                {installment.status === "pending" && (
                                  <button
                                    onClick={() => openReceiptUpload(payment, index)}
                                    className="w-full px-3 py-1.5 bg-[#242021] text-[#ffd17a] text-xs font-semibold rounded-lg hover:bg-[#3a3537] transition-colors"
                                  >
                                    {t('payments.installments.uploadReceipt')}
                                  </button>
                                )}
                              </div>
                            ))}
                            {payment.installments.length > 3 && (
                              <div className="p-3 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center">
                                <span className="text-sm text-gray-500">
                                  +{payment.installments.length - 3} {t('payments.client.more')}
                                </span>
                              </div>
                            )}
                          </div>
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
              <h2 className='text-lg sm:text-xl font-bold text-[#242021] mb-4 sm:mb-6'>{t('payments.quickActions')}</h2>
              <div className="space-y-3">
                <button className="w-full p-3 sm:p-4 bg-gradient-to-r from-[#242021] to-[#3a3537] text-[#ffd17a] rounded-xl text-left flex items-center gap-3 hover:shadow-lg transition-all">
                  <Upload size={18} className="sm:w-5 sm:h-5" />
                  <span className='font-medium text-sm'>{t('payments.dashboard.uploadReceipt')}</span>
                </button>
                <button className="w-full p-3 sm:p-4 bg-white rounded-xl text-left flex items-center gap-3 border border-gray-200 hover:shadow-md transition-all">
                  <Download size={18} className="sm:w-5 sm:h-5 text-gray-600" />
                  <span className='font-medium text-gray-900 text-sm'>{t('payments.dashboard.downloadStatement')}</span>
                </button>
                <button 
                  onClick={() => setIsHistoryModalOpen(true)}
                  className="w-full p-3 sm:p-4 bg-white rounded-xl text-left flex items-center gap-3 border border-gray-200 hover:shadow-md transition-all"
                >
                  <Calendar size={18} className="sm:w-5 sm:h-5 text-gray-600" />
                  <span className='font-medium text-gray-900 text-sm'>{t('payments.dashboard.paymentHistory')}</span>
                </button>
              </div>
            </div>

            {/* Payment Insights */}
            <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-gray-200 p-4 sm:p-6">
              <h3 className='text-lg font-bold text-[#242021] mb-4'>{t('payments.client.paymentInsights')}</h3>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={16} className="text-blue-600" />
                    <span className="text-sm font-semibold text-blue-900">{t('payments.client.averagePayment')}</span>
                  </div>
                  <div className="text-lg font-bold text-blue-900">{stats.averageAmount.toFixed(2)} SAR</div>
                </div>
                
                <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-sm font-semibold text-green-900">{t('payments.client.completionRate')}</span>
                  </div>
                  <div className="text-lg font-bold text-green-900">{stats.completionRate.toFixed(1)}%</div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={16} className="text-amber-600" />
                    <span className="text-sm font-semibold text-amber-900">{t('payments.client.pendingPayments')}</span>
                  </div>
                  <div className="text-lg font-bold text-amber-900">{stats.pendingPayments}</div>
                </div>
              </div>
            </div>

            {/* Payment Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl lg:rounded-3xl border border-blue-200 p-4 sm:p-6">
              <h3 className='text-lg font-bold text-gray-900 mb-3 sm:mb-4'>{t('payments.dashboard.paymentTips')}</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>{t('payments.dashboard.chooseBetweenFull')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>{t('payments.dashboard.uploadClearReceipts')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>{t('payments.dashboard.verifiedWithin24Hours')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                <h2 className='text-2xl font-bold text-[#ffd17a]'>{t('payments.client.completePaymentHistory')}</h2>
                <p className="text-[#ffd17a]/70 text-sm mt-1">{t('payments.client.viewAllTransactions')}</p>
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
                      <option value="all">{t('payments.client.allStatus')}</option>
                      <option value="pending">{t('payments.client.pending')}</option>
                      <option value="submitted">{t('payments.client.submitted')}</option>
                      <option value="approved">{t('payments.client.approved')}</option>
                      <option value="rejected">{t('payments.client.rejected')}</option>
                    </select>
                  </div>
                  <div className="relative">
                    <select 
                      value={dateRange} 
                      onChange={(e) => setDateRange(e.target.value)}
                      className="w-full bg-white text-gray-800 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#242021] border border-gray-200 text-sm"
                    >
                      <option value="all">{t('payments.client.allTime')}</option>
                      <option value="today">{t('payments.client.today')}</option>
                      <option value="week">{t('payments.client.thisWeek')}</option>
                      <option value="month">{t('payments.client.thisMonth')}</option>
                      <option value="year">{t('payments.client.thisYear')}</option>
                    </select>
                  </div>
                  <div className="relative">
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-white text-gray-800 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#242021] border border-gray-200 text-sm"
                    >
                      <option value="newest">{t('payments.client.newestFirst')}</option>
                      <option value="oldest">{t('payments.client.oldestFirst')}</option>
                      <option value="amount-high">{t('payments.client.amountHighToLow')}</option>
                      <option value="amount-low">{t('payments.client.amountLowToHigh')}</option>
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
                              <span className="font-medium">{t('payments.client.amount')}:</span> {payment.totalAmount} SAR
                            </div>
                            <div>
                              <span className="font-medium">{t('payments.client.paymentPlan')}:</span> {payment.paymentPlan}
                            </div>
                            <div>
                              <span className="font-medium">{t('payments.client.dueDate')}:</span> {payment.dueDate ? formatDate(payment.dueDate) : 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">{t('payments.client.created')}:</span> {formatDate(payment.createdAt)}
                            </div>
                          </div>
                          
                          {/* Installment Details */}
                          {payment.paymentPlan === "installments" && payment.installments && payment.installments.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('payments.client.installmentDetails')}</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {payment.installments.map((installment, idx) => (
                                  <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-semibold text-gray-700">
                                        {t('payments.client.installment')} {idx + 1}
                                      </span>
                                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyle(installment.status)}`}>
                                        {getStatusIcon(installment.status)}
                                        {installment.status}
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      <div className="font-medium">{installment.amount} SAR</div>
                                      {installment.date && (
                                        <div className="text-xs text-gray-500">{t('payments.client.due')}: {formatDate(installment.date)}</div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 lg:flex-col">
                        {(payment.status === "approved" || payment.status === "submitted") && (
                          <button 
                            onClick={() => { setSelectedPaymentForInvoice(payment); setIsInvoiceOpen(true); setIsHistoryModalOpen(false); }} 
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                          >
                            <FileText size={16} />
                            {t('invoice.title')}
                          </button>
                        )}
                        <button 
                          onClick={() => { setSelectedPayment(payment); setIsPaymentDetailsOpen(true); setIsHistoryModalOpen(false); }} 
                          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                          <Eye size={16} />
                          {t('payments.client.viewDetails')}
                        </button>
                        {payment.status === "pending" && (
                          <button 
                            onClick={() => { openPaymentPlanModal(payment); setIsHistoryModalOpen(false); }}
                            className="px-4 py-2 bg-[#242021] text-[#ffd17a] text-sm font-semibold rounded-lg hover:bg-[#3a3537] transition-colors"
                          >
                            {t('payments.client.makePayment')}
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('payments.client.noPaymentHistoryFound')}</h3>
                    <p className="text-gray-500">{t('payments.client.noPaymentsMatchFilters')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Plan Selection Modal */}
      {isPaymentPlanModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl lg:rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-[#242021] to-[#3a3537] p-4 sm:p-6 rounded-t-2xl lg:rounded-t-3xl flex justify-between items-center">
              <div>
                <h2 className='text-xl sm:text-2xl font-bold text-[#ffd17a]'>{t('payments.planSelection.title')}</h2>
                <p className="text-[#ffd17a]/70 text-sm mt-1">
                  {selectedPayment.applicationId?.serviceType?.charAt(0).toUpperCase() + selectedPayment.applicationId?.serviceType?.slice(1)} Application
                </p>
              </div>
              <button onClick={() => setIsPaymentPlanModalOpen(false)} className="text-[#ffd17a] p-2 hover:bg-white/10 rounded-xl">
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">{t('payments.planSelection.paymentDetails')}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>{t('payments.planSelection.totalAmount')}:</span>
                    <span className="font-semibold">{selectedPayment.totalAmount} SAR</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('payments.planSelection.dueDate')}:</span>
                    <span className="font-semibold">{selectedPayment.dueDate ? formatDate(selectedPayment.dueDate) : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">{t('payments.planSelection.selectPaymentOption')}</h3>
                
                <div 
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedPaymentPlan === "full" 
                      ? "border-[#242021] bg-[#242021]/5" 
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedPaymentPlan("full")}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedPaymentPlan === "full" 
                        ? "border-[#242021] bg-[#242021]" 
                        : "border-gray-300"
                    }`}>
                      {selectedPaymentPlan === "full" && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">💰 {t('payments.planSelection.payInFull')}</div>
                      <div className="text-sm text-gray-600">{t('payments.planSelection.payCompleteAmount')}: {selectedPayment.totalAmount} SAR</div>
                    </div>
                  </div>
                </div>

                <div 
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedPaymentPlan === "installments" 
                      ? "border-[#242021] bg-[#242021]/5" 
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedPaymentPlan("installments")}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedPaymentPlan === "installments" 
                        ? "border-[#242021] bg-[#242021]" 
                        : "border-gray-300"
                    }`}>
                      {selectedPaymentPlan === "installments" && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">🧾 {t('payments.planSelection.payInInstallments')}</div>
                      <div className="text-sm text-gray-600">{t('payments.planSelection.payIn3Parts')}: {(selectedPayment.totalAmount / 3).toFixed(2)} SAR {t('payments.planSelection.each')}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsPaymentPlanModalOpen(false)} 
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  {t('payments.client.cancel')}
                </button>
                <button 
                  type="button" 
                  onClick={() => openReceiptUpload(selectedPayment)}
                  className="flex-1 py-3 bg-gradient-to-r from-[#242021] to-[#3a3537] text-[#ffd17a] font-bold rounded-xl hover:from-[#3a3537] hover:to-[#4a4547] transition-all"
                >
{t('payments.planSelection.continueToUpload')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Upload Modal */}
      {isReceiptUploadOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl lg:rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-[#242021] to-[#3a3537] p-4 sm:p-6 rounded-t-2xl lg:rounded-t-3xl flex justify-between items-center">
              <div>
                <h2 className='text-xl sm:text-2xl font-bold text-[#ffd17a]'>{t('payments.receiptUpload.title')}</h2>
                <p className="text-[#ffd17a]/70 text-sm mt-1">
                  {selectedPayment.installmentIndex !== undefined 
                    ? `Installment #${selectedPayment.installmentIndex + 1} - ${(selectedPayment.totalAmount / 3).toFixed(2)} SAR`
                    : `Total Amount - ${selectedPayment.totalAmount} SAR`
                  }
                </p>
              </div>
              <button onClick={() => setIsReceiptUploadOpen(false)} className="text-[#ffd17a] p-2 hover:bg-white/10 rounded-xl">
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>
            <form onSubmit={selectedPayment.installmentIndex !== undefined ? handleInstallmentUpload : handlePaymentSubmission} className="p-6 space-y-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">{t('payments.client.paymentDetails')}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>{t('payments.client.amount')}:</span>
                    <span className="font-semibold">
                      {selectedPayment.installmentIndex !== undefined 
                        ? `${(selectedPayment.totalAmount / 3).toFixed(2)} SAR`
                        : `${selectedPayment.totalAmount} SAR`
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('payments.client.paymentPlan')}:</span>
                    <span className="font-semibold">
                      {selectedPayment.installmentIndex !== undefined ? 'Installments' : selectedPaymentPlan}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className='block text-gray-700 font-semibold mb-2 text-sm'>{t('payments.client.receiptImage')}</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="receipt-upload"
                  />
                  <label htmlFor="receipt-upload" className="cursor-pointer">
                    {selectedFile ? (
                      <div className="space-y-2">
                        <div className="text-green-600">
                          <CheckCircle size={48} className="mx-auto" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{t('payments.client.clickToChange')}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-gray-400">
                          <Upload size={48} className="mx-auto" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">{t('payments.client.clickToUpload')}</p>
                        <p className="text-xs text-gray-500">{t('payments.client.supportedFormats')}</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">{t('payments.client.important')}:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• {t('payments.client.ensureReceiptClear')}</li>
                      <li>• {t('payments.client.includeTransactionRef')}</li>
                      <li>• {t('payments.client.paymentVerifiedWithin24Hours')}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsReceiptUploadOpen(false)} 
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  {t('payments.client.cancel')}
                </button>
                <button 
                  type="submit" 
                  disabled={!selectedFile || uploading}
                  className="flex-1 py-3 bg-gradient-to-r from-[#242021] to-[#3a3537] text-[#ffd17a] font-bold rounded-xl hover:from-[#3a3537] hover:to-[#4a4547] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? t('payments.client.uploading') : t('payments.client.uploadReceipt')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}