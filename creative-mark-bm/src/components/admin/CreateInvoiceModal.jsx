"use client";
import { useState, useEffect } from "react";
import { FaTimes, FaPlus, FaTrash, FaSave, FaEye, FaMoneyBillWave, FaFileInvoiceDollar } from "react-icons/fa";
import InvoicePreview from "./InvoicePreview";
import ToastContainer from "../common/Toast";
import { motion } from "framer-motion";
import { createInvoice } from "../../services/invoiceService";
import { useTranslation } from "../../i18n/TranslationContext";


// Toast Hook
const useToasts = () => {
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  };
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };
  return { toasts, addToast, removeToast };
};

// Generate Invoice Number
const generateInvoiceNumber = () => {
  return `INV-${Math.floor(Math.random() * 10000).toString().padStart(5, "0")}`;
};

const CreateInvoiceModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    clientName: "",
    clientFullName: "",
    clientEmail: "",
    clientPhone: "",
    clientAddress: "",
    clientCity: "",
    clientCountry: "",
    clientZipCode: "",
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    status: "Pending",
    paymentMethod: "Bank Transfer",
    items: [{ description: "", quantity: 1, unitPrice: 0, total: 0 }],
    subTotal: 0,
    taxRate: 0,
    taxAmount: 0,
    discount: 0,
    grandTotal: 0,
    paidAmount: 0,
    remainingAmount: 0,
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const { toasts, addToast, removeToast } = useToasts();

  // Prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
      setFormData((prev) => ({ ...prev, invoiceNumber: generateInvoiceNumber() }));
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [isOpen]);

  // Auto-calculate totals
  useEffect(() => {
    const subTotal = formData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const taxAmount = (subTotal * formData.taxRate) / 100;
    const grandTotal = subTotal + taxAmount - formData.discount;
    const remainingAmount = grandTotal - formData.paidAmount;

    setFormData((prev) => ({
      ...prev,
      subTotal,
      taxAmount,
      grandTotal: Math.max(0, grandTotal),
      remainingAmount: Math.max(0, remainingAmount),
    }));
  }, [formData.items, formData.taxRate, formData.discount, formData.paidAmount]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === "quantity" || field === "unitPrice" ? Number(value) || 0 : value;
    if (field === "quantity" || field === "unitPrice") {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, unitPrice: 0, total: 0 }],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, items: newItems }));
    }
  };


  const validateForm = () => {
    const newErrors = {};
    if (!formData.clientName.trim()) newErrors.clientName = t('createInvoice.validation.clientNameRequired');
    if (!formData.clientEmail.trim()) newErrors.clientEmail = t('createInvoice.validation.clientEmailRequired');
    if (!formData.dueDate) newErrors.dueDate = t('createInvoice.validation.dueDateRequired');
    if (!formData.invoiceNumber.trim()) newErrors.invoiceNumber = t('createInvoice.validation.invoiceNumberRequired');

    formData.items.forEach((item, i) => {
      if (!item.description.trim()) newErrors[`desc_${i}`] = t('createInvoice.validation.descriptionRequired');
      if (item.quantity <= 0) newErrors[`qty_${i}`] = t('createInvoice.validation.quantityGreaterThanZero');
      if (item.unitPrice <= 0) newErrors[`price_${i}`] = t('createInvoice.validation.unitPriceGreaterThanZero');
    });


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) {
      addToast(t('createInvoice.messages.fixErrors'), "error");
      return;
    }
  
    setLoading(true);
  
    try {
      const totalPaid = Number(formData.paidAmount) || 0;
      const grandTotal = Number(formData.grandTotal) || 0;
      const remaining = Math.max(grandTotal - totalPaid, 0);
  
      // Determine status automatically
      let status = "Pending";
      if (totalPaid >= grandTotal) {
        status = "Paid";
      } else if (totalPaid > 0 && totalPaid < grandTotal) {
        status = "Partially Paid";
      }
  
      // No installments logic needed
  
      const data = {
        ...formData,
        grandTotal,
        paidAmount: totalPaid,
        remainingAmount: remaining,
        status,
      };
  
      const res = await createInvoice(data);

      addToast(t('createInvoice.messages.invoiceCreated'), "success");
      onSuccess(res.invoice);
      onClose();
    } catch (error) {
      console.error("Error creating invoice:", error);
      addToast(error.message || t('createInvoice.messages.errorCreating'), "error");
    } finally {
      setLoading(false);
    }
  };
  

  const handlePreview = () => setShowPreview(true);

  if (!isOpen) return null;

  if (showPreview) {
    return (
      <>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <InvoicePreview invoice={formData} onClose={() => setShowPreview(false)} />
      </>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white rounded-lg shadow-lg w-full max-w-[95vw] sm:max-w-5xl max-h-[95vh] flex flex-col border border-gray-200"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#ffd17a] rounded-xl flex items-center justify-center">
              <FaFileInvoiceDollar className="text-[#242021] w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#242021] to-[#242021]/80 bg-clip-text text-transparent">
                {t('createInvoice.title')}
              </h2>
              <span className="text-sm font-semibold text-[#ffd17a]/80">#{formData.invoiceNumber}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-xl hover:bg-[#ffd17a]/10 transition-all duration-300"
          >
            <FaTimes className="w-5 h-5 text-[#242021]/70 hover:text-[#242021]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Client Info */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">{t('createInvoice.clientInformation')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { label: `${t('createInvoice.name')} *`, field: "clientName", type: "text" },
                  { label: `${t('createInvoice.email')} *`, field: "clientEmail", type: "email" },
                  { label: t('createInvoice.phone'), field: "clientPhone", type: "text" },
                  { label: t('createInvoice.address'), field: "clientAddress", type: "text" },
                  { label: t('createInvoice.city'), field: "clientCity", type: "text" },
                  { label: t('createInvoice.country'), field: "clientCountry", type: "text" },
                  { label: t('createInvoice.zipCode'), field: "clientZipCode", type: "text" },
                ].map(({ label, field, type }) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-[#242021]/80">{label}</label>
                    <input
                      type={type}
                      value={formData[field]}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      className={`w-full px-4 py-3 bg-white/50 border border-[#242021]/10 rounded-xl focus:border-[#ffd17a] focus:ring-2 focus:ring-[#ffd17a]/30 transition-all duration-300 text-[#242021] placeholder-[#242021]/50 ${
                        errors[field] ? "border-red-500" : ""
                      }`}
                    />
                    {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Invoice Info */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">{t('createInvoice.invoiceDetails')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#242021]/80">{t('createInvoice.status')}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange("status", e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-[#242021]/10 rounded-xl focus:border-[#ffd17a] focus:ring-2 focus:ring-[#ffd17a]/30 transition-all duration-300 text-[#242021]">
                    <option value="Pending">{t('createInvoice.statusOptions.pending')}</option>
                    <option value="Partially Paid">{t('createInvoice.statusOptions.partiallyPaid')}</option>
                    <option value="Paid">{t('createInvoice.statusOptions.paid')}</option>
                    <option value="Overdue">{t('createInvoice.statusOptions.overdue')}</option>
                    <option value="Cancelled">{t('createInvoice.statusOptions.cancelled')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#242021]/80">{t('createInvoice.paymentMethod')}</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-[#242021]/10 rounded-xl focus:border-[#ffd17a] focus:ring-2 focus:ring-[#ffd17a]/30 transition-all duration-300 text-[#242021]"
                  >
                    <option value="Cash">{t('createInvoice.paymentMethodOptions.cash')}</option>
                    <option value="Bank Transfer">{t('createInvoice.paymentMethodOptions.bankTransfer')}</option>
                    <option value="Credit Card">{t('createInvoice.paymentMethodOptions.creditCard')}</option>
                    <option value="PayPal">{t('createInvoice.paymentMethodOptions.paypal')}</option>
                    <option value="Other">{t('createInvoice.paymentMethodOptions.other')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#242021]/80">{t('createInvoice.invoiceDate')}</label>
                  <input
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => handleInputChange("invoiceDate", e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-[#242021]/10 rounded-xl focus:border-[#ffd17a] focus:ring-2 focus:ring-[#ffd17a]/30 transition-all duration-300 text-[#242021]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#242021]/80">{t('createInvoice.dueDate')} *</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange("dueDate", e.target.value)}
                    className={`w-full px-4 py-3 bg-white/50 border border-[#242021]/10 rounded-xl focus:border-[#ffd17a] focus:ring-2 focus:ring-[#ffd17a]/30 transition-all duration-300 text-[#242021] ${
                      errors.dueDate ? "border-red-500" : ""
                    }`}
                  />
                  {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-[#242021]/5 p-6 rounded-2xl space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">{t('createInvoice.financialSummary')}</h3>
              <div className="space-y-3">
                {[
                  { label: t('createInvoice.subtotal'), value: `SAR ${formData.subTotal.toFixed(2)}`, color: "text-[#242021]" },
                  { label: `${t('createInvoice.tax')} (${formData.taxRate}%)`, value: `SAR ${formData.taxAmount.toFixed(2)}`, color: "text-[#242021]" },
                  { label: t('createInvoice.discount'), value: `SAR ${formData.discount.toFixed(2)}`, color: "text-emerald-600" },
                  { label: t('createInvoice.grandTotal'), value: `SAR ${formData.grandTotal.toFixed(2)}`, color: "text-[#ffd17a]" },
                  { label: t('createInvoice.remainingDue'), value: `SAR ${formData.remainingAmount.toFixed(2)}`, color: "text-red-600" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between text-sm font-medium">
                    <span className="text-[#242021]/80">{label}:</span>
                    <span className={color}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex justify-between items-center mb-4 border-b border-[#ffd17a]/20 pb-2">
                <h3 className="text-lg font-semibold text-gray-900">{t('createInvoice.invoiceItems')}</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-2 px-6 py-3 bg-[#ffd17a] text-[#242021] rounded-xl hover:bg-[#ffd17a]/80 transition-all duration-300 font-semibold"
                >
                  <FaPlus className="w-4 h-4" /> {t('createInvoice.addItem')}
                </button>
              </div>
              <div className="space-y-4">
                {formData.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-4 bg-[#242021]/5 p-4 rounded-2xl">
                    <div className="col-span-12 sm:col-span-5">
                      <label className="block text-sm font-medium text-[#242021]/80">{t('createInvoice.description')} *</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(i, "description", e.target.value)}
                        className={`w-full px-4 py-3 bg-white/50 border border-[#242021]/10 rounded-xl focus:border-[#ffd17a] focus:ring-2 focus:ring-[#ffd17a]/30 transition-all duration-300 text-[#242021] placeholder-[#242021]/50 ${
                          errors[`desc_${i}`] ? "border-red-500" : ""
                        }`}
                        placeholder={t('createInvoice.description')}
                      />
                      {errors[`desc_${i}`] && <p className="text-red-500 text-xs mt-1">{errors[`desc_${i}`]}</p>}
                    </div>
                    <div className="col-span-6 sm:col-span-2">
                      <label className="block text-sm font-medium text-[#242021]/80">{t('createInvoice.quantity')} *</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(i, "quantity", e.target.value)}
                        className={`w-full px-4 py-3 bg-white/50 border border-[#242021]/10 rounded-xl focus:border-[#ffd17a] focus:ring-2 focus:ring-[#ffd17a]/30 transition-all duration-300 text-[#242021] ${
                          errors[`qty_${i}`] ? "border-red-500" : ""
                        }`}
                      />
                      {errors[`qty_${i}`] && <p className="text-red-500 text-xs mt-1">{errors[`qty_${i}`]}</p>}
                    </div>
                    <div className="col-span-6 sm:col-span-2">
                      <label className="block text-sm font-medium text-[#242021]/80">{t('createInvoice.price')} *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(i, "unitPrice", e.target.value)}
                        className={`w-full px-4 py-3 bg-white/50 border border-[#242021]/10 rounded-xl focus:border-[#ffd17a] focus:ring-2 focus:ring-[#ffd17a]/30 transition-all duration-300 text-[#242021] ${
                          errors[`price_${i}`] ? "border-red-500" : ""
                        }`}
                      />
                      {errors[`price_${i}`] && <p className="text-red-500 text-xs mt-1">{errors[`price_${i}`]}</p>}
                    </div>
                    <div className="col-span-6 sm:col-span-2">
                      <label className="block text-sm font-medium text-[#242021]/80">{t('createInvoice.total')}</label>
                      <input
                        type="text"
                        value={`SAR ${item.total.toFixed(2)}`}
                        readOnly
                        className="w-full px-4 py-3 bg-[#242021]/5 border border-[#242021]/10 rounded-xl text-[#242021]"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-1 flex justify-end items-center">
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(i)}
                          className="p-3 text-red-600 hover:bg-red-100/50 rounded-xl transition-all duration-300"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>


            {/* Tax, Discount, Paid Amount */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">{t('createInvoice.additionalDetails')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#242021]/80">{t('createInvoice.taxRate')}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.taxRate}
                    onChange={(e) => handleInputChange("taxRate", Number(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-white/50 border border-[#242021]/10 rounded-xl focus:border-[#ffd17a] focus:ring-2 focus:ring-[#ffd17a]/30 transition-all duration-300 text-[#242021]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#242021]/80">{t('createInvoice.discountAmount')}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) => handleInputChange("discount", Number(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-white/50 border border-[#242021]/10 rounded-xl focus:border-[#ffd17a] focus:ring-2 focus:ring-[#ffd17a]/30 transition-all duration-300 text-[#242021]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#242021]/80">{t('createInvoice.paidAmount')}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.paidAmount}
                    onChange={(e) => handleInputChange("paidAmount", Number(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-white/50 border border-[#242021]/10 rounded-xl focus:border-[#ffd17a] focus:ring-2 focus:ring-[#ffd17a]/30 transition-all duration-300 text-[#242021]"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-[#242021]/80">{t('createInvoice.notes')}</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-[#242021]/10 rounded-xl focus:border-[#ffd17a] focus:ring-2 focus:ring-[#ffd17a]/30 transition-all duration-300 text-[#242021] placeholder-[#242021]/50"
                rows={4}
                placeholder={t('createInvoice.notesPlaceholder')}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={handlePreview}
                className="flex items-center gap-2 px-6 py-3 bg-white/50 border border-[#242021]/10 rounded-xl hover:bg-[#ffd17a]/10 text-[#242021] font-semibold transition-all duration-300"
              >
                <FaEye className="w-4 h-4" /> {t('createInvoice.preview')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-[#ffd17a] text-[#242021] rounded-xl hover:bg-[#ffd17a]/80 disabled:opacity-50 font-semibold transition-all duration-300"
              >
                <FaSave className="w-4 h-4" /> {loading ? t('createInvoice.saving') : t('createInvoice.saveInvoice')}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </motion.div>
  );
};

export default CreateInvoiceModal;