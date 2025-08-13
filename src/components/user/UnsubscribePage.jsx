import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import apiService from '../../api/apiService';  // use apiService
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './UnsubscribePage.css'; // Assuming you have some styles for this component

export default function UnsubscribePage() {
  const { email } = useParams();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUnsubscribe = async () => {
    setLoading(true);
    setStatus('');
    try {
      // The unsubscribe endpoint expects POST with email in body
      const { data } = await apiService.unsubscribeNewsletter({
        email: decodeURIComponent(email),
      });
      setStatus(data?.message || '✅ You have been unsubscribed.');
      toast.success(data?.message || '✅ You have been unsubscribed.');
    } catch (err) {
      console.error('Unsubscribe error:', err);
      const errorMsg = err?.response?.data?.error || '❌ Unsubscribe failed. Please try again later.';
      setStatus(errorMsg);
      toast.error(errorMsg);
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
