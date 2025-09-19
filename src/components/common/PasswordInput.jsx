import React, { useState } from 'react';
import './password.css';

export default function PasswordInput({
  value,
  onChange,
  placeholder = 'Password',
  name = 'password',
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="password-field">
      <input
        type={show ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
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
