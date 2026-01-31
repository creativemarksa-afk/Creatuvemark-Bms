"use client";

import { forwardRef } from 'react';

const KeyValueList = forwardRef(({ 
  items, 
  columns = 2,
  className = '',
  itemClassName = '',
  keyClassName = '',
  valueClassName = '',
  ...props 
}, ref) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div 
      ref={ref}
      className={`grid ${gridCols[columns]} gap-6 ${className}`}
      {...props}
    >
      {items.map((item, index) => (
        <div key={index} className={`space-y-3 ${itemClassName}`}>
          <label className={`block text-sm font-semibold text-gray-500 uppercase tracking-wide ${keyClassName}`}>
            {item.label}
          </label>
          <div className={`p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 ${valueClassName}`}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
});

KeyValueList.displayName = 'KeyValueList';

export default KeyValueList;
