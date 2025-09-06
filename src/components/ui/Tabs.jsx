// src/components/ui/Tabs.jsx

import React from 'react';

// Tabs root component
export const Tabs = ({ children, defaultValue, onValueChange, className }) => {
  const [value, setValue] = React.useState(defaultValue);

  const handleChange = (val) => {
    setValue(val);
    if (typeof onValueChange === 'function') {
      onValueChange(val);
    }
  };

  return (
    <div className={className}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, {
              selectedValue: value,
              onSelect: handleChange,
            })
          : child
      )}
    </div>
  );
};

// Container for tab triggers
export const TabsList = ({ children, className }) => (
  <div className={className}>{children}</div>
);

// A single tab trigger button
export const TabsTrigger = ({ value, children, selectedValue, onSelect, className }) => (
  <button
    type="button"
    onClick={() => typeof onSelect === 'function' && onSelect(value)}
    className={className}
    style={{ opacity: selectedValue === value ? 1 : 0.6 }}
  >
    {children}
  </button>
);

// Content rendered only if selected
export const TabsContent = ({ value, selectedValue, children }) => {
  if (value !== selectedValue) return null;
  return <div>{children}</div>;
};
