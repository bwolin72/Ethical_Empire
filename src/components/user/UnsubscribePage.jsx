// src/components/user/UnsubscribePage.jsx

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import publicAxios from '../../api/publicAxios';

export default function UnsubscribePage() {
  const { email } = useParams();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUnsubscribe = async () => {
    setLoading(true);
    setStatus('');
    try {
      await publicAxios.get(`/user-account/newsletter/unsubscribe/${email}/`);
      setStatus('✅ You have been unsubscribed.');
    } catch (err) {
      console.error('Unsubscribe error:', err);
      setStatus('❌ Unsubscribe failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-900 p-6 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Unsubscribe</h2>

      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Are you sure you want to unsubscribe <strong>{decodeURIComponent(email)}</strong> from all future emails?
      </p>

      <button
        onClick={handleUnsubscribe}
        disabled={loading}
        className={`bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded transition duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Processing...' : 'Unsubscribe Me'}
      </button>

      {status && (
        <p className="mt-6 text-sm text-gray-700 dark:text-gray-300" role="status">
          {status}
        </p>
      )}
    </div>
  );
}
