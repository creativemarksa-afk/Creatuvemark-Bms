"use client";

import { forwardRef } from 'react';
import {
  FaFile,
  FaFilePdf,
  FaFileWord,
  FaImage,
  FaEye,
  FaDownload,
  FaPassport,
  FaIdCard,
  FaBuilding,
  FaFileContract
} from 'react-icons/fa';

const DocumentCard = forwardRef(({ 
  document, 
  className = '',
  onView,
  onDownload,
  ...props 
}, ref) => {
  const getDocumentIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'passport':
        return { icon: FaPassport, color: 'text-blue-600' };
      case 'idcard':
        return { icon: FaIdCard, color: 'text-green-600' };
      case 'saudipartneriqama':
        return { icon: FaIdCard, color: 'text-purple-600' };
      case 'commercial_registration':
        return { icon: FaBuilding, color: 'text-indigo-600' };
      case 'financial_statement':
        return { icon: FaFileContract, color: 'text-yellow-600' };
      case 'articles_of_association':
        return { icon: FaFileContract, color: 'text-red-600' };
      default:
        // Try to detect file type from URL
        const url = document?.fileUrl || '';
        if (url.includes('.pdf')) {
          return { icon: FaFilePdf, color: 'text-red-500' };
        }
        if (url.includes('.doc') || url.includes('.docx')) {
          return { icon: FaFileWord, color: 'text-blue-500' };
        }
        if (url.match(/\.(jpg|jpeg|png|gif)$/i)) {
          return { icon: FaImage, color: 'text-green-500' };
        }
        return { icon: FaFile, color: 'text-gray-500' };
    }
  };

  const getDocumentTypeLabel = (type) => {
    switch (type?.toLowerCase()) {
      case 'passport':
        return 'Passport Copy';
      case 'idcard':
        return 'ID Card Copy';
      case 'saudipartneriqama':
        return 'Saudi Partner Iqama';
      case 'commercial_registration':
        return 'Commercial Registration';
      case 'financial_statement':
        return 'Financial Statement';
      case 'articles_of_association':
        return 'Articles of Association';
      default:
        return type?.charAt(0).toUpperCase() + type?.slice(1) || 'Document';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const { icon: Icon, color: iconColor } = getDocumentIcon(document?.type);

  const handleView = () => {
    if (onView) {
      onView(document);
    } else {
      window.open(document.fileUrl, '_blank');
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(document);
    } else {
      const link = document.createElement('a');
      link.href = document.fileUrl;
      link.download = `${getDocumentTypeLabel(document.type)}.${document.fileUrl.split('.').pop()}`;
      link.click();
    }
  };

  return (
    <div 
      ref={ref}
      className={`bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 group/document p-6 ${className}`}
      {...props}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
            {getDocumentTypeLabel(document.type)}
          </h3>
          
          <p className="text-sm text-gray-500 mb-4">
            Uploaded on {formatDate(document.createdAt)}
          </p>
          
          <div className="flex space-x-2">
            <button
              onClick={handleView}
              className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md group-hover/document:scale-105"
              aria-label={`View ${getDocumentTypeLabel(document.type)}`}
            >
              <FaEye className="w-4 h-4 mr-2" />
              View
            </button>
            
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md group-hover/document:scale-105"
              aria-label={`Download ${getDocumentTypeLabel(document.type)}`}
            >
              <FaDownload className="w-4 h-4 mr-2" />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

DocumentCard.displayName = 'DocumentCard';

export default DocumentCard;
