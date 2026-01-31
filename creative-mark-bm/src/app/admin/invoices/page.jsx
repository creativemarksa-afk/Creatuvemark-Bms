"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaEye, FaEdit, FaTrash, FaFileInvoice, FaSearch, FaFilter, FaDownload, FaPlus } from "react-icons/fa";
import { getInvoices, deleteInvoice } from "../../../services/invoiceService";
import CreateInvoiceModal from "../../../components/admin/CreateInvoiceModal";
import EditInvoiceModal from "../../../components/admin/EditInvoiceModal";
import { useTranslation } from "../../../i18n/TranslationContext";

export default function InvoicesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await getInvoices();
      console.log("📋 Fetched invoices:", data);

      if (data && data.invoices && Array.isArray(data.invoices)) {
        setInvoices(data.invoices);
      } else if (Array.isArray(data)) {
        setInvoices(data);
      } else {
        console.warn("Unexpected data format from server:", data);
        setInvoices([]);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      if (error.response?.data) {
        console.error("Server error details:", error.response.data);
      }
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = (newInvoice) => {
    console.log("New invoice created:", newInvoice);
    setInvoices((prev) => [newInvoice, ...prev]);
    fetchInvoices();
    setShowCreateModal(false);
  };

  const handleEditSuccess = (updatedInvoice) => {
    console.log("Invoice updated:", updatedInvoice);
    setInvoices((prev) =>
      prev.map((invoice) => (invoice._id === updatedInvoice._id ? updatedInvoice : invoice))
    );
    fetchInvoices();
    setShowEditModal(false);
    setSelectedInvoice(null);
  };

  const handleViewInvoice = (invoiceId) => {
    router.push(`/admin/invoices/${invoiceId}`);
  };

  const handleEditInvoice = (invoiceId) => {
    const invoiceToEdit = invoices.find((invoice) => invoice._id === invoiceId);
    if (invoiceToEdit) {
      setSelectedInvoice(invoiceToEdit);
      setShowEditModal(true);
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await deleteInvoice(invoiceId);
        setInvoices((prev) => prev.filter((invoice) => invoice._id !== invoiceId));
      } catch (error) {
        console.error("Error deleting invoice:", error);
        alert("Failed to delete invoice. Please try again.");
      }
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || invoice.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    console.log("🔍 Filtered invoices:", filteredInvoices);
  }, [filteredInvoices]);

  const stats = {
    total: invoices.length,
    paid: invoices.filter((i) => i.status === "Paid").length,
    unpaid: invoices.filter((i) => i.status === "Unpaid").length,
    pending: invoices.filter((i) => i.status === "Pending").length,
    totalRevenue: invoices.reduce((sum, i) => sum + (i.grandTotal || i.totalAmount || 0), 0),
  };

  return (
    <div className="min-h-screen bg-stone-50 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-stone-900 mb-2">{t('invoices.title')}</h1>
              <p className="text-stone-600">{t('invoices.description')}</p>
            </div>
            <div className="flex gap-3">
              <button className="px-5 py-2.5 bg-white text-stone-700 font-medium hover:bg-stone-50 transition-colors flex items-center gap-2 border border-stone-200">
                <FaDownload />
                {t('invoices.export')}
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2.5 bg-stone-800 text-white font-medium hover:bg-stone-900 transition-colors flex items-center gap-2"
              >
                <FaPlus />
                {t('invoices.newInvoice')}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-gradient-to-br from-stone-800 to-stone-900 p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <FaFileInvoice className="text-2xl opacity-80" />
              </div>
              <p className="text-stone-300 text-xs font-medium uppercase tracking-wider mb-1">{t('invoices.totalInvoices')}</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>

            <div className="bg-white p-6 border border-stone-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-emerald-500"></div>
                <p className="text-stone-600 text-xs font-semibold uppercase tracking-wider">{t('invoices.paid')}</p>
              </div>
              <p className="text-3xl font-bold text-stone-900">{stats.paid}</p>
            </div>

            <div className="bg-white p-6 border border-stone-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-rose-500"></div>
                <p className="text-stone-600 text-xs font-semibold uppercase tracking-wider">{t('invoices.unpaid')}</p>
              </div>
              <p className="text-3xl font-bold text-stone-900">{stats.unpaid}</p>
            </div>

            <div className="bg-white p-6 border border-stone-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-amber-500"></div>
                <p className="text-stone-600 text-xs font-semibold uppercase tracking-wider">{t('invoices.pending')}</p>
              </div>
              <p className="text-3xl font-bold text-stone-900">{stats.pending}</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 border border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-amber-700 text-xl font-bold">$</span>
                <p className="text-amber-700 text-xs font-semibold uppercase tracking-wider">{t('invoices.revenue')}</p>
              </div>
              <p className="text-2xl font-bold text-amber-900">SAR {stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder={t('invoices.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white text-stone-900 placeholder-stone-400 pl-12 pr-4 py-3 border border-stone-200 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-colors"
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white text-stone-900 pl-12 pr-8 py-3 border border-stone-200 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-colors appearance-none cursor-pointer min-w-[180px]"
              >
                <option value="all">{t('invoices.allStatus')}</option>
                <option value="paid">{t('invoices.paid')}</option>
                <option value="unpaid">{t('invoices.unpaid')}</option>
                <option value="pending">{t('invoices.pending')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Invoices Table/Cards */}
        {loading ? (
          <div className="bg-white border border-stone-200 p-12 text-center">
            <div className="w-16 h-16 border-4 border-stone-800 border-t-transparent animate-spin mx-auto mb-4"></div>
            <h3 className="text-stone-900 text-lg font-semibold mb-2">{t('invoices.loadingInvoices')}</h3>
            <p className="text-stone-600">{t('invoices.pleaseWait')}</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="bg-white border border-stone-200 p-12 text-center">
            <div className="w-16 h-16 bg-stone-100 flex items-center justify-center mx-auto mb-4">
              <FaFileInvoice className="text-stone-400 text-2xl" />
            </div>
            <h3 className="text-stone-900 text-lg font-semibold mb-2">{t('invoices.noInvoicesFound')}</h3>
            <p className="text-stone-600">{t('invoices.tryAdjustingSearchOrFilterCriteria')}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white border border-stone-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200">
                    <th className="py-4 px-6 text-left text-xs font-semibold text-stone-700 uppercase tracking-wider">{t('invoices.invoiceID')}</th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-stone-700 uppercase tracking-wider">{t('invoices.client')}</th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-stone-700 uppercase tracking-wider">{t('invoices.email')}</th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-stone-700 uppercase tracking-wider">{t('invoices.issueDate')}</th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-stone-700 uppercase tracking-wider">{t('invoices.total')}</th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-stone-700 uppercase tracking-wider">{t('invoices.status')}</th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-stone-700 uppercase tracking-wider">{t('invoices.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredInvoices.map((invoice, index) => (
                    <tr key={invoice._id || invoice.id || index} className="hover:bg-stone-50 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-semibold text-stone-900 bg-stone-100 px-3 py-1 text-sm">
                          {invoice.invoiceNumber || invoice._id}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center font-semibold text-white text-sm">
                            {invoice.clientName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-stone-900 font-medium">{invoice.clientName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-stone-600 text-sm">{invoice.clientEmail}</td>
                      <td className="py-4 px-6 text-stone-600 font-medium text-sm">
                        {new Date(invoice.invoiceDate || invoice.issueDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-stone-900">
                          SAR {(invoice.grandTotal || invoice.totalAmount).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 text-xs font-semibold ${
                            invoice.status === "Paid"
                              ? "bg-emerald-100 text-emerald-700"
                              : invoice.status === "Unpaid"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleViewInvoice(invoice._id)}
                            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                            title="View"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleEditInvoice(invoice._id)}
                            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(invoice._id)}
                            className="p-2 text-rose-600 hover:text-white hover:bg-rose-600 transition-colors"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice._id}
                  className="bg-white p-5 border border-stone-200 hover:border-stone-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center font-semibold text-white">
                        {invoice.clientName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-stone-900 font-semibold">{invoice.clientName}</h3>
                        <p className="text-stone-600 text-sm">{invoice.clientEmail}</p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-semibold ${
                        invoice.status === "Paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : invoice.status === "Unpaid"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-stone-100">
                    <div>
                      <p className="text-stone-500 text-xs uppercase tracking-wider mb-1">Invoice ID</p>
                      <p className="text-stone-900 font-semibold text-sm">{invoice.invoiceNumber || invoice._id}</p>
                    </div>
                    <div>
                      <p className="text-stone-500 text-xs uppercase tracking-wider mb-1">Amount</p>
                      <p className="text-stone-900 font-semibold text-sm">SAR {(invoice.grandTotal || invoice.totalAmount).toLocaleString()}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-stone-500 text-xs uppercase tracking-wider mb-1">Issue Date</p>
                      <p className="text-stone-600 text-sm">{new Date(invoice.invoiceDate || invoice.issueDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewInvoice(invoice._id)}
                      className="flex-1 py-2.5 bg-stone-100 text-stone-900 font-medium hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaEye />
                      View
                    </button>
                    <button
                      onClick={() => handleEditInvoice(invoice._id)}
                      className="flex-1 py-2.5 bg-stone-100 text-stone-900 font-medium hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaEdit />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteInvoice(invoice._id)}
                      className="py-2.5 px-4 bg-rose-100 text-rose-700 font-medium hover:bg-rose-200 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Modals */}
        <CreateInvoiceModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />

        <EditInvoiceModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedInvoice(null);
          }}
          onSuccess={handleEditSuccess}
          invoice={selectedInvoice}
        />
      </div>
    </div>
  );
}