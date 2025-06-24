import React from 'react';

export const Checkbox = ({ checked, onCheckedChange }) => {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onCheckedChange}
      className="w-5 h-5 accent-blue-600"
    />
  );
};
