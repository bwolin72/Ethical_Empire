import React from 'react';

export const Textarea = ({ className = '', ...props }) => {
  return (
    <textarea
      className={`border p-2 rounded-md w-full ${className}`}
      {...props}
    />
  );
};
