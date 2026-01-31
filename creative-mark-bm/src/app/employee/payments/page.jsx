"use client";
import { useState, useEffect } from "react";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Upload, 
  Search, 
  Filter,
  DollarSign,
  FileText,
  AlertCircle,
  Check,
  X,
  Users,
  Calendar
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { paymentService } from "../../../services/paymentService";

// Mock data for development
const mockPaymentPlans = [
  {
    _id: "plan1",
    applicationId: { _id: "app1", serviceType: "commercial", status: "approved", userId: { _id: "user1", fullName: "John Doe", email: "john@example.com" } },
    totalAmount: 1500,
    installmentCount: 3,
    status: "active",
    installments: [
      { _id: "inst1", installmentNumber: 1, amount: 500, dueDate: "2024-11-01", status: "paid", receiptUrl: "receipt1.jpg", verifiedByAdmin: true },
      { _id: "inst2", installmentNumber: 2, amount: 500, dueDate: "2024-12-01", status: "pending", receiptUrl: null, verifiedByAdmin: false },
      { _id: "inst3", installmentNumber: 3, amount: 500, dueDate: "2025-01-01", status: "pending", receiptUrl: null, verifiedByAdmin: false },
    ]
  },
  {
    _id: "plan2",
    applicationId: { _id: "app2", serviceType: "engineering", status: "approved", userId: { _id: "user2", fullName: "Jane Smith", email: "jane@example.com" } },
    totalAmount: 2000,
    installmentCount: 4,
    status: "active",
    installments: [
      { _id: "inst4", installmentNumber: 1, amount: 500, dueDate: "2024-10-15", status: "paid", receiptUrl: "receipt2.jpg", verifiedByAdmin: true },
      { _id: "inst5", installmentNumber: 2, amount: 500, dueDate: "2024-11-15", status: "paid", receiptUrl: "receipt3.jpg", verifiedByAdmin: true },
      { _id: "inst6", installmentNumber: 3, amount: 500, dueDate: "2024-12-15", status: "pending", receiptUrl: null, verifiedByAdmin: false },
      { _id: "inst7", installmentNumber: 4, amount: 500, dueDate: "2025-01-15", status: "pending", receiptUrl: null, verifiedByAdmin: false },
    ]
  }
];

export default function EmployeePaymentsPage() {
  const { user } = useAuth();
  const [paymentPlans, setPaymentPlans] = useState(mockPaymentPlans);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [isPlanDetailsOpen, setIsPlanDetailsOpen] = useState(false);
  const [isReceiptUploadOpen, setIsReceiptUploadOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPaymentPlans();
  }, []);

  const loadPaymentPlans = async () => {
    try {
      const response = await paymentService.getEmployeePaymentPlans();
      setPaymentPlans(response.data);
    } catch (error) {
      console.error("Error loading payment plans:", error);
      // Fallback to mock data if API fails
      setPaymentPlans(mockPaymentPlans);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleReceiptUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !selectedInstallment) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('receipt', selectedFile);

      const response = await paymentService.uploadInstallmentReceiptEmployee(
        selectedInstallment._id,
        formData
      );

      if (response.success) {
        // Reload payment plans to get updated data
        await loadPaymentPlans();
        
        setIsReceiptUploadOpen(false);
        setSelectedFile(null);
        setSelectedInstallment(null);
        
        // Show success message
        alert('Receipt uploaded successfully!');
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

  const handleVerification = async (e) => {
    e.preventDefault();
    if (!selectedInstallment || !verificationStatus) return;

    setLoading(true);
    try {
      const response = await paymentService.verifyInstallmentPaymentEmployee(
        selectedInstallment._id,
        { status: verificationStatus, adminNotes }
      );

      if (response.success) {
        // Reload payment plans to get updated data
        await loadPaymentPlans();
        
        setIsVerificationModalOpen(false);
        setVerificationStatus("");
        setAdminNotes("");
        setSelectedInstallment(null);
        
        // Show success message
        alert(`Payment ${verificationStatus} successfully!`);
      } else {
        alert(response.message || 'Failed to verify payment');
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      alert('Failed to verify payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = paymentPlans.filter((plan) => {
    const matchesFilter = filter === "all" || 
      (filter === "active" && plan.status === "active") ||
      (filter === "completed" && plan.status === "completed");
    const matchesSearch = 
      plan.applicationId.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.applicationId.userId.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.applicationId.userId.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    totalPlans: paymentPlans.length,
    totalAmount: paymentPlans.reduce((sum, plan) => sum + plan.totalAmount, 0),
    pendingInstallments: paymentPlans.reduce((sum, plan) => 
      sum + plan.installments.filter(inst => inst.status === "pending").length, 0
    ),
    completedInstallments: paymentPlans.reduce((sum, plan) => 
      sum + plan.installments.filter(inst => inst.status === "paid").length, 0
    ),
  };

  const getStatusIcon = (status) => {
    if (status === "paid") return <CheckCircle size={16} />;
    if (status === "pending") return <Clock size={16} />;
    if (status === "failed") return <XCircle size={16} />;
    if (status === "overdue") return <AlertCircle size={16} />;
    return null;
  };

  const getStatusStyle = (status) => {
    if (status === "paid") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "pending") return "bg-amber-50 text-amber-700 border-amber-200";
    if (status === "failed") return "bg-red-50 text-red-700 border-red-200";
    if (status === "overdue") return "bg-red-50 text-red-700 border-red-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <div className="mb-8 md:mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#242021] mb-2 tracking-tight">Payment Management</h1>
              <p className="text-gray-600 text-base md:text-lg">Manage client payment plans and verify receipts</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#242021] to-[#3a3537] text-[#ffd17a] shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className='text-sm font-semibold uppercase tracking-wide opacity-80'>Total Plans</span>
                <div className="p-2 rounded-xl bg-[#ffd17a]/20"><FileText size={18} /></div>
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-1">{stats.totalPlans}</div>
              <div className='text-xs opacity-70'>Active Plans</div>
            </div>

            <div className="p-6 md:p-8 rounded-3xl bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className='text-sm font-semibold uppercase tracking-wide text-gray-600'>Total Amount</span>
                <div className="p-2 rounded-xl bg-blue-100"><DollarSign size={18} className="text-blue-600" /></div>
              </div>
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-1">${stats.totalAmount}</div>
              <div className="text-xs text-gray-500">All Plans</div>
            </div>

            <div className="p-6 md:p-8 rounded-3xl bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className='text-sm font-semibold uppercase tracking-wide text-gray-600'>Pending</span>
                <div className="p-2 rounded-xl bg-amber-100"><Clock size={18} className="text-amber-600" /></div>
              </div>
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-1">{stats.pendingInstallments}</div>
              <div className='text-xs text-gray-500'>Awaiting Payment</div>
            </div>

            <div className="p-6 md:p-8 rounded-3xl bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className='text-sm font-semibold uppercase tracking-wide text-gray-600'>Completed</span>
                <div className="p-2 rounded-xl bg-emerald-100"><CheckCircle size={18} className="text-emerald-600" /></div>
              </div>
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-1">{stats.completedInstallments}</div>
              <div className='text-xs text-gray-500'>Verified Payments</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className='text-2xl font-bold text-[#242021]'>Client Payment Plans</h2>
            <div className="flex gap-2">
              <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filter === "all" ? "bg-[#242021] text-[#ffd17a]" : "bg-gray-100 text-gray-600"}`}>All</button>
              <button onClick={() => setFilter("active")} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filter === "active" ? "bg-[#242021] text-[#ffd17a]" : "bg-gray-100 text-gray-600"}`}>Active</button>
              <button onClick={() => setFilter("completed")} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filter === "completed" ? "bg-[#242021] text-[#ffd17a]" : "bg-gray-100 text-gray-600"}`}>Completed</button>
            </div>
          </div>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search by client name, email, or service type..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-50 text-gray-800 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#242021] border border-gray-200" />
            </div>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {filteredPlans.map((plan) => (
              <div key={plan._id} className="p-6 bg-gray-50 hover:bg-white rounded-2xl transition-all border border-gray-200 hover:shadow-md">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#242021] to-[#3a3537] text-[#ffd17a] flex-shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {plan.applicationId.serviceType.charAt(0).toUpperCase() + plan.applicationId.serviceType.slice(1)} Application
                        </h3>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${plan.status === "active" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                          {plan.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            {plan.applicationId.userId.fullName}
                          </span>
                          <span>{plan.applicationId.userId.email}</span>
                        </div>
                        <div className="mt-1">
                          {plan.installmentCount} installments • Total: ${plan.totalAmount}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setSelectedPlan(plan); setIsPlanDetailsOpen(true); }} 
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <Eye size={18} className="text-gray-400" />
                  </button>
                </div>

                {/* Installments Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {plan.installments.slice(0, 3).map((installment) => (
                    <div key={installment._id} className="p-3 bg-white rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          Installment {installment.installmentNumber}
                        </span>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyle(installment.status)}`}>
                          {getStatusIcon(installment.status)}
                          {installment.status}
                        </span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">${installment.amount}</div>
                      <div className="text-xs text-gray-500">Due: {formatDate(installment.dueDate)}</div>
                      {installment.status === "pending" && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => {
                              setSelectedInstallment(installment);
                              setIsReceiptUploadOpen(true);
                            }}
                            className="flex-1 px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Upload Receipt
                          </button>
                          <button
                            onClick={() => {
                              setSelectedInstallment(installment);
                              setIsVerificationModalOpen(true);
                            }}
                            className="flex-1 px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Verify
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {plan.installments.length > 3 && (
                    <div className="p-3 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center">
                      <span className="text-sm text-gray-500">
                        +{plan.installments.length - 3} more
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Plan Details Modal */}
      {isPlanDetailsOpen && selectedPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#242021] to-[#3a3537] p-6 rounded-t-3xl flex justify-between items-start">
              <div>
                <h2 className='text-2xl font-bold text-[#ffd17a]'>Payment Plan Details</h2>
                <p className="text-[#ffd17a]/70 text-sm mt-1">
                  {selectedPlan.applicationId.serviceType.charAt(0).toUpperCase() + selectedPlan.applicationId.serviceType.slice(1)} Application
                </p>
                <p className="text-[#ffd17a]/70 text-sm">
                  Client: {selectedPlan.applicationId.userId.fullName} ({selectedPlan.applicationId.userId.email})
                </p>
              </div>
              <button onClick={() => setIsPlanDetailsOpen(false)} className="text-[#ffd17a] p-2 hover:bg-white/10 rounded-xl"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-1">Total Amount</div>
                  <div className="text-2xl font-bold text-gray-900">${selectedPlan.totalAmount}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-1">Installments</div>
                  <div className="text-2xl font-bold text-gray-900">{selectedPlan.installmentCount}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-1">Status</div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-semibold border ${selectedPlan.status === "active" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                    {selectedPlan.status}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Installment Schedule</h3>
                <div className="space-y-3">
                  {selectedPlan.installments.map((installment) => (
                    <div key={installment._id} className="p-4 bg-white border border-gray-200 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gray-100">
                            <span className="text-sm font-bold text-gray-700">#{installment.installmentNumber}</span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">${installment.amount}</div>
                            <div className="text-sm text-gray-500">Due: {formatDate(installment.dueDate)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-semibold border ${getStatusStyle(installment.status)}`}>
                            {getStatusIcon(installment.status)}
                            {installment.status}
                          </span>
                          {installment.status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedInstallment(installment);
                                  setIsReceiptUploadOpen(true);
                                  setIsPlanDetailsOpen(false);
                                }}
                                className="px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Upload Receipt
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedInstallment(installment);
                                  setIsVerificationModalOpen(true);
                                  setIsPlanDetailsOpen(false);
                                }}
                                className="px-3 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
                              >
                                Verify
                              </button>
                            </div>
                          )}
                          {installment.receiptUrl && (
                            <button className="p-2 text-gray-600 hover:text-gray-900">
                              <Eye size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                      {installment.verifiedByAdmin && (
                        <div className="text-xs text-gray-500 mt-2">
                          Verified by admin • {installment.verifiedAt ? formatDate(installment.verifiedAt) : 'Recently'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Upload Modal */}
      {isReceiptUploadOpen && selectedInstallment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
            <div className="bg-gradient-to-r from-[#242021] to-[#3a3537] p-6 rounded-t-3xl flex justify-between items-center">
              <div>
                <h2 className='text-2xl font-bold text-[#ffd17a]'>Upload Payment Receipt</h2>
                <p className="text-[#ffd17a]/70 text-sm mt-1">
                  Installment #{selectedInstallment.installmentNumber} - ${selectedInstallment.amount}
                </p>
              </div>
              <button onClick={() => setIsReceiptUploadOpen(false)} className="text-[#ffd17a] p-2 hover:bg-white/10 rounded-xl"><X size={24} /></button>
            </div>
            <form onSubmit={handleReceiptUpload} className="p-6 space-y-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">Payment Details</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-semibold">${selectedInstallment.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Due Date:</span>
                    <span className="font-semibold">{formatDate(selectedInstallment.dueDate)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className='block text-gray-700 font-semibold mb-2 text-sm'>Receipt Image</label>
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
                        <p className="text-xs text-gray-500">Click to change file</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-gray-400">
                          <Upload size={48} className="mx-auto" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">Click to upload receipt</p>
                        <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsReceiptUploadOpen(false)} 
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!selectedFile || uploading}
                  className="flex-1 py-3 bg-gradient-to-r from-[#242021] to-[#3a3537] text-[#ffd17a] font-bold rounded-xl hover:from-[#3a3537] hover:to-[#4a4547] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {isVerificationModalOpen && selectedInstallment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
            <div className="bg-gradient-to-r from-[#242021] to-[#3a3537] p-6 rounded-t-3xl flex justify-between items-center">
              <div>
                <h2 className='text-2xl font-bold text-[#ffd17a]'>Verify Payment</h2>
                <p className="text-[#ffd17a]/70 text-sm mt-1">
                  Installment #{selectedInstallment.installmentNumber} - ${selectedInstallment.amount}
                </p>
              </div>
              <button 
                onClick={() => setIsVerificationModalOpen(false)} 
                className="text-[#ffd17a] p-2 hover:bg-white/10 rounded-xl"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleVerification} className="p-6 space-y-6">
              <div>
                <label className='block text-gray-700 font-semibold mb-2 text-sm'>Verification Decision</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setVerificationStatus("paid")}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                      verificationStatus === "paid" 
                        ? "border-green-500 bg-green-50 text-green-700" 
                        : "border-gray-200 bg-white text-gray-700 hover:border-green-300"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Check size={20} />
                      <span className="font-semibold">Approve</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerificationStatus("failed")}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                      verificationStatus === "failed" 
                        ? "border-red-500 bg-red-50 text-red-700" 
                        : "border-gray-200 bg-white text-gray-700 hover:border-red-300"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <X size={20} />
                      <span className="font-semibold">Reject</span>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className='block text-gray-700 font-semibold mb-2 text-sm'>Notes (Optional)</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes about this verification..."
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#242021] resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsVerificationModalOpen(false)} 
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!verificationStatus || loading}
                  className="flex-1 py-3 bg-gradient-to-r from-[#242021] to-[#3a3537] text-[#ffd17a] font-bold rounded-xl hover:from-[#3a3537] hover:to-[#4a4547] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Submit Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
