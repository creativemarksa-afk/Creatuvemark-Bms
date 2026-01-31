"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaPrint, FaArrowLeft, FaEdit } from "react-icons/fa";
import { getInvoiceById } from "../../../../services/invoiceService";
import EditInvoiceModal from "../../../../components/admin/EditInvoiceModal";
import { useTranslation } from "../../../../i18n/TranslationContext";

const InvoicePrintPage = () => {
  const params = useParams();
  const router = useRouter();
  const { t, direction } = useTranslation();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const data = await getInvoiceById(params.id);
        console.log("data :", data.status);
  
        // Calculate totals
        const totalPaid = data.paidAmount || 0;
        const remaining = Math.max(data.grandTotal - totalPaid, 0);
        
     
        
        setInvoice({
          ...data,
          paidAmount: totalPaid,
          remainingAmount: remaining > 0 ? remaining : 0,
        });


      } catch (error) {
        console.error("Error fetching invoice:", error);
        setError(error.message || "Failed to fetch invoice");
      } finally {
        setLoading(false);
      }
    };
  
    if (params.id) {
      fetchInvoice();
    }
  }, [params.id]);
  

  const getStatusColor = (status) => {
    const colors = {
      Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Pending: "bg-amber-50 text-amber-700 border-amber-200",
      Overdue: "bg-rose-50 text-rose-700 border-rose-200",
      "Partially Paid": "bg-blue-50 text-blue-700 border-blue-200",
      Cancelled: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return colors[status] || colors["Pending"];
  };

  const handlePrint = () => {
    window.print();
  };

  const handleInvoiceUpdate = (updatedInvoice) => {
    setInvoice(updatedInvoice);
    setEditOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent"></div>
          <h3 className="text-lg font-medium text-gray-900 mt-4">{t('invoice.loading')}</h3>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-rose-600 text-2xl">⚠</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('invoice.notFound')}</h3>
          <p className="text-gray-600 mb-6">{error || t('invoice.notFoundDescription')}</p>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors mx-auto"
          >
            <FaArrowLeft className="w-4 h-4" />
            {t('buttons.back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir={direction} className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 print:bg-white">
      {/* Action Buttons - Hidden on Print */}
      <div className="no-print bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors font-medium"
            >
              <FaArrowLeft className="w-4 h-4" />
              {t('buttons.back')}
            </button>
            
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm"
          >
            <FaPrint className="w-4 h-4" />
            {t('invoice.printInvoice')}
          </button>
        </div>
      </div>

      {/* Edit Invoice Modal */}
      {editOpen && (
        <EditInvoiceModal
          invoice={invoice}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSave={handleInvoiceUpdate}
        />
      )}

      {/* Invoice Container */}
      <div className="invoice-container max-w-[210mm] mx-auto p-8 print:p-0 print:max-w-full">
        <div className="bg-white shadow-lg print:shadow-none rounded-lg print:rounded-none overflow-hidden">
          
          {/* Professional Header */}
          <div className="bg-[#242021] to-gray-800 text-white p-8">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-4">
                <div className="bg-white rounded-full">
                  <img
                    src="/CreativeMarkFavicon.png"
                    alt="CreativeMark Logo"
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{t('invoice.companyName')}</h1>
                  <p className="text-sm text-gray-300 mt-1">{t('invoice.tagline')}</p>
                  <div className="mt-3 text-xs text-gray-300 space-y-0.5">
                    <p>{t('invoice.companyAddressLine1')}</p>
                    <p>{t('invoice.companyContact')}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-4xl font-bold tracking-tight">{t('invoice.title')}</h2>
                <p className="text-sm text-gray-300 mt-2">#{invoice.invoiceNumber}</p>
                <div className={`inline-block px-3 py-1.5 rounded-md text-xs font-semibold mt-3 border ${getStatusColor(invoice.status)}`}>
                  {t(`invoice.status${invoice.status.replace(/\s+/g, '')}`)}
                </div>
              </div>
            </div>
          </div>

          {/* Billing Information */}
          <div className="grid grid-cols-2 gap-8 p-8 border-b border-gray-200">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{t('invoice.billTo')}</p>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-900 text-lg mb-1">{invoice.clientFullName || invoice.clientName}</h3>
                {invoice.clientFullName && invoice.clientFullName !== invoice.clientName && (
                  <p className="text-sm text-gray-600 mb-2">{invoice.clientName}</p>
                )}
                <div className="text-sm text-gray-600 space-y-1 mt-3">
                  {invoice.clientAddress && <p>{invoice.clientAddress}</p>}
                  {(invoice.clientCity || invoice.clientZipCode) && (
                    <p>
                      {invoice.clientCity}
                      {invoice.clientCity && invoice.clientZipCode && ", "}
                      {invoice.clientZipCode}
                    </p>
                  )}
                  {invoice.clientCountry && <p>{invoice.clientCountry}</p>}
                  {invoice.clientEmail && <p className="mt-2 font-medium">{invoice.clientEmail}</p>}
                  {invoice.clientPhone && <p>{invoice.clientPhone}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('invoice.invoiceDate')}</p>
                <p className="font-semibold text-gray-900">
                  {new Date(invoice.invoiceDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('invoice.dueDate')}</p>
                <p className="font-semibold text-gray-900">
                  {new Date(invoice.dueDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              {invoice.paymentMethod && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('invoice.paymentMethod')}</p>
                  <p className="font-semibold text-gray-900">{invoice.paymentMethod}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="p-8">
            <table className="w-full">
              <thead>
                <tr className="bg-[#242021] text-white">
                  <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider rounded-tl-lg">{t('invoice.description')}</th>
                  <th className="text-center py-4 px-4 text-xs font-bold uppercase tracking-wider w-24">{t('invoice.quantity')}</th>
                  <th className="text-right py-4 px-4 text-xs font-bold uppercase tracking-wider w-32">{t('invoice.unitPrice')}</th>
                  <th className="text-right py-4 px-4 text-xs font-bold uppercase tracking-wider w-36 rounded-tr-lg">{t('invoice.amount')}</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-4 px-4 text-sm text-gray-900">{item.description}</td>
                    <td className="py-4 px-4 text-sm text-gray-700 text-center font-medium">{item.quantity}</td>
                    <td className="py-4 px-4 text-sm text-gray-700 text-right">SAR {item.unitPrice.toLocaleString()}</td>
                    <td className="py-4 px-4 text-sm font-semibold text-gray-900 text-right">SAR {item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary & Payment Schedule */}
          <div className="grid grid-cols-2 gap-8 px-8 pb-8 border-t border-gray-200 pt-8">
            {/* Payment Schedule */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">{t('invoice.paymentSchedule')}</p>
              <div className="space-y-3">
                <div className="bg-gray-50 border-l-4 border-gray-900 pl-4 pr-4 py-3 rounded-r-lg">
                  <p className="font-semibold text-gray-900">
                    {t('invoice.fullPayment')} — SAR {invoice.grandTotal.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {t('invoice.dueDate')}: {new Date(invoice.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-2 border ${getStatusColor(invoice.status)}`}>
                    {t(`invoice.status${invoice.status.replace(/\s+/g, '')}`)}
                  </span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('invoice.subtotal')}</span>
                    <span className="font-semibold text-gray-900">SAR {invoice.subTotal.toLocaleString()}</span>
                  </div>
                  {invoice.status === "Partially Paid" && (
  <>
    <div className="flex justify-between pt-3 border-t border-gray-300 mt-3">
      <span className="text-gray-600">{t('invoice.paidAmount')}</span>
      <span className="font-semibold text-emerald-600">
        SAR {invoice.paidAmount.toLocaleString()}
      </span>
    </div>

    <div className="flex justify-between pt-2">
      <span className="font-bold text-gray-900">{t('invoice.remaining')}</span>
      <span className="text-lg font-bold text-rose-600">
        SAR {invoice.remainingAmount.toLocaleString()}
      </span>
    </div>
  </>
)}

{invoice.status === "Paid" && (
  <div className="flex justify-between pt-3 border-t border-gray-300 mt-3">
    <span className="text-gray-600">{t('invoice.paidInFull')}</span>
    <span className="font-semibold text-emerald-600">
      SAR {invoice.grandTotal.toLocaleString()}
    </span>
  </div>
)}

{invoice.status === "Pending" && (
  <div className="flex justify-between pt-3 border-t border-gray-300 mt-3">
    <span className="text-gray-600">{t('invoice.unpaid')}</span>
    <span className="font-semibold text-rose-600">
      SAR {invoice.grandTotal.toLocaleString()}
    </span>
  </div>
)}

                  {invoice.taxRate > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('invoice.tax')} ({invoice.taxRate}%)</span>
                      <span className="font-semibold text-gray-900">SAR {invoice.taxAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {invoice.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('invoice.discount')}</span>
                      <span className="font-semibold text-emerald-600">-SAR {invoice.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-4 border-t-2 border-gray-900 mt-4">
                    <span className="font-bold text-gray-900 text-base">{t('invoice.totalAmount')}</span>
                    <span className="text-xl font-bold text-gray-900">SAR {invoice.grandTotal.toLocaleString()}</span>
                  </div>
                  {invoice.paidAmount > 0 && (
                    <>
                      <div className="flex justify-between pt-3 border-t border-gray-300 mt-3">
                        <span className="text-gray-600">{t('invoice.paid')}</span>
                        <span className="font-semibold text-emerald-600">SAR {invoice.paidAmount.toLocaleString()}</span>
                      </div>
                      {invoice.remainingAmount > 0 && (
                        <div className="flex justify-between pt-2">
                          <span className="font-bold text-gray-900">{t('invoice.balanceDue')}</span>
                          <span className="text-lg font-bold text-rose-600">SAR {invoice.remainingAmount.toLocaleString()}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="px-8 pb-8">
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">{t('invoice.adminNotes')}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{invoice.notes}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 px-8 py-6 text-center">
            <p className="text-base font-semibold text-gray-900">{t('invoice.thankYou')}</p>
            <p className="text-xs text-gray-600 mt-2">
              {t('invoice.computerGenerated')}
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            width: 100% !important;
            height: 100% !important;
          }

          @page {
            size: A4 portrait;
            margin: 0;
          }

          .no-print {
            display: none !important;
          }

          body {
            margin: 0 !important;
          }

          .min-h-screen {
            min-height: 100vh !important;
            background: white !important;
          }

          .invoice-container {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            height: 100% !important;
          }

          .invoice-container > div {
            box-shadow: none !important;
            border-radius: 0 !important;
            page-break-inside: avoid;
            width: 100% !important;
            height: 100% !important;
          }

          /* Remove all padding and margins from sections */
          .p-8, .px-8, .py-8, .pb-8, .pt-8 {
            padding: 1rem !important;
          }

          /* Make header full width */
          .bg-gradient-to-r {
            padding: 1.5rem !important;
          }

          /* Adjust grid layouts for print */
          .grid {
            width: 100% !important;
          }

          /* Ensure colored backgrounds print */
          .bg-gradient-to-r,
          .bg-gray-900,
          .bg-gray-800,
          .bg-gray-50,
          .bg-amber-50,
          .bg-blue-50,
          .bg-emerald-50,
          .bg-rose-50,
          .border-gray-900,
          .border-amber-400,
          [class*="bg-"],
          [class*="border-"] {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Ensure text colors print */
          .text-white,
          .text-gray-300,
          [class*="text-"] {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Table adjustments */
          table {
            width: 100% !important;
          }

          /* Remove hover effects in print */
          .hover\\:bg-gray-50:hover {
            background-color: transparent !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoicePrintPage;