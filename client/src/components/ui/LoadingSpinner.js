import React from 'react';

const LoadingSpinner = ({ size = 'md' }) => {
  let sizeClasses = 'w-8 h-8';
  
  if (size === 'sm') {
    sizeClasses = 'w-5 h-5';
  } else if (size === 'lg') {
    sizeClasses = 'w-12 h-12';
  }
  
  return (
    <div className="flex justify-center items-center">
      <div className={`${sizeClasses} border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin`}></div>
    </div>
  );
};

export default LoadingSpinner;