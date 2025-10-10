// src/components/messaging/MessagesPage.jsx
import React, { useEffect, useState, useRef } from "react";
import messagingService from "../../api/services/messagingService";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import {
  Loader2,
  Trash2,
  CheckCircle,
  XCircle,
  Plus,
  Mail,
  Send,
  X,
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
  const [authChecked, setAuthChecked] = useState(false);
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

  // ---------- User & Role Detection ----------
  const userId =
    currentUser?.id ||
    currentUser?.pk ||
    currentUser?.user?.id ||
    currentUser?.user?.pk ||
    null;

  const isAuthenticated = Boolean(userId);
  const role = currentUser?.role?.toLowerCase?.() || "";
  const isAdmin = role === "admin" || currentUser?.is_staff;

  // Wait for user state to load
  useEffect(() => {
    // When currentUser changes (including initial load)
    if (currentUser !== undefined) {
      setAuthChecked(true);
    }
  }, [currentUser]);

  // ---------- Fetch Messages ----------
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await messagingService.fetchMessages();
      setMessages(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async (notify = true) => {
    try {
      const data = await messagingService.fetchUnread();
      const list = Array.isArray(data) ? data : data?.results || [];
      const count = list.length || 0;

      if (notify && count > unreadRef.current) {
        toast.info(`You have ${count} unread message${count > 1 ? "s" : ""}`);
      }

      setUnreadCount(count);
      unreadRef.current = count;
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchMessages();
    fetchUnreadCount(false);

    pollIntervalRef.current = setInterval(() => {
      fetchUnreadCount(true);
    }, 30000);

    return () => clearInterval(pollIntervalRef.current);
  }, [isAuthenticated]);

  // ---------- Form Handlers ----------
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError("Attachment too large (max 5 MB).");
        return;
      }
      setFormData((p) => ({ ...p, [name]: file }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated) {
      setError("You must sign in to send a message.");
      return;
    }

    if (formData.service_type === "rental" && !formData.rental_categories.length) {
      setError("Please select at least one rental category.");
      return;
    }

    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val === null || val === "") return;
        if (Array.isArray(val)) val.forEach((v) => fd.append(key, v));
        else fd.append(key, val);
      });

      await messagingService.sendMessage(fd);
      toast.success("Message sent!");
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
      setShowForm(false);
      fetchMessages();
      fetchUnreadCount(false);
    } catch (err) {
      console.error(err);
      setError("Failed to send message");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await messagingService.removeMessage(id);
      toast.success("Message deleted");
      fetchMessages();
      fetchUnreadCount(false);
    } catch {
      toast.error("Failed to delete message");
    }
  };

  const handleMarkRead = async (id) => {
    await messagingService.markAsRead(id);
    fetchMessages();
    fetchUnreadCount(false);
  };

  const handleMarkUnread = async (id) => {
    await messagingService.markAsUnread(id);
    fetchMessages();
    fetchUnreadCount(false);
  };

  // ---------- Render ----------

  if (!authChecked) {
    return (
      <div className="messaging-empty-state">
        <Loader2 className="spinner" />
        <h2>Checking login status...</h2>
      </div>
    );
  }

  if (!isAuthenticated && authChecked) {
    return (
      <div className="messaging-empty-state">
        <ToastContainer position="top-right" />
        <Mail size={48} className="icon-muted" />
        <h2>You must sign in to view and send messages.</h2>
      </div>
    );
  }

  return (
    <div className="messaging-dashboard">
      <ToastContainer position="top-right" />
      <div className="header-bar">
        <h1>Messages</h1>
        <div className="header-actions">
          <Button onClick={() => setShowForm(true)}>
            <Plus className="icon" /> New
          </Button>
          <div className="unread-count">
            {unreadCount > 0 && <span>{unreadCount}</span>} Unread
          </div>
        </div>
      </div>

      <div className="messaging-layout">
        <div className="message-list">
          {loading && <Loader2 className="spinner" />}
          {error && <p className="error">{error}</p>}

          {messages.length === 0 && !loading && <p>No messages found.</p>}

          {messages.map((msg) => (
            <Card
              key={msg.id}
              className={`message-item ${msg.is_read ? "read" : "unread"}`}
              onClick={() => setSelectedMessage(msg)}
            >
              <CardContent>
                <div className="msg-top">
                  <h3>{msg.subject}</h3>
                  {!msg.is_read && <span className="unread-dot" />}
                </div>
                <p>{msg.message?.slice(0, 100)}...</p>
                <div className="msg-meta">
                  <span>From: {msg.sender_name || msg.sender_email}</span>
                  <div className="msg-actions">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(msg.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                    {msg.is_read ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMarkUnread(msg.id)}
                      >
                        <XCircle size={16} />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMarkRead(msg.id)}
                      >
                        <CheckCircle size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="message-details">
          {selectedMessage ? (
            <Card className="message-view">
              <CardContent>
                <div className="view-header">
                  <h2>{selectedMessage.subject}</h2>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedMessage(null)}
                  >
                    <X />
                  </Button>
                </div>
                <p>{selectedMessage.message}</p>
                {selectedMessage.attachment_url && (
                  <a
                    href={selectedMessage.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Attachment
                  </a>
                )}
              </CardContent>
            </Card>
          ) : showForm ? (
            <Card className="message-compose">
              <CardContent>
                <div className="view-header">
                  <h2>New Message</h2>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowForm(false)}
                  >
                    <X />
                  </Button>
                </div>
                <form onSubmit={handleSubmit} className="compose-form">
                  <Input
                    name="subject"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                  <Textarea
                    name="message"
                    placeholder="Your message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                  <Input type="file" name="attachment" onChange={handleChange} />

                  <div className="form-group">
                    <label>Service Type</label>
                    <select
                      name="service_type"
                      value={formData.service_type}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      <option value="rental">Rental</option>
                      <option value="hiring">Hiring</option>
                    </select>
                  </div>

                  <Button type="submit">
                    <Send size={16} /> Send
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="empty-view">
              <Mail size={48} className="icon-muted" />
              <p>Select a message or create a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
