import React from 'react';

export const Tabs = ({ children, defaultValue, onValueChange, className }) => {
  const [value, setValue] = React.useState(defaultValue);

  const handleChange = (val) => {
    setValue(val);
    if (onValueChange) onValueChange(val);
  };

  return (
    <div className={className}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { selectedValue: value, onSelect: handleChange })
      )}
    </div>
  );
};

export const TabsList = ({ children, className }) => (
  <div className={className}>{children}</div>
);

export const TabsTrigger = ({ value, children, selectedValue, onSelect, className }) => (
  <button
    onClick={() => onSelect(value)}
    className={className}
    style={{ opacity: selectedValue === value ? 1 : 0.6 }}
  >
    {children}
  </button>
);

export const TabsContent = ({ value, selectedValue, children }) => {
  if (value !== selectedValue) return null;
  return <div>{children}</div>;
};
