import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationCircle } from 'react-icons/fa';

const ValidationMessage = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`flex items-start gap-1.5 text-red-600 text-sm mt-1 ${className}`}
      >
        <FaExclamationCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>{message}</span>
      </motion.div>
    </AnimatePresence>
  );
};

export default ValidationMessage;