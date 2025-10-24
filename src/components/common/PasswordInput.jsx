import React, { useState } from 'react';
import './password.css';

export default function PasswordInput({
  value,
  onChange,
  placeholder = 'Password',
  name = 'password',
  required = true,
}) {
  const [show, setShow] = useState(false);

  // Map name to proper autocomplete attribute
  const autoCompleteMap = {
    'current-password': 'current-password',
    'new-password': 'new-password',
    'confirm-password': 'new-password',
    email: 'email',
  };

  return (
    <div className="password-field">
      <input
        type={show ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoCompleteMap[name] || 'off'}
        required={required}
        aria-label={placeholder}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setShow((prev) => !prev)}
        aria-label="Toggle password visibility"
      >
        {show ? '🙈' : '👁️'}
      </button>
    </div>
  );
}
