import React, { useState } from "react";
import { useParams } from "react-router-dom";
import publicAxios from "../../api/publicAxios";

export default function ResubscribePage() {
  const { email } = useParams();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResubscribe = async () => {
    setLoading(true);
    setStatus("");
    try {
      await publicAxios.get(`/user-account/newsletter/resubscribe/${email}/`);
      setStatus("✅ You have successfully resubscribed.");
    } catch (err) {
      setStatus("❌ Resubscription failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-900 p-6 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Resubscribe</h2>

      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Want to start receiving emails again at <strong>{decodeURIComponent(email)}</strong>?
      </p>

      <button
        onClick={handleResubscribe}
        disabled={loading}
        className={`bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded transition duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Processing...' : 'Resubscribe Me'}
      </button>

      {status && (
        <p className="mt-6 text-sm text-gray-700 dark:text-gray-300" role="status">
          {status}
        </p>
      )}
    </div>
  );
}
