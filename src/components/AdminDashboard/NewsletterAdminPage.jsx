// src/pages/admin/NewsletterManagement.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  FaTrash,
  FaEnvelope,
  FaEye,
  FaPaperPlane,
} from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import styles from "./NewsletterAdminPage.module.css";
import newsletterService from "../../api/services/newsletterService";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

const NewsletterManagement = () => {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  const queryClient = useQueryClient();

  // === Queries ===
  const {
    data: newsletterLog = [],
    isLoading: logsLoading,
  } = useQuery({
    queryKey: ["newsletterLogs"],
    queryFn: newsletterService.getNewsletterLogs,
  });

  const {
    data: subscribers = [],
    isLoading: subsLoading,
  } = useQuery({
    queryKey: ["subscribers"],
    queryFn: newsletterService.getSubscribers,
  });

  const {
    data: subscriberCount = 0,
    isLoading: countLoading,
  } = useQuery({
    queryKey: ["subscriberCount"],
    queryFn: newsletterService.getSubscriberCount,
  });

  const loading = logsLoading || subsLoading || countLoading;

  // === Mutations ===
  const sendMutation = useMutation({
    mutationFn: ({ subject, html, test }) =>
      newsletterService.sendNewsletter(subject, html, test),
    onSuccess: (res, { test }) => {
      toast.success(res.message || "✅ Newsletter sent");
      if (!test) queryClient.invalidateQueries(["newsletterLogs"]);
    },
    onError: () => toast.error("❌ Failed to send newsletter"),
  });

  const resendConfirmationMutation = useMutation({
    mutationFn: (email) => newsletterService.resendConfirmation(email),
    onSuccess: (res, email) =>
      toast.success(res.message || `✅ Confirmation email resent to ${email}`),
    onError: (_, email) =>
      toast.error(`❌ Failed to resend confirmation to ${email}`),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => newsletterService.deleteSubscriber(id),
    onSuccess: (res) => {
      toast.success(res.message || "✅ Subscriber deleted");
      queryClient.invalidateQueries(["subscribers"]);
      queryClient.invalidateQueries(["subscriberCount"]);
    },
    onError: () => toast.error("❌ Failed to delete subscriber"),
  });

  // === Handlers ===
  const handleSend = (test = false) => {
    if (!subject.trim() || !content.trim()) {
      toast.warn("⚠️ Subject and content are required");
      return;
    }
    sendMutation.mutate({ subject, html: content, test });
  };

  const handleResendConfirmation = (email) => {
    resendConfirmationMutation.mutate(email);
  };

  const handleDeleteSubscriber = (id) => {
    if (!window.confirm("Are you sure you want to delete this subscriber?")) return;
    deleteMutation.mutate(id);
  };

  // === Loading state ===
  if (loading) {
    return <div className={styles.loading}>Loading newsletter data...</div>;
  }

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
            <FaEye /> {previewMode ? "Back to Editor" : "Preview Mode"}
          </button>
          <button
            type="button"
            onClick={() => handleSend(true)}
            disabled={sendMutation.isPending}
            className={styles.testButton}
          >
            <FaEnvelope />{" "}
            {sendMutation.isPending ? "Sending Test..." : "Send Test Email"}
          </button>
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={sendMutation.isPending}
            className={styles.sendButton}
          >
            <FaPaperPlane />{" "}
            {sendMutation.isPending ? "Sending..." : "Send to Subscribers"}
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
        <p>
          Total Active Recipients: <strong>{subscriberCount}</strong>
        </p>
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
                const status = sub.unsubscribed
                  ? "Unsubscribed"
                  : sub.confirmed
                  ? "Confirmed"
                  : "Unconfirmed";

                return (
                  <tr key={sub.id}>
                    <td>{sub.email}</td>
                    <td>{status}</td>
                    <td>{new Date(sub.subscribed_at).toLocaleString()}</td>
                    <td>
                      {!sub.confirmed && (
                        <button
                          onClick={() => handleResendConfirmation(sub.email)}
                          title="Resend Confirmation"
                        >
                          <FaEnvelope />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteSubscriber(sub.id)}
                        title="Delete"
                        style={{ marginLeft: "10px" }}
                      >
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
