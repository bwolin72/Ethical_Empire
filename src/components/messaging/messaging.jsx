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

  // ---------- Role checks ----------
  const normalizeRole = (r) =>
    typeof r === "string" && r ? r.trim().toLowerCase() : "";

  const roleStr = normalizeRole(currentUser?.role);
  const isAdmin =
    roleStr === "admin" || currentUser?.is_staff || currentUser?.is_superuser;
  const isWorker = roleStr === "worker" || Boolean(currentUser?.is_worker);
  const isVendor = roleStr === "vendor" || Boolean(currentUser?.is_vendor);
  const isPartner = roleStr === "partner" || Boolean(currentUser?.is_partner);
  const isAuthenticated = Boolean(
    currentUser && (currentUser.id || currentUser.pk || currentUser.email)
  );

  const isSender = (msg) => {
    if (!currentUser) return false;
    const uid = String(currentUser?.id ?? currentUser?.pk ?? "");
    if (typeof msg.sender === "object") {
      return String(msg.sender?.id ?? msg.sender?.pk ?? "") === uid;
    }
    return String(msg.sender) === uid;
  };

  // ---------- Fetch messages ----------
  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await messagingService.fetchMessages();
      setMessages(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCountAndNotify = async ({ notifyNew = true } = {}) => {
    try {
      const data = await messagingService.fetchUnread();
      const list = Array.isArray(data) ? data : data?.results || [];
      const count = list.length || 0;
      if (notifyNew && count > unreadRef.current) {
        toast.info(`You have ${count} unread message${count > 1 ? "s" : ""}`);
      }
      setUnreadCount(count);
      unreadRef.current = count;
      return count;
    } catch (err) {
      console.error("Error fetching unread count:", err);
      return 0;
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchMessages();
    fetchUnreadCountAndNotify({ notifyNew: false });

    pollIntervalRef.current = setInterval(() => {
      fetchUnreadCountAndNotify({ notifyNew: true });
    }, 30000);

    return () => {
      clearInterval(pollIntervalRef.current);
    };
  }, [currentUser]);

  // ---------- Form handlers ----------
  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (files) {
      const file = files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError("Attachment too large. Max size is 5 MB.");
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: file }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked ? value : "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryToggle = (category) => {
    setFormData((prev) => {
      const exists = prev.rental_categories.includes(category);
      return {
        ...prev,
        rental_categories: exists
          ? prev.rental_categories.filter((c) => c !== category)
          : [...prev.rental_categories, category],
      };
    });
  };

  const handleSubmit = async (e) => {
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
      await fetchMessages();
      await fetchUnreadCountAndNotify({ notifyNew: false });
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
    }
  };

  // ---------- Actions ----------
  const handleDelete = async (id, msg) => {
    if (!(isAdmin || isSender(msg))) {
      setError("You don't have permission to delete this message.");
      return;
    }
    if (!window.confirm("Delete this message?")) return;

    try {
      await messagingService.removeMessage(id);
      toast.success("Message deleted.");
      fetchMessages();
      fetchUnreadCountAndNotify({ notifyNew: false });
    } catch (err) {
      console.error(err);
      setError("Failed to delete message");
    }
  };

  const handleMarkRead = async (id, msg) => {
    if (!(isAdmin || isSender(msg))) return;
    try {
      await messagingService.markAsRead(id);
      fetchMessages();
      fetchUnreadCountAndNotify({ notifyNew: false });
    } catch (err) {
      console.error(err);
      setError("Failed to mark as read");
    }
  };

  const handleMarkUnread = async (id, msg) => {
    if (!(isAdmin || isSender(msg))) return;
    try {
      await messagingService.markAsUnread(id);
      fetchMessages();
      fetchUnreadCountAndNotify({ notifyNew: false });
    } catch (err) {
      console.error(err);
      setError("Failed to mark as unread");
    }
  };

  // ---------- Render helpers ----------
  const canSendMessage = isAuthenticated;
  const showPartnerFields = isPartner || isAdmin;
  const showVendorFields = isVendor || isAdmin;
  const showEquipmentField = isWorker || isAdmin || isVendor;

  if (!isAuthenticated) {
    return (
      <div className="messaging-page">
        <ToastContainer position="top-right" autoClose={5000} />
        <h1>Messages</h1>
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
          <div className="unread-badge" title={`${unreadCount} unread`}>
            <Button size="sm" variant="ghost" onClick={fetchMessages}>
              <strong>{unreadCount}</strong> unread
            </Button>
          </div>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}
      {loading && <Loader2 className="loading-spinner" />}

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

      <div className="messages-list">
        {messages.length > 0 ? (
          messages.map((msg) => {
            const sender = msg.sender_name || msg.sender_email || "Unknown";
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
                  {msg.rental_categories_display?.length > 0 && (
                    <p>Categories: {msg.rental_categories_display.join(", ")}</p>
                  )}
                  {msg.attachment_url && (
                    <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer">
                      View Attachment
                    </a>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <p>No messages found.</p>
        )}
      </div>

      {selectedMessage && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{selectedMessage.subject}</h2>
            <p>{selectedMessage.message}</p>
            {selectedMessage.attachment_url && (
              <a href={selectedMessage.attachment_url} target="_blank" rel="noopener noreferrer">
                View Attachment
              </a>
            )}
            <Button onClick={() => setSelectedMessage(null)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}
