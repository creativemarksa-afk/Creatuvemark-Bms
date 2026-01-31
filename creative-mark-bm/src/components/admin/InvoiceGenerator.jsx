"use client";
import React from 'react';
import { 
  Download, 
  Printer, 
  X,
  ArrowLeft
} from 'lucide-react';
import { useTranslation } from '../../i18n/TranslationContext';
import { useAuth } from '../../contexts/AuthContext';

const InvoiceGenerator = ({ payment, onClose }) => {
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
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    
    if (!printWindow) {
      alert(t('invoice.allowPopups') || 'Please allow pop-ups to print the invoice.');
      return;
    }

    const invoiceHTML = generateInvoiceHTML();
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 300);
    };
  };

  const downloadPDF = async () => {
    try {
      setIsGeneratingPdf(true);
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = generateInvoiceHTML();
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);
      
      const invoiceElement = tempDiv.querySelector('.invoice-content');
      const html2pdf = (await import('html2pdf.js')).default;
      
      const opt = {
        margin: 10,
        filename: `Invoice-${invoiceNumber}-${clientName.replace(/\s+/g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(invoiceElement).save();
      document.body.removeChild(tempDiv);
      setIsGeneratingPdf(false);
      
    } catch (error) {
      console.error('PDF error:', error);
      setIsGeneratingPdf(false);
      alert('PDF download failed. Please use Print instead.');
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
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      padding: 20px;
      color: #1e293b;
      direction: ${dir};
    }
    
    .invoice-content {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }
    
    .header {
      border-bottom: 3px solid;
      border-image: linear-gradient(90deg, #242021 0%, #ffd17a 100%) 1;
      padding-bottom: 20px;
      margin-bottom: 25px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
    }
    
    .company-section { flex: 1; }
    
    .company-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    
    .logo-image {
      width: 55px;
      height: 55px;
      object-fit: contain;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(36, 32, 33, 0.2);
    }
    
    .company-info h1 {
      font-size: 24px;
      font-weight: 800;
      color: #242021;
      margin-bottom: 2px;
      letter-spacing: -0.5px;
    }
    
    .company-info p {
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
    }
    
    .company-details {
      margin-${isArabic ? 'right' : 'left'}: 67px;
      font-size: 11px;
      color: #64748b;
      line-height: 1.8;
    }
    
    .company-details p {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .invoice-header-section {
      text-align: ${reverseAlign};
      flex-shrink: 0;
    }
    
    .invoice-title {
      font-size: 32px;
      font-weight: 800;
      background: linear-gradient(135deg, #242021 0%, #64748b 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 6px;
      letter-spacing: 2px;
    }
    
    .invoice-subtitle {
      font-size: 11px;
      color: #64748b;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .invoice-number {
      background: linear-gradient(135deg, #242021 0%, #3a3537 100%);
      color: #ffd17a;
      padding: 12px 18px;
      border-radius: 8px;
      display: inline-block;
      box-shadow: 0 4px 12px rgba(36, 32, 33, 0.15);
    }
    
    .invoice-number .label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.9;
      margin-bottom: 3px;
    }
    
    .invoice-number .number {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 1px;
    }
    
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 25px;
    }
    
    .detail-card {
      background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    
    .card-title {
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .client-name {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
      line-height: 1.3;
    }
    
    .info-line {
      font-size: 11px;
      color: #64748b;
      margin-bottom: 4px;
      line-height: 1.5;
    }
    
    .info-line strong {
      color: #1e293b;
      font-weight: 600;
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border: 1.5px solid;
    }
    
    .section-title {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
      padding-${isArabic ? 'right' : 'left'}: 4px;
    }
    
    .elegant-table {
      width: 100%;
      margin-bottom: 20px;
      border-collapse: separate;
      border-spacing: 0;
      background: white;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    
    .elegant-table thead {
      background: linear-gradient(135deg, #242021 0%, #3a3537 100%);
      color: #ffd17a;
    }
    
    .elegant-table th {
      padding: 12px 15px;
      text-align: ${textAlign};
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    
    .elegant-table td {
      padding: 14px 15px;
      border-top: 1px solid #f1f5f9;
      font-size: 12px;
    }
    
    .service-name {
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 3px;
      font-size: 13px;
    }
    
    .service-desc {
      font-size: 11px;
      color: #64748b;
    }
    
    .app-badge {
      font-family: 'Monaco', 'Courier New', monospace;
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 600;
      color: #475569;
      border: 1px solid #cbd5e1;
    }
    
    .summary-box {
      max-width: 400px;
      margin-${isArabic ? 'right' : 'left'}: auto;
      background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f1f5f9;
      font-size: 12px;
      color: #64748b;
    }
    
    .summary-row strong {
      color: #1e293b;
      font-weight: 600;
    }
    
    .summary-total {
      border-bottom: none;
      padding-top: 15px;
      border-top: 2px solid #cbd5e1;
      margin-top: 8px;
    }
    
    .summary-total .label {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }
    
    .summary-total .amount {
      font-size: 22px;
      font-weight: 800;
      background: linear-gradient(135deg, #242021 0%, #64748b 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .approval-box {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      border: 2px solid #6ee7b7;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 20px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
    }
    
    .approval-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-center;
      color: white;
      font-size: 20px;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    
    .approval-content h4 {
      font-size: 14px;
      font-weight: 700;
      color: #065f46;
      margin-bottom: 4px;
    }
    
    .approval-content p {
      font-size: 11px;
      color: #047857;
      line-height: 1.5;
    }
    
    .approval-meta {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #6ee7b7;
      font-size: 10px;
      color: #059669;
    }
    
    .footer {
      border-top: 2px solid #e2e8f0;
      padding-top: 20px;
      margin-top: 20px;
    }
    
    .footer-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .footer-card {
      background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px;
    }
    
    .footer-card h4 {
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .footer-card p {
      font-size: 11px;
      color: #64748b;
      line-height: 1.6;
    }
    
    .thank-you {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      color: #fbbf24;
      padding: 16px;
      border-radius: 10px;
      text-align: center;
      margin-bottom: 15px;
      box-shadow: 0 4px 16px rgba(30, 41, 59, 0.2);
    }
    
    .thank-you .title {
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 6px;
      letter-spacing: 0.5px;
    }
    
    .thank-you .subtitle {
      font-size: 11px;
      color: #fcd34d;
      line-height: 1.5;
    }
    
    .legal {
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      line-height: 1.6;
    }
    
    .legal p {
      margin-bottom: 3px;
    }
    
    .watermark {
      position: absolute;
      top: 50%;
      ${isArabic ? 'right' : 'left'}: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 120px;
      font-weight: 800;
      color: rgba(36, 32, 33, 0.02);
      z-index: 0;
      pointer-events: none;
    }
    
    .invoice-content > * {
      position: relative;
      z-index: 1;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .invoice-content {
        box-shadow: none;
        border: none;
        padding: 20px;
        max-width: 100%;
      }
      
      .header { margin-bottom: 15px; padding-bottom: 15px; }
      .details-grid { margin-bottom: 15px; }
      .elegant-table { margin-bottom: 15px; }
      .summary-box { margin-bottom: 15px; }
      .approval-box { margin-bottom: 15px; }
      .footer { margin-top: 15px; }
      
      * {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
    
    @page {
      size: A4;
      margin: 12mm;
    }
  </style>
</head>
<body>
  <div class="watermark">${t('invoice.companyName')}</div>
  <div class="invoice-content">
    <div class="header">
      <div class="company-section">
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
      <div class="invoice-header-section">
        <div class="invoice-title">${t('invoice.title')}</div>
        <div class="invoice-subtitle">${t('invoice.officialReceipt')}</div>
        <div class="invoice-number">
          <div class="label">${t('invoice.invoiceNumber')}</div>
          <div class="number">${invoiceNumber}</div>
        </div>
      </div>
    </div>

    <div class="details-grid">
      <div class="detail-card">
        <div class="card-title">👤 ${t('invoice.billTo')}</div>
        <div class="client-name">${clientName}</div>
        ${clientEmail ? `<div class="info-line">✉️ ${clientEmail}</div>` : ''}
        ${clientPhone ? `<div class="info-line">📞 ${clientPhoneCode} ${clientPhone}</div>` : ''}
        ${clientNationality ? `<div class="info-line">${t('invoice.nationality')}: <strong>${clientNationality}</strong></div>` : ''}
        ${fullAddress ? `<div class="info-line">📍 ${fullAddress}</div>` : ''}
      </div>
      
      <div class="detail-card">
        <div class="card-title">📄 ${t('invoice.invoiceDetails')}</div>
        <div class="info-line">${t('invoice.invoiceDate')}: <strong>${formattedDate}</strong></div>
        <div class="info-line">
          ${t('invoice.status')}: 
          <span class="status-badge ${getPaymentStatusColor(payment.status)}">${payment.status?.toUpperCase()}</span>
        </div>
        <div class="info-line">${t('invoice.paymentPlan')}: <strong>${payment.paymentPlan || 'Full'}</strong></div>
        ${payment.dueDate ? `<div class="info-line">${t('invoice.dueDate')}: <strong>${new Date(payment.dueDate).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}</strong></div>` : ''}
      </div>
    </div>

    <div class="section-title">${t('invoice.serviceDetails')}</div>
    <table class="elegant-table">
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
            <div class="service-name">${payment.applicationId?.serviceType ? payment.applicationId.serviceType.charAt(0).toUpperCase() + payment.applicationId.serviceType.slice(1) : ''} ${t('invoice.applicationProcessing')}</div>
            <div class="service-desc">${t('invoice.professionalService')}</div>
          </td>
          <td style="text-align: center;">
            <span class="app-badge">${payment.applicationId?._id?.slice(-8).toUpperCase() || 'N/A'}</span>
          </td>
          <td style="text-align: ${reverseAlign};">
            <strong style="font-size: 14px; color: #0f172a;">${formatCurrency(payment.totalAmount)}</strong>
          </td>
        </tr>
      </tbody>
    </table>

    ${payment.paymentPlan === 'installments' && payment.installments && payment.installments.length > 0 ? `
    <div class="section-title">${t('invoice.installmentSchedule')}</div>
    <table class="elegant-table">
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
            <td style="text-align: ${textAlign}; font-size: 11px;">${inst.date ? new Date(inst.date).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</td>
            <td style="text-align: center;">
              <span class="status-badge ${getPaymentStatusColor(inst.status)}">${inst.status?.toUpperCase()}</span>
            </td>
            <td style="text-align: ${reverseAlign};"><strong>${formatCurrency(inst.amount)}</strong></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ` : ''}

    <div class="summary-box">
      <div class="summary-row">
        <span>${t('invoice.subtotal')}:</span>
        <strong>${formatCurrency(payment.totalAmount)}</strong>
      </div>
      <div class="summary-row">
        <span>${t('invoice.tax')} (${t('invoice.vat')} 0%):</span>
        <strong>${formatCurrency(0)}</strong>
      </div>
      <div class="summary-row summary-total">
        <span class="label">${t('invoice.totalAmount')}:</span>
        <span class="amount">${formatCurrency(payment.totalAmount)}</span>
      </div>
    </div>

    ${payment.status === 'approved' ? `
    <div class="approval-box">
      <div class="approval-icon">✓</div>
      <div class="approval-content">
        <h4>${t('invoice.paymentApproved')}</h4>
        <p>${t('invoice.verifiedByAdmin')}</p>
        ${payment.verifiedAt ? `
          <div class="approval-meta">
            ${t('invoice.verifiedOn')}: ${new Date(payment.verifiedAt).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        ` : ''}
        ${payment.adminNotes ? `
          <div class="approval-meta">
            <strong>${t('invoice.adminNotes')}:</strong> ${payment.adminNotes}
          </div>
        ` : ''}
      </div>
    </div>
    ` : ''}

    <div class="footer">
      <div class="footer-grid">
        <div class="footer-card">
          <h4>💳 ${t('invoice.paymentMethods')}</h4>
          <p>${t('invoice.paymentMethodsDesc')}</p>
        </div>
        <div class="footer-card">
          <h4>📋 ${t('invoice.termsConditions')}</h4>
          <p>${t('invoice.termsDesc')}</p>
        </div>
      </div>

      <div class="thank-you">
        <div class="title">${t('invoice.thankYou')}</div>
        <div class="subtitle">
          ${t('invoice.contactInfo')} <strong>support@creativemark.com</strong>
        </div>
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-amber-400 mb-1">{t('invoice.invoiceReady')}</h2>
              <p className="text-amber-200/70 text-sm">{t('invoice.title')} #{invoiceNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-amber-400 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
              <Printer className="text-white" size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">✨ {t('invoice.readyToPrint')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('invoice.clickToPrint')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-lg mx-auto shadow-xl border border-slate-200">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 rounded-2xl mx-auto mb-5 flex items-center justify-center shadow-2xl">
                <div className="text-center">
                  <Printer className="text-amber-400 mx-auto mb-1" size={32} />
                  <div className="text-amber-400 text-xs font-bold tracking-wider">INVOICE</div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{invoiceNumber}</h3>
                <div className="inline-block bg-gradient-to-r from-slate-100 to-slate-200 px-4 py-2 rounded-lg border border-slate-300">
                  <p className="text-sm text-slate-700 font-semibold">{clientName}</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 mb-6 border-2 border-amber-200">
                <div className="text-xs text-amber-700 uppercase tracking-wide mb-1 font-semibold">{t('invoice.totalAmount')}</div>
                <div className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  {formatCurrency(payment.totalAmount)}
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={openPrintWindow}
                  className="w-full py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-amber-400 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm"
                >
                  <Printer size={18} />
                  {t('invoice.openAndPrint')}
                </button>
                <button
                  onClick={downloadPDF}
                  disabled={isGeneratingPdf}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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

        <div className="bg-slate-50 border-t-2 border-slate-200 p-4 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-all flex items-center gap-2 text-sm"
          >
            <ArrowLeft size={16} />
            {t('invoice.backToPayments')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
