"use client";
import React from 'react';
import { 
  Printer, 
  Download,
  X,
  ArrowLeft
} from 'lucide-react';
import { useTranslation } from '../../i18n/TranslationContext';
import { useAuth } from '../../contexts/AuthContext';

const InvoicePrintWindow = ({ payment, onClose }) => {
  const { t, locale } = useTranslation();
  const { user: currentUser } = useAuth();
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);
  const isArabic = locale === 'ar';

  if (!payment) return null;

  // Use populated data if available, fallback to currentUser if clientId is a string
  const clientInfo =
    payment.clientId && typeof payment.clientId === 'object'
      ? payment.clientId
      : currentUser || {};

  const clientName = clientInfo.fullName || 'N/A';
  const clientEmail = clientInfo.email || '';
  const clientPhone = clientInfo.phone || '';
  const clientPhoneCode = clientInfo.phoneCountryCode || '+966';
  const clientNationality = clientInfo.nationality || '';
  const clientAddress = clientInfo.address || {};
  const fullAddress = [
    clientAddress.street,
    clientAddress.city,
    clientAddress.state,
    clientAddress.zipCode,
    clientAddress.country
  ].filter(Boolean).join(', ');

  const invoiceNumber = `INV-${payment._id?.slice(-8).toUpperCase() || '00000000'}`;
  const invoiceDate = new Date(payment.createdAt || Date.now());
  const formattedDate = invoiceDate.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(isArabic ? 'ar-SA' : 'en-SA', {
      style: 'currency',
      currency: payment.currency || 'SAR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'submitted':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-300';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-300';
    }
  };

  const openPrintWindow = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      alert(t('invoice.allowPopups') || 'Please allow pop-ups to print the invoice.');
      return;
    }

    const invoiceHTML = generateInvoiceHTML();
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  };

  const downloadPDF = async () => {
    try {
      setIsGeneratingPdf(true);
      
      // Create a temporary container
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = generateInvoiceHTML();
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);
      
      const invoiceElement = tempDiv.querySelector('.invoice-content');
      
      // Import html2pdf
      const html2pdf = (await import('html2pdf.js')).default;
      
      const opt = {
        margin: 10,
        filename: `Invoice-${invoiceNumber}-${clientName.replace(/\s+/g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 3,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait'
        }
      };

      await html2pdf().set(opt).from(invoiceElement).save();
      
      // Cleanup
      document.body.removeChild(tempDiv);
      setIsGeneratingPdf(false);
      
    } catch (error) {
      console.error('PDF error:', error);
      setIsGeneratingPdf(false);
      alert(t('invoice.pdfFailed') || 'PDF download failed. Please use Print instead.');
    }
  };

  const generateInvoiceHTML = () => {
    const dir = isArabic ? 'rtl' : 'ltr';
    const textAlign = isArabic ? 'right' : 'left';
    const reverseAlign = isArabic ? 'left' : 'right';
    
    return `
<!DOCTYPE html>
<html lang="${isArabic ? 'ar' : 'en'}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t('invoice.title')} ${invoiceNumber}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  ${isArabic ? '<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap" rel="stylesheet">' : ''}
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: ${isArabic ? "'Cairo', 'Segoe UI', Tahoma, sans-serif" : "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"};
      background: white;
      padding: 10px;
      color: #1f2937;
      line-height: 1.3;
      direction: ${dir};
    }
    
    .invoice-content {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 20px;
    }
    
    .header {
      border-bottom: 3px solid #242021;
      padding-bottom: 12px;
      margin-bottom: 15px;
      display: flex;
      justify-content: space-between;
      align-items: start;
    }
    
    .company-logo {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .logo-image {
      width: 45px;
      height: 45px;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(36, 32, 33, 0.15);
    }
    
    .company-info h1 {
      font-size: 22px;
      font-weight: 700;
      color: #242021;
      margin-bottom: 2px;
      line-height: 1.2;
    }
    
    .company-info p {
      font-size: 11px;
      color: #6b7280;
    }
    
    .company-details {
      margin-top: 8px;
      font-size: 10px;
      color: #6b7280;
      line-height: 1.5;
    }
    
    .invoice-header {
      text-align: ${reverseAlign};
    }
    
    .invoice-header h2 {
      font-size: 24px;
      font-weight: 700;
      color: #242021;
      margin-bottom: 4px;
      line-height: 1.2;
    }
    
    .invoice-header .subtitle {
      font-size: 11px;
      color: #6b7280;
      margin-bottom: 10px;
    }
    
    .invoice-number {
      background: #242021;
      color: #ffd17a;
      padding: 8px 16px;
      border-radius: 6px;
      display: inline-block;
    }
    
    .invoice-number .label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.9;
      margin-bottom: 2px;
    }
    
    .invoice-number .number {
      font-size: 15px;
      font-weight: 700;
    }
    
    .details-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 15px;
    }
    
    .detail-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 12px;
    }
    
    .detail-card h3 {
      font-size: 10px;
      font-weight: 700;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    
    .detail-card .client-name {
      font-size: 14px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 6px;
      line-height: 1.2;
    }
    
    .detail-card .info-row {
      font-size: 11px;
      color: #6b7280;
      margin-bottom: 3px;
      line-height: 1.3;
    }
    
    .detail-card .info-row strong {
      color: #111827;
    }
    
    .status-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      border: 1px solid;
    }
    
    .service-table {
      width: 100%;
      margin-bottom: 15px;
      border-collapse: collapse;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .service-table thead {
      background: #242021;
      color: #ffd17a;
    }
    
    .service-table th {
      padding: 10px 12px;
      text-align: left;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .service-table td {
      padding: 12px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
    }
    
    .service-table .service-title {
      font-weight: 600;
      color: #111827;
      margin-bottom: 2px;
      font-size: 13px;
    }
    
    .service-table .service-desc {
      font-size: 10px;
      color: #6b7280;
    }
    
    .service-table .app-id {
      font-family: monospace;
      background: #e5e7eb;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 10px;
    }
    
    .installments-table {
      width: 100%;
      margin-bottom: 12px;
      border-collapse: collapse;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      overflow: hidden;
    }
    
    .installments-table thead {
      background: #f3f4f6;
    }
    
    .installments-table th {
      padding: 8px 10px;
      text-align: left;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      color: #374151;
      letter-spacing: 0.3px;
    }
    
    .installments-table td {
      padding: 8px 10px;
      border-top: 1px solid #e5e7eb;
      font-size: 11px;
    }
    
    .summary-box {
      max-width: 350px;
      margin-left: auto;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 12px;
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid #e5e7eb;
      font-size: 11px;
    }
    
    .summary-row.total {
      border-bottom: none;
      padding-top: 10px;
      border-top: 2px solid #d1d5db;
    }
    
    .summary-row.total .label {
      font-size: 13px;
      font-weight: 700;
    }
    
    .summary-row.total .amount {
      font-size: 20px;
      font-weight: 700;
      color: #242021;
    }
    
    .approval-badge {
      background: #ecfdf5;
      border: 1.5px solid #a7f3d0;
      border-radius: 6px;
      padding: 10px 12px;
      margin-bottom: 12px;
      display: flex;
      align-items: start;
      gap: 10px;
    }
    
    .approval-icon {
      width: 30px;
      height: 30px;
      background: #10b981;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-center;
      color: white;
      font-size: 16px;
      flex-shrink: 0;
    }
    
    .approval-content h4 {
      font-size: 13px;
      font-weight: 700;
      color: #065f46;
      margin-bottom: 3px;
      line-height: 1.2;
    }
    
    .approval-content p {
      font-size: 11px;
      color: #047857;
      line-height: 1.3;
    }
    
    .approval-details {
      margin-top: 6px;
      padding-top: 6px;
      border-top: 1px solid #a7f3d0;
      font-size: 9px;
      color: #059669;
    }
    
    .approval-notes {
      margin-top: 4px;
      font-size: 10px;
      color: #065f46;
      line-height: 1.3;
    }
    
    .footer {
      border-top: 1.5px solid #e5e7eb;
      padding-top: 12px;
      margin-top: 12px;
    }
    
    .footer-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 12px;
    }
    
    .footer-column h4 {
      font-size: 10px;
      font-weight: 700;
      color: #374151;
      margin-bottom: 4px;
    }
    
    .footer-column p {
      font-size: 10px;
      color: #6b7280;
      line-height: 1.4;
    }
    
    .thank-you {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      color: #fbbf24;
      padding: 12px;
      border-radius: 6px;
      text-align: center;
      margin-bottom: 10px;
    }
    
    .thank-you .title {
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .thank-you .subtitle {
      font-size: 10px;
      color: #fcd34d;
      line-height: 1.3;
    }
    
    .legal {
      text-align: center;
      font-size: 9px;
      color: #9ca3af;
      margin-top: 8px;
    }
    
    .legal p {
      margin-bottom: 2px;
      line-height: 1.3;
    }
    
    @media print {
      body {
        padding: 0;
        margin: 0;
      }
      
      .no-print {
        display: none !important;
      }
      
      .invoice-content {
        padding: 15px;
        max-width: 100%;
      }
      
      * {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      /* Ensure single page */
      .header {
        margin-bottom: 10px;
        padding-bottom: 10px;
      }
      
      .details-section {
        margin-bottom: 10px;
      }
      
      .service-table {
        margin-bottom: 10px;
      }
      
      .installments-table {
        margin-bottom: 10px;
      }
      
      .summary-box {
        margin-bottom: 10px;
      }
      
      .approval-badge {
        margin-bottom: 10px;
        padding: 8px;
      }
      
      .footer {
        margin-top: 10px;
        padding-top: 10px;
      }
      
      .footer-columns {
        margin-bottom: 8px;
      }
      
      .thank-you {
        margin-bottom: 8px;
        padding: 10px;
      }
    }
    
    @page {
      size: A4;
      margin: 12mm;
    }
    
    .action-buttons {
      position: sticky;
      bottom: 0;
      background: white;
      padding: 20px;
      border-top: 2px solid #e5e7eb;
      display: flex;
      gap: 10px;
      margin: -40px -40px 0 -40px;
    }
    
    .btn {
      flex: 1;
      padding: 12px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;
    }
    
    .btn-back {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
    }
    
    .btn-back:hover {
      background: #e2e8f0;
    }
    
    .btn-pdf {
      background: #2563eb;
      color: white;
    }
    
    .btn-pdf:hover {
      background: #1d4ed8;
    }
    
    .btn-pdf:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .btn-print {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      color: #fbbf24;
      font-weight: 700;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .btn-print:hover {
      background: linear-gradient(135deg, #334155 0%, #475569 100%);
    }
    
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid white;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="invoice-content">
    <!-- Company Header -->
    <div class="header">
      <div>
        <div class="company-logo">
          <img src="/CreativeMarkFavicon.png" alt="Creative Mark Logo" class="logo-image" />
          <div class="company-info">
            <h1>${t('invoice.companyName')}</h1>
            <p>${t('invoice.companySubtitle')}</p>
          </div>
        </div>
        <div class="company-details">
          <p>📍 ${t('invoice.companyAddress')}</p>
          <p>📞 ${t('invoice.companyPhone')}</p>
          <p>✉️ ${t('invoice.companyEmail')}</p>
        </div>
      </div>
      <div class="invoice-header">
        <h2>${t('invoice.title').toUpperCase()}</h2>
        <p class="subtitle">${t('invoice.officialReceipt')}</p>
        <div class="invoice-number">
          <div class="label">${t('invoice.invoiceNumber')}</div>
          <div class="number">${invoiceNumber}</div>
        </div>
      </div>
    </div>

    <!-- Client & Invoice Details -->
    <div class="details-section">
      <div class="detail-card">
        <h3>${t('invoice.billTo')}</h3>
        <div class="client-name">${clientName}</div>
        ${clientEmail ? `<div class="info-row">✉️ ${clientEmail}</div>` : ''}
        ${clientPhone ? `<div class="info-row">📞 ${clientPhoneCode} ${clientPhone}</div>` : ''}
        ${clientNationality ? `<div class="info-row">${t('invoice.nationality')}: <strong>${clientNationality}</strong></div>` : ''}
        ${fullAddress ? `<div class="info-row">📍 ${fullAddress}</div>` : ''}
      </div>
      
      <div class="detail-card">
        <h3>${t('invoice.invoiceDetails')}</h3>
        <div class="info-row">${t('invoice.invoiceDate')}: <strong>${formattedDate}</strong></div>
        <div class="info-row">
          ${t('invoice.status')}: 
          <span class="status-badge ${getPaymentStatusColor(payment.status)}">${payment.status?.toUpperCase()}</span>
        </div>
        <div class="info-row">${t('invoice.paymentPlan')}: <strong>${payment.paymentPlan || 'Full'}</strong></div>
        ${payment.dueDate ? `<div class="info-row">${t('invoice.dueDate')}: <strong>${new Date(payment.dueDate).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}</strong></div>` : ''}
      </div>
    </div>

    <!-- Service Details -->
    <table class="service-table">
      <thead>
        <tr>
          <th style="text-align: ${textAlign};">${t('invoice.description')}</th>
          <th style="text-align: center;">${t('invoice.applicationId')}</th>
          <th style="text-align: ${reverseAlign};">${t('invoice.amount')}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align: ${textAlign};">
            <div class="service-title">${payment.applicationId?.serviceType ? payment.applicationId.serviceType.charAt(0).toUpperCase() + payment.applicationId.serviceType.slice(1) : ''} ${t('invoice.applicationProcessing')}</div>
            <div class="service-desc">${t('invoice.professionalService')}</div>
          </td>
          <td style="text-align: center;">
            <span class="app-id">${payment.applicationId?._id?.slice(-8).toUpperCase() || 'N/A'}</span>
          </td>
          <td style="text-align: ${reverseAlign};">
            <strong style="font-size: 16px;">${formatCurrency(payment.totalAmount)}</strong>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Installments (if applicable) - Compact -->
    ${payment.paymentPlan === 'installments' && payment.installments && payment.installments.length > 0 ? `
    <div style="margin-bottom: 12px;">
      <h3 style="font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; margin-bottom: 8px; text-align: ${textAlign};">${t('invoice.installmentSchedule')}</h3>
      <table class="installments-table">
        <thead>
          <tr>
            <th style="text-align: ${textAlign};">${t('invoice.installment')}</th>
            <th style="text-align: ${textAlign};">${t('invoice.dueDate')}</th>
            <th style="text-align: center;">${t('invoice.status')}</th>
            <th style="text-align: ${reverseAlign};">${t('invoice.amount')}</th>
          </tr>
        </thead>
        <tbody>
          ${payment.installments.map((inst, idx) => `
            <tr>
              <td style="text-align: ${textAlign};"><strong>#${idx + 1}</strong></td>
              <td style="text-align: ${textAlign}; font-size: 10px;">${inst.date ? new Date(inst.date).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' }) : 'N/A'}</td>
              <td style="text-align: center;">
                <span class="status-badge ${getPaymentStatusColor(inst.status)}">${inst.status?.toUpperCase()}</span>
              </td>
              <td style="text-align: ${reverseAlign};"><strong>${formatCurrency(inst.amount)}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    <!-- Payment Summary -->
    <div class="summary-box">
      <div class="summary-row">
        <span>${t('invoice.subtotal')}:</span>
        <strong>${formatCurrency(payment.totalAmount)}</strong>
      </div>
      <div class="summary-row">
        <span>${t('invoice.tax')} (${t('invoice.vat')} 0%):</span>
        <strong>${formatCurrency(0)}</strong>
      </div>
      <div class="summary-row total">
        <span class="label">${t('invoice.totalAmount')}:</span>
        <span class="amount">${formatCurrency(payment.totalAmount)}</span>
      </div>
    </div>

    <!-- Approval Badge (if approved) - Compact -->
    ${payment.status === 'approved' ? `
    <div class="approval-badge">
      <div class="approval-icon">✓</div>
      <div class="approval-content">
        <h4>${t('invoice.paymentApproved')}</h4>
        <p>${t('invoice.verifiedByAdmin')}</p>
        ${payment.verifiedAt ? `
          <div class="approval-details">
            ${t('invoice.verifiedOn')}: ${new Date(payment.verifiedAt).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        ` : ''}
        ${payment.adminNotes ? `
          <div class="approval-notes">
            <strong>${t('invoice.adminNotes')}:</strong> ${payment.adminNotes}
          </div>
        ` : ''}
      </div>
    </div>
    ` : ''}

    <!-- Footer -->
    <div class="footer">
      <div class="footer-columns">
        <div class="footer-column">
          <h4>${t('invoice.paymentMethods')}</h4>
          <p>${t('invoice.paymentMethodsDesc')}</p>
        </div>
        <div class="footer-column">
          <h4>${t('invoice.termsConditions')}</h4>
          <p>${t('invoice.termsDesc')}</p>
        </div>
      </div>

      <div class="thank-you">
        <div class="title">${t('invoice.thankYou')}</div>
        <div class="subtitle">${t('invoice.contactInfo')} <strong>support@creativemark.com</strong></div>
      </div>

      <div class="legal">
        <p>${t('invoice.computerGenerated')}</p>
        <p>${t('invoice.companyName')} © ${new Date().getFullYear()} - ${t('invoice.allRightsReserved')}</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#242021] to-[#3a3537] p-4 sm:p-5 flex justify-between items-center">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#ffd17a]">{t('invoice.invoiceReady')}</h2>
            <p className="text-[#ffd17a]/70 text-sm">{t('invoice.title')} #{invoiceNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#ffd17a] hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Preview Message */}
        <div className="p-4 sm:p-6 bg-blue-50 border-b border-blue-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Printer className="text-white" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 text-sm sm:text-base mb-1">{t('invoice.readyToPrint')}</h3>
              <p className="text-xs sm:text-sm text-blue-700">
                {t('invoice.clickToPrint')}
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Preview (Simplified) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-3xl mx-auto border-2 border-dashed border-gray-300">
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-[#242021] to-[#3a3537] rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Printer className="text-[#ffd17a]" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('invoice.readyToPrint')}</h3>
              <p className="text-gray-600 mb-1">
                <strong>{clientName}</strong>
              </p>
              <p className="text-gray-600 mb-4">
                {t('invoice.amount')}: <strong className="text-2xl text-[#242021]">{formatCurrency(payment.totalAmount)}</strong>
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center max-w-md mx-auto">
                <button
                  onClick={openPrintWindow}
                  className="flex-1 py-3 bg-[#242021] text-[#ffd17a] font-bold rounded-lg hover:bg-[#3a3537] transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Printer size={18} />
                  {t('invoice.openAndPrint')}
                </button>
                <button
                  onClick={downloadPDF}
                  disabled={isGeneratingPdf}
                  className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingPdf ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t('invoice.generating')}...
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      {t('invoice.downloadPDF')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="bg-white border-t-2 border-slate-200 p-4 sm:p-5 flex gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 sm:py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 border border-slate-300 text-sm"
          >
            <ArrowLeft size={16} />
            {t('invoice.backToPayments')}
          </button>
          <button
            onClick={openPrintWindow}
            className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-amber-400 font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-xl text-sm"
          >
            <Printer size={16} />
            {t('invoice.printInvoice')}
          </button>
          <button
            onClick={downloadPDF}
            disabled={isGeneratingPdf}
            className="flex-1 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 text-sm"
          >
            {isGeneratingPdf ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t('invoice.generating')}...
              </>
            ) : (
              <>
                <Download size={16} />
                {t('invoice.downloadPDF')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrintWindow;

