"use client";

import { useState, useEffect } from 'react';
import { FaTimes, FaCheckCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../i18n/TranslationContext';

const InstructionModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Modal animation variants
  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95, 
      y: 20,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 20,
      transition: { duration: 0.2, ease: 'easeIn' }
    }
  };

  // Backdrop animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.7, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const handleAccept = () => {
    if (isTermsAccepted) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black z-40"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 px-4 sm:px-6"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="bg-white border border-gray-300 w-full max-w-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-green-50 border-b border-gray-300">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  {t('instructionModal.instructions')}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-4 sm:px-6 py-6 max-h-[70vh] overflow-y-auto">
                <p className="text-base text-gray-600 mb-4">
                  {t('instructionModal.description')}
                </p>
                <ul className="list-disc list-inside space-y-2 text-base text-gray-600">
                  <li>{t('instructionModal.steps.completeFields')}</li>
                  <li>{t('instructionModal.steps.clearDocuments')}</li>
                  <li>{t('instructionModal.steps.verifyContact')}</li>
                  <li>{t('instructionModal.steps.saveDraft')}</li>
                  <li>{t('instructionModal.steps.contactSupport')}</li>
                </ul>
                <p className="mt-4 text-base text-gray-600">
                  {t('instructionModal.termsDescription')}
                </p>

                {/* Terms Checkbox */}
                <div className="mt-6 flex items-center">
                  <input
                    type="checkbox"
                    checked={isTermsAccepted}
                    onChange={(e) => setIsTermsAccepted(e.target.checked)}
                    className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-600"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-600">
                    {t('instructionModal.acceptTerms')}
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 sm:px-6 py-4 bg-green-50 border-t border-gray-300 flex justify-end">
                <button
                  onClick={handleAccept}
                  disabled={!isTermsAccepted}
                  className={`px-6 py-2 text-sm font-medium transition-colors ${
                    isTermsAccepted
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <FaCheckCircle className="inline mr-2 h-4 w-4" />
                  {t('instructionModal.acceptAndProceed')}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default InstructionModal;