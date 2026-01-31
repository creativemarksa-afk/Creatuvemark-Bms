"use client";
import React from 'react';
import { 
  Download, 
  Printer, 
  X,
  ArrowLeft,
  FileText,
  CheckCircle
} from 'lucide-react';
import { useTranslation } from '../../i18n/TranslationContext';

const RegistrationSlipGenerator = ({ application, onClose }) => {
  const { t, locale } = useTranslation();
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);
  const isArabic = locale === 'ar';

  if (!application) return null;

  const slipNumber = `REG-${application.applicationId?.slice(-8).toUpperCase() || application._id?.slice(-8).toUpperCase() || '00000000'}`;
  const slipDate = new Date(application.createdAt || Date.now());
  const formattedDate = slipDate.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'submitted':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-300';
      case 'in-progress':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-300';
    }
  };

  const openPrintWindow = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    
    if (!printWindow) {
      alert('Please allow pop-ups to print the registration slip.');
      return;
    }

    const slipHTML = generateSlipHTML();
    printWindow.document.write(slipHTML);
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
      tempDiv.innerHTML = generateSlipHTML();
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);
      
      const slipElement = tempDiv.querySelector('.slip-content');
      const html2pdf = (await import('html2pdf.js')).default;
      
      const opt = {
        margin: 10,
        filename: `Registration-Slip-${slipNumber}-${application.client?.name?.replace(/\s+/g, '-') || 'Client'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(slipElement).save();
      document.body.removeChild(tempDiv);
      setIsGeneratingPdf(false);
      
    } catch (error) {
      console.error('PDF error:', error);
      setIsGeneratingPdf(false);
      alert('PDF download failed. Please use Print instead.');
    }
  };

  const generateSlipHTML = () => {
    const dir = isArabic ? 'rtl' : 'ltr';
    const textAlign = isArabic ? 'right' : 'left';
    const reverseAlign = isArabic ? 'left' : 'right';
    
    return `
<!DOCTYPE html>
<html lang="${isArabic ? 'ar' : 'en'}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Slip ${slipNumber}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  ${isArabic ? '<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap" rel="stylesheet">' : ''}
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: ${isArabic ? "'Cairo', 'Segoe UI', Tahoma, sans-serif" : "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"};
      background: white;
      padding: 20px;
      color: #1e293b;
      direction: ${dir};
    }
    
    .slip-content {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border: 1px solid #e2e8f0;
    }
    
    .header {
      border-bottom: 3px solid #242021;
      padding-bottom: 20px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    
    .company-section {
      flex: 1;
    }
    
    .company-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
    }
    
    .logo-image {
      width: 50px;
      height: 50px;
      object-fit: contain;
    }
    
    .company-info h1 {
      font-size: 24px;
      font-weight: 700;
      color: #242021;
      margin: 0;
    }
    
    .company-info p {
      font-size: 12px;
      color: #64748b;
      margin: 2px 0 0 0;
    }
    
    .company-details {
      margin-top: 8px;
      font-size: 11px;
      color: #64748b;
      line-height: 1.6;
    }
    
    .slip-header-section {
      text-align: ${reverseAlign};
    }
    
    .slip-title {
      font-size: 28px;
      font-weight: 700;
      color: #242021;
      margin-bottom: 5px;
    }
    
    .slip-subtitle {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    
    .slip-number {
      background: #242021;
      color: #ffd17a;
      padding: 8px 12px;
      border-radius: 4px;
      display: inline-block;
      font-size: 14px;
      font-weight: 600;
    }
    
    .info-section {
      margin-bottom: 25px;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #242021;
      background: #f8fafc;
      padding: 10px 12px;
      margin-bottom: 12px;
      border-${textAlign}: 4px solid #242021;
    }
    
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    
    .info-table th,
    .info-table td {
      padding: 10px 12px;
      border: 1px solid #e2e8f0;
      text-align: ${textAlign};
    }
    
    .info-table th {
      background: #f8fafc;
      font-size: 12px;
      font-weight: 600;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .info-table td {
      font-size: 13px;
      color: #1e293b;
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .badge-approved {
      background: #d1fae5;
      color: #065f46;
    }
    
    .badge-submitted {
      background: #dbeafe;
      color: #1e40af;
    }
    
    .badge-rejected {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .badge-in-progress {
      background: #fef3c7;
      color: #92400e;
    }
    
    .badge-default {
      background: #f1f5f9;
      color: #475569;
    }
    
    .yes-no {
      font-weight: 600;
    }
    
    .yes-no.yes {
      color: #059669;
    }
    
    .yes-no.no {
      color: #dc2626;
    }
    
    .footer {
      border-top: 2px solid #e2e8f0;
      padding-top: 20px;
      margin-top: 30px;
      text-align: center;
    }
    
    .footer-note {
      background: #fef3c7;
      border: 1px solid #fbbf24;
      border-radius: 4px;
      padding: 12px;
      margin-bottom: 15px;
      text-align: ${textAlign};
    }
    
    .footer-note-title {
      font-size: 13px;
      font-weight: 600;
      color: #78350f;
      margin-bottom: 4px;
    }
    
    .footer-note-text {
      font-size: 11px;
      color: #92400e;
      line-height: 1.5;
    }
    
    .legal {
      font-size: 10px;
      color: #94a3b8;
      line-height: 1.5;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .slip-content {
        border: none;
        padding: 20px;
        max-width: 100%;
      }
      
      * {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
    
    @page {
      size: A4;
      margin: 15mm;
    }
  </style>
</head>
<body>
  <div class="slip-content">
    <!-- Header -->
    <div class="header">
      <div class="company-section">
        <div class="company-logo">
          <img src="/CreativeMarkFavicon.png" alt="Creative Mark Logo" class="logo-image" />
          <div class="company-info">
            <h1>Creative Mark</h1>
            <p>Business Management Solutions</p>
          </div>
        </div>
        <div class="company-details">
          Contact: support@creativemark.com | Phone: +966 XX XXX XXXX
        </div>
      </div>
      <div class="slip-header-section">
        <div class="slip-title">REGISTRATION SLIP</div>
        <div class="slip-subtitle">Official Application Record</div>
        <div class="slip-number">${slipNumber}</div>
        <div style="margin-top: 8px; font-size: 11px; color: #64748b;">
          Date: ${formattedDate}
        </div>
      </div>
    </div>

    <!-- Application Status -->
    <div class="info-section">
      <div class="section-title">Application Status</div>
      <table class="info-table">
        <tr>
          <th>Application ID</th>
          <td>${application.applicationId || 'N/A'}</td>
          <th>Current Status</th>
          <td>
            ${(() => {
              const status = (application.status?.current || application.status || 'pending').toLowerCase();
              let badgeClass = 'badge-default';
              if (status === 'approved') badgeClass = 'badge-approved';
              else if (status === 'submitted') badgeClass = 'badge-submitted';
              else if (status === 'rejected') badgeClass = 'badge-rejected';
              else if (status.includes('progress')) badgeClass = 'badge-in-progress';
              return `<span class="status-badge ${badgeClass}">${status.toUpperCase()}</span>`;
            })()}
          </td>
        </tr>
        <tr>
          <th>Submission Date</th>
          <td>${formattedDate}</td>
          <th>Last Updated</th>
          <td>${new Date(application.updatedAt || application.createdAt).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
        </tr>
      </table>
    </div>

    <!-- Client Information -->
    <div class="info-section">
      <div class="section-title">Client Information</div>
      <table class="info-table">
        <tr>
          <th>Full Name</th>
          <td>${application.client?.name || 'N/A'}</td>
          <th>Email Address</th>
          <td>${application.client?.email || 'N/A'}</td>
        </tr>
        <tr>
          <th>Phone Number</th>
          <td>${application.client?.phone || 'N/A'}</td>
          <th>Nationality</th>
          <td>${application.client?.nationality || 'N/A'}</td>
        </tr>
      </table>
    </div>

    <!-- Service Details -->
    <div class="info-section">
      <div class="section-title">Service Details</div>
      <table class="info-table">
        <tr>
          <th>Service Type</th>
          <td>${application.serviceDetails?.serviceType || application.serviceType || 'N/A'}</td>
          <th>Partner Type</th>
          <td>${application.serviceDetails?.partnerType || application.partnerType || 'N/A'}</td>
        </tr>
        <tr>
          <th>External Companies Count</th>
          <td>${application.serviceDetails?.externalCompaniesCount || application.externalCompaniesCount || 0}</td>
          <th>Virtual Office Required</th>
          <td>
            ${(application.serviceDetails?.needVirtualOffice || application.needVirtualOffice) ? 
              '<span class="yes-no yes">✓ Yes</span>' : 
              '<span class="yes-no no">✗ No</span>'
            }
          </td>
        </tr>
        ${(application.serviceDetails?.projectEstimatedValue || application.projectEstimatedValue) ? `
        <tr>
          <th>Project Estimated Value</th>
          <td>${(application.serviceDetails?.projectEstimatedValue || application.projectEstimatedValue).toLocaleString()} SAR</td>
          <th>Company Arranges External Companies</th>
          <td>
            ${(application.serviceDetails?.companyArrangesExternalCompanies || application.companyArrangesExternalCompanies) ? 
              '<span class="yes-no yes">✓ Yes</span>' : 
              '<span class="yes-no no">✗ No</span>'
            }
          </td>
        </tr>
        ` : `
        <tr>
          <th>Company Arranges External Companies</th>
          <td colspan="3">
            ${(application.serviceDetails?.companyArrangesExternalCompanies || application.companyArrangesExternalCompanies) ? 
              '<span class="yes-no yes">✓ Yes</span>' : 
              '<span class="yes-no no">✗ No</span>'
            }
          </td>
        </tr>
        `}
      </table>
    </div>

    <!-- Partner Information (if exists) -->
    ${(application.partner || application.serviceDetails?.partner || application.serviceDetails?.saudiPartnerName || application.saudiPartnerName) ? `
    <div class="info-section">
      <div class="section-title">Partner Information</div>
      <table class="info-table">
        ${(application.serviceDetails?.saudiPartnerName || application.saudiPartnerName) ? `
        <tr>
          <th>Saudi Partner Name</th>
          <td colspan="3">${application.serviceDetails?.saudiPartnerName || application.saudiPartnerName}</td>
        </tr>
        ` : ''}
        ${(application.partner || application.serviceDetails?.partner) ? `
        <tr>
          <th>Partner Name</th>
          <td>${(application.partner || application.serviceDetails?.partner)?.name || 'N/A'}</td>
          <th>Email</th>
          <td>${(application.partner || application.serviceDetails?.partner)?.email || 'N/A'}</td>
        </tr>
        <tr>
          <th>Phone</th>
          <td colspan="3">${(application.partner || application.serviceDetails?.partner)?.phone || 'N/A'}</td>
        </tr>
        ` : ''}
      </table>
    </div>
    ` : ''}

    <!-- External Companies (if exists) -->
    ${((application.serviceDetails?.externalCompaniesDetails || application.externalCompaniesDetails) && (application.serviceDetails?.externalCompaniesDetails || application.externalCompaniesDetails).length > 0) ? `
    <div class="info-section">
      <div class="section-title">External Companies</div>
      <table class="info-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Company Name</th>
            <th>Country</th>
            <th>CR Number</th>
            <th>Share %</th>
          </tr>
        </thead>
        <tbody>
          ${(application.serviceDetails?.externalCompaniesDetails || application.externalCompaniesDetails).map((company, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${company.companyName || 'N/A'}</td>
              <td>${company.country || 'N/A'}</td>
              <td>${company.crNumber || 'N/A'}</td>
              <td>${company.sharePercentage || 0}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    <!-- Family Members (if exists) -->
    ${((application.serviceDetails?.familyMembers || application.familyMembers) && (application.serviceDetails?.familyMembers || application.familyMembers).length > 0) ? `
    <div class="info-section">
      <div class="section-title">Family Members</div>
      <table class="info-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Full Name</th>
            <th>Relationship</th>
            <th>Passport Number</th>
          </tr>
        </thead>
        <tbody>
          ${(application.serviceDetails?.familyMembers || application.familyMembers).map((member, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${member.name || 'N/A'}</td>
              <td>${member.relation || 'N/A'}</td>
              <td>${member.passportNo || 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    <!-- Documents (if exists) -->
    ${(application.documents && application.documents.length > 0) ? `
    <div class="info-section">
      <div class="section-title">Uploaded Documents</div>
      <table class="info-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Document Type</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${application.documents.map((doc, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${doc.documentType || `Document ${index + 1}`}</td>
              <td><span class="status-badge badge-submitted">Uploaded</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    <!-- Footer -->
    <div class="footer">
      <div class="footer-note">
        <div class="footer-note-title">Important Notice</div>
        <div class="footer-note-text">
          This is an official registration slip for the submitted application. Please keep this document for your records.
          For any inquiries, please contact us at support@creativemark.com
        </div>
      </div>
      
      <div class="legal">
        <p>This document is computer generated and does not require a signature.</p>
        <p>Creative Mark Business Management Solutions © ${new Date().getFullYear()} - All Rights Reserved</p>
        <p>Generated: ${new Date().toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
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
              <h2 className="text-lg sm:text-xl font-bold text-amber-400 mb-1">Registration Slip Ready</h2>
              <p className="text-amber-200/70 text-sm">Slip #{slipNumber}</p>
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
              <FileText className="text-white" size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">✨ Registration Slip Generated</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Complete application details formatted for printing or download
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-lg mx-auto shadow-xl border border-slate-200">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 rounded-2xl mx-auto mb-5 flex items-center justify-center shadow-2xl">
                <div className="text-center">
                  <FileText className="text-amber-400 mx-auto mb-1" size={32} />
                  <div className="text-amber-400 text-xs font-bold tracking-wider">REG SLIP</div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{slipNumber}</h3>
                <div className="inline-block bg-gradient-to-r from-slate-100 to-slate-200 px-4 py-2 rounded-lg border border-slate-300">
                  <p className="text-sm text-slate-700 font-semibold">{application.client?.name || 'Client'}</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 mb-6 border-2 border-emerald-200">
                <div className="text-xs text-emerald-700 uppercase tracking-wide mb-1 font-semibold">Application Status</div>
                <div className="text-2xl font-bold text-emerald-800">
                  {(application.status?.current || application.status || 'Pending').toUpperCase()}
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={openPrintWindow}
                  className="w-full py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-amber-400 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm"
                >
                  <Printer size={18} />
                  Open and Print Slip
                </button>
                <button
                  onClick={downloadPDF}
                  disabled={isGeneratingPdf}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isGeneratingPdf ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      Download PDF
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
            Back to Application
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSlipGenerator;

