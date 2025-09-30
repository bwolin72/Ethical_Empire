// src/components/messaging/messaging.jsx
import React, { useEffect, useState, useRef } from "react";
import messagingService from "../../api/services/messagingService";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import {
  Loader2,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Plus,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./messaging.css";

export default function MessagesPage({ currentUser }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    attachment: null,
    service_type: "",
    rental_categories: [],
    partner_company: "",
    agency_name: "",
    vendor_company: "",
    vendor_agency_name: "",
    equipment_list: "",
  });

  const [unreadCount, setUnreadCount] = useState(0);
  const unreadRef = useRef(0);
  const pollIntervalRef = useRef(null);

  const RENTAL_CATEGORIES = [
    { value: "live_band", label: "Live Band" },
    { value: "catering", label: "Catering" },
    { value: "decor", label: "Décor" },
    { value: "photography", label: "Photography" },
    { value: "videography", label: "Videography" },
    { value: "yard", label: "Yard" },
  ];

  // --------- Role checks (robust/fallback-friendly) ----------
  const normalizeRole = (r) =>
    typeof r === "string" && r ? r.trim().toLowerCase() : "";

  const roleStr = normalizeRole(currentUser?.role);
  const isAdmin = roleStr === "admin" || currentUser?.is_staff || currentUser?.is_superuser;
  const isWorker = roleStr === "worker" || Boolean(currentUser?.is_worker);
  const isVendor = roleStr === "vendor" || Boolean(currentUser?.is_vendor);
  const isPartner = roleStr === "partner" || Boolean(currentUser?.is_partner);
  const isAuthenticated = Boolean(currentUser && (currentUser.id || currentUser.pk || currentUser.email));

  // helper to detect if the current user is the sender of a message
  const isSender = (msg) => {
    if (!currentUser) return false;
    const uid = String(currentUser?.id ?? currentUser?.pk ?? "");
    // msg.sender may be an id or object
    if (msg?.sender === undefined || msg?.sender === null) {
      if (msg?.sender_name && uid) {
        // can't reliably detect by name — fallback false
        return false;
      }
      return false;
    }
    if (typeof msg.sender === "object") {
      return String(msg.sender?.id ?? msg.sender?.pk ?? "") === uid;
    }
    // primitive id
    return String(msg.sender) === uid;
  };

  // --------- Fetch messages & unread count ----------
  async function fetchMessages() {
    try {
      setLoading(true);
      setError(null);
      const data = await messagingService.fetchMessages();
      // data is either [] or { results: [] } (paginated)
      const messageList = Array.isArray(data) ? data : data?.results || [];
      setMessages(messageList);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }

  async function fetchUnreadCountAndMaybeNotify({ notifyWhenNew = true } = {}) {
    try {
      const data = await messagingService.fetchUnread();
      const list = Array.isArray(data) ? data : data?.results || [];
      const count = list.length || 0;
      // compare with previous
      if (notifyWhenNew && count > (unreadRef.current || 0)) {
        toast.info(`You have ${count} unread message${count > 1 ? "s" : ""}`);
      }
      setUnreadCount(count);
      unreadRef.current = count;
      return count;
    } catch (err) {
      console.error("Error fetching unread count:", err);
      return 0;
    }
  }

  // initial load
  useEffect(() => {
    if (!isAuthenticated) {
      setMessages([]);
      setUnreadCount(0);
      return;
    }
    fetchMessages();
    fetchUnreadCountAndMaybeNotify({ notifyWhenNew: false });

    // start polling for unread count every 30s
    // NOTE: server enforces permissions; polling is only for UI notifications
    pollIntervalRef.current = setInterval(() => {
      fetchUnreadCountAndMaybeNotify({ notifyWhenNew: true });
    }, 30000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]); // re-run when user changes

  // --------- Form handlers ----------
  function handleChange(e) {
    const { name, value, files, type, checked } = e.target;
    if (files) {
      const file = files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError("Attachment too large. Max size is 5 MB.");
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: file }));
    } else if (type === "checkbox") {
      // generic checkbox fallback (not used for rental categories)
      setFormData((prev) => ({ ...prev, [name]: checked ? value : "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handleCategoryToggle(category) {
    setFormData((prev) => {
      const exists = prev.rental_categories.includes(category);
      return {
        ...prev,
        rental_categories: exists
          ? prev.rental_categories.filter((c) => c !== category)
          : [...prev.rental_categories, category],
      };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated) {
      setError("You must be signed in to send a message.");
      return;
    }

    if (formData.service_type === "rental" && formData.rental_categories.length === 0) {
      setError("Please select at least one rental category.");
      return;
    }

    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val === null || val === "") return;
        if (Array.isArray(val)) {
          if (val.length === 0) return;
          val.forEach((v) => fd.append("rental_categories", v));
        } else {
          fd.append(key, val);
        }
      });

      await messagingService.sendMessage(fd);
      toast.success("Message sent.");
      setShowForm(false);
      setFormData({
        subject: "",
        message: "",
        attachment: null,
        service_type: "",
        rental_categories: [],
        partner_company: "",
        agency_name: "",
        vendor_company: "",
        vendor_agency_name: "",
        equipment_list: "",
      });
      // refresh UI
      await fetchMessages();
      await fetchUnreadCountAndMaybeNotify({ notifyWhenNew: false });
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
    }
  }

  // --------- Actions: delete, mark read/unread ----------
  async function handleDelete(id, msg) {
    // frontend permission check: only admin or sender
    if (!(isAdmin || isSender(msg))) {
      setError("You don't have permission to delete this message.");
      return;
    }
    if (!window.confirm("Delete this message?")) return;
    try {
      await messagingService.removeMessage(id);
      toast.success("Message deleted.");
      fetchMessages();
      fetchUnreadCountAndMaybeNotify({ notifyWhenNew: false });
    } catch (err) {
      console.error("Error deleting message:", err);
      setError("Failed to delete message");
    }
  }

  async function handleMarkRead(id, msg) {
    if (!(isAdmin || isSender(msg))) {
      setError("You don't have permission to change read status.");
      return;
    }
    try {
      await messagingService.markAsRead(id);
      fetchMessages();
      fetchUnreadCountAndMaybeNotify({ notifyWhenNew: false });
    } catch (err) {
      console.error("Error marking read:", err);
      setError("Failed to mark as read");
    }
  }

  async function handleMarkUnread(id, msg) {
    if (!(isAdmin || isSender(msg))) {
      setError("You don't have permission to change read status.");
      return;
    }
    try {
      await messagingService.markAsUnread(id);
      fetchMessages();
      fetchUnreadCountAndMaybeNotify({ notifyWhenNew: false });
    } catch (err) {
      console.error("Error marking unread:", err);
      setError("Failed to mark as unread");
    }
  }

  // ---------- UI permission helpers ----------
  const canSendMessage = isAuthenticated; // all signed-in users can send (backend enforces)
  const showPartnerFields = isPartner || isAdmin;
  const showVendorFields = isVendor || isAdmin;
  const showEquipmentField = isWorker || isAdmin || isVendor;

  // ---------- Render ----------
  if (!isAuthenticated) {
    return (
      <div className="messaging-page">
        <ToastContainer position="top-right" autoClose={5000} />
        <div className="messaging-header">
          <h1>Messages</h1>
        </div>
        <p>You must sign in to view and send messages.</p>
      </div>
    );
  }

  return (
    <div className="messaging-page">
      <ToastContainer position="top-right" autoClose={5000} />

      <div className="messaging-header">
        <h1>Messages</h1>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Button onClick={() => setShowForm((s) => !s)}>
            <Plus className="icon" /> New Message
          </Button>

          {/* Unread badge */}
          <div className="unread-badge" title={`${unreadCount} unread`}>
            {unreadCount > 0 ? (
              <Button size="sm" variant="ghost" onClick={() => {
                // open unread list by refetching with ?is_read=false if you want — here we just focus UI
                fetchMessages();
              }}>
                <strong>{unreadCount}</strong> unread
              </Button>
            ) : (
              <Button size="sm" variant="ghost" disabled>
                0 unread
              </Button>
            )}
          </div>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}
      {loading && <Loader2 className="loading-spinner" />}

      {/* Form for new message (only for authenticated users) */}
      {showForm && canSendMessage && (
        <form onSubmit={handleSubmit} className="message-form">
          <Input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Subject"
            required
          />
          <Textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Your message"
            required
          />
          <Input type="file" name="attachment" onChange={handleChange} />

          <div className="form-group">
            <label>Service Type</label>
            <select name="service_type" value={formData.service_type} onChange={handleChange}>
              <option value="">Select Service Type</option>
              <option value="rental">Rental</option>
              <option value="hiring">Hiring</option>
            </select>
          </div>

          {formData.service_type === "rental" && (
            <div className="form-group">
              <label>Rental Categories</label>
              <div className="checkbox-group">
                {RENTAL_CATEGORIES.map((cat) => (
                  <label key={cat.value} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={formData.rental_categories.includes(cat.value)}
                      onChange={() => handleCategoryToggle(cat.value)}
                    />
                    <span>{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Conditionally show partner/vendor/equipment fields depending on role */}
          {showPartnerFields && (
            <>
              <Input
                type="text"
                name="partner_company"
                value={formData.partner_company}
                onChange={handleChange}
                placeholder="Partner Company"
              />
              <Input
                type="text"
                name="agency_name"
                value={formData.agency_name}
                onChange={handleChange}
                placeholder="Agency Name"
              />
            </>
          )}

          {showVendorFields && (
            <>
              <Input
                type="text"
                name="vendor_company"
                value={formData.vendor_company}
                onChange={handleChange}
                placeholder="Vendor Company"
              />
              <Input
                type="text"
                name="vendor_agency_name"
                value={formData.vendor_agency_name}
                onChange={handleChange}
                placeholder="Vendor Agency Name"
              />
            </>
          )}

          {showEquipmentField && (
            <Textarea
              name="equipment_list"
              value={formData.equipment_list}
              onChange={handleChange}
              placeholder="Equipment List"
            />
          )}

          <Button type="submit">Send</Button>
        </form>
      )}

      {/* Messages list */}
      <div className="messages-list">
        {Array.isArray(messages) && messages.length > 0 ? (
          messages.map((msg) => {
            const sender = msg?.sender_name || msg?.sender_email || "Unknown Sender";
            const allowModify = isAdmin || isSender(msg);
            return (
              <Card key={msg.id} className="message-card">
                <CardContent>
                  <div className="message-header">
                    <h2>{msg.subject}</h2>
                    <div className="message-actions">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedMessage(msg)}>
                        <Eye className="icon" />
                      </Button>

                      {/* Delete visible only to admin or sender */}
                      {allowModify && (
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(msg.id, msg)}>
                          <Trash2 className="icon" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <p>{msg.message?.slice(0, 100)}...</p>

                  <div className="message-status">
                    {msg.is_read ? (
                      <span className="status-read">
                        <CheckCircle className="icon" /> Read
                      </span>
                    ) : (
                      <span className="status-unread">
                        <XCircle className="icon" /> Unread
                      </span>
                    )}

                    {/* Mark read/unread buttons (admin or sender only) */}
                    {allowModify && !msg.is_read && (
                      <Button size="sm" variant="outline" onClick={() => handleMarkRead(msg.id, msg)}>
                        Mark Read
                      </Button>
                    )}
                    {allowModify && msg.is_read && (
                      <Button size="sm" variant="outline" onClick={() => handleMarkUnread(msg.id, msg)}>
                        Mark Unread
                      </Button>
                    )}
                  </div>

                  <p className="message-meta">From: {sender}</p>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <p>No messages found.</p>
        )}
      </div>

      {/* Modal / Preview for selected message */}
      {selectedMessage && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{selectedMessage.subject}</h2>
            <p className="modal-message">{selectedMessage.message}</p>
            {selectedMessage.attachment_url && (
              <a
                href={selectedMessage.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="attachment-link"
              >
                View Attachment
              </a>
            )}
            <div className="modal-footer">
              <Button onClick={() => setSelectedMessage(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
