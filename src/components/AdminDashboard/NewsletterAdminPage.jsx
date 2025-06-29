import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import { FaTrash, FaEnvelope, FaCheck, FaEye, FaPaperPlane } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import styles from './NewsletterAdminPage.module.css';

const NewsletterManagement = () => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [recipientsCount, setRecipientsCount] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [sending, setSending] = useState(false);
  const [newsletterLog, setNewsletterLog] = useState([]);
  const [subscribers, setSubscribers] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchLogs(),
      fetchRecipientCount(),
      fetchSubscribers()
    ]);
  };

  const fetchLogs = async () => {
    try {
      const { data } = await axiosInstance.get('/user-account/newsletter/logs/');
      setNewsletterLog(data);
    } catch (error) {
      toast.error('❌ Failed to fetch newsletter logs');
    }
  };

  const fetchRecipientCount = async () => {
    try {
      const { data } = await axiosInstance.get('/user-account/newsletter/recipients/count/');
      setRecipientsCount(data.count);
    } catch (error) {
      toast.error('❌ Failed to fetch subscriber count');
    }
  };

  const fetchSubscribers = async () => {
    try {
      const { data } = await axiosInstance.get('/user-account/newsletter/subscribers/');
      setSubscribers(data);
    } catch (error) {
      toast.error('❌ Failed to fetch subscribers');
    }
  };

  const handleSend = async (test = false) => {
    if (!subject.trim() || !content.trim()) {
      toast.warn('⚠️ Subject and content are required');
      return;
    }

    setSending(true);
    try {
      const { data } = await axiosInstance.post('/user-account/newsletter/send/', {
        subject,
        html: content,
        test,
      });
      toast.success(data.message || '✅ Newsletter sent');
      if (!test) fetchLogs();
    } catch (error) {
      toast.error('❌ Failed to send newsletter');
    } finally {
      setSending(false);
    }
  };

  const handleResendConfirmation = async (email) => {
    try {
      await axiosInstance.post('/user-account/newsletter/resend-confirmation/', { email });
      toast.success(`✅ Confirmation email resent to ${email}`);
    } catch (error) {
      toast.error(`❌ Failed to resend confirmation to ${email}`);
    }
  };

  const handleDeleteSubscriber = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this subscriber?');
    if (!confirmed) return;

    try {
      await axiosInstance.delete(`/user-account/newsletter/subscribers/${id}/`);
      toast.success('✅ Subscriber deleted');
      await fetchSubscribers();
      await fetchRecipientCount();
    } catch (error) {
      toast.error('❌ Failed to delete subscriber');
    }
  };

  return (
    <div className={styles.newsletterContainer}>
      <h2>📬 Newsletter Management</h2>

      {/* Compose Section */}
      <section className={styles.formSection}>
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={styles.newsletterInput}
        />

        <textarea
          placeholder="Write newsletter content here (HTML allowed)..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={styles.newsletterTextarea}
          rows={10}
        />

        <div className={styles.newsletterActions}>
          <button type="button" onClick={() => setPreviewMode(!previewMode)}>
            <FaEye /> {previewMode ? 'Back to Editor' : 'Preview Mode'}
          </button>
          <button
            type="button"
            onClick={() => handleSend(true)}
            disabled={sending}
            className={styles.testButton}
          >
            <FaEnvelope /> {sending ? 'Sending Test...' : 'Send Test Email'}
          </button>
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={sending}
            className={styles.sendButton}
          >
            <FaPaperPlane /> {sending ? 'Sending...' : 'Send to Subscribers'}
          </button>
        </div>

        {previewMode && (
          <div className={styles.newsletterPreview}>
            <h3>{subject}</h3>
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        )}
      </section>

      {/* Newsletter Logs */}
      <section className={styles.logSection}>
        <h3>📝 Sent Newsletters</h3>
        <p>Total Active Recipients: <strong>{recipientsCount}</strong></p>
        <div className={styles.tableWrapper}>
          <table className={styles.logTable}>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Sent At</th>
                <th>Recipients</th>
              </tr>
            </thead>
            <tbody>
              {newsletterLog.map((log) => (
                <tr key={log.id}>
                  <td>{log.subject}</td>
                  <td>{new Date(log.sent_at).toLocaleString()}</td>
                  <td>{log.sent_to}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Subscribers Management */}
      <section className={styles.subscriberSection}>
        <h3>👥 Subscribers List</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.logTable}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Status</th>
                <th>Subscribed At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => {
                const status = sub.confirmed
                  ? sub.unsubscribed ? 'Unsubscribed' : 'Confirmed'
                  : 'Unconfirmed';

                return (
                  <tr key={sub.id}>
                    <td>{sub.email}</td>
                    <td>{status}</td>
                    <td>{new Date(sub.subscribed_at).toLocaleString()}</td>
                    <td>
                      {!sub.confirmed && (
                        <button onClick={() => handleResendConfirmation(sub.email)} title="Resend Confirmation">
                          <FaEnvelope />
                        </button>
                      )}
                      <button onClick={() => handleDeleteSubscriber(sub.id)} title="Delete" style={{ marginLeft: '10px' }}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default NewsletterManagement;
