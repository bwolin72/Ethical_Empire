// src/components/messaging/messaging.jsx
import React, { useEffect, useState } from "react";
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

  const RENTAL_CATEGORIES = [
    { value: "live_band", label: "Live Band" },
    { value: "catering", label: "Catering" },
    { value: "decor", label: "Décor" },
    { value: "photography", label: "Photography" },
    { value: "videography", label: "Videography" },
    { value: "yard", label: "Yard" },
  ];

  const isAdmin = currentUser?.role === "ADMIN" || currentUser?.is_staff;

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    try {
      setLoading(true);
      const data = await messagingService.fetchMessages();
      setMessages(data);
    } catch (err) {
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError("Attachment too large. Max size is 5 MB.");
        return;
      }
      setFormData({ ...formData, [name]: file });
    } else {
      setFormData({ ...formData, [name]: value });
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
    if (
      formData.service_type === "rental" &&
      formData.rental_categories.length === 0
    ) {
      setError("Please select at least one rental category.");
      return;
    }

    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val !== null && val !== "" && !(Array.isArray(val) && val.length === 0)) {
          if (Array.isArray(val)) {
            val.forEach((v) => fd.append("rental_categories", v));
          } else {
            fd.append(key, val);
          }
        }
      });

      await messagingService.sendMessage(fd);
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
      fetchMessages();
    } catch (err) {
      setError("Failed to send message");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this message?")) return;
    try {
      await messagingService.removeMessage(id);
      fetchMessages();
    } catch {
      setError("Failed to delete message");
    }
  }

  async function handleMarkRead(id) {
    try {
      await messagingService.markAsRead(id);
      fetchMessages();
    } catch {
      setError("Failed to mark as read");
    }
  }

  async function handleMarkUnread(id) {
    try {
      await messagingService.markAsUnread(id);
      fetchMessages();
    } catch {
      setError("Failed to mark as unread");
    }
  }

  return (
    <div className="messaging-page">
      <div className="messaging-header">
        <h1>Messages</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="icon" /> New Message
        </Button>
      </div>

      {error && <p className="error-text">{error}</p>}
      {loading && <Loader2 className="loading-spinner" />}

      {showForm && (
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
            <select
              name="service_type"
              value={formData.service_type}
              onChange={handleChange}
            >
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
          <Textarea
            name="equipment_list"
            value={formData.equipment_list}
            onChange={handleChange}
            placeholder="Equipment List"
          />

          <Button type="submit">Send</Button>
        </form>
      )}

      <div className="messages-list">
        {messages.map((msg) => (
          <Card key={msg.id} className="message-card">
            <CardContent>
              <div className="message-header">
                <h2>{msg.subject}</h2>
                <div className="message-actions">
                  <Button size="sm" variant="ghost" onClick={() => setSelectedMessage(msg)}>
                    <Eye className="icon" />
                  </Button>
                  {isAdmin && (
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(msg.id)}>
                      <Trash2 className="icon" />
                    </Button>
                  )}
                </div>
              </div>
              <p>{msg.message.slice(0, 100)}...</p>
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
                <Button size="sm" variant="outline" onClick={() => handleMarkRead(msg.id)}>
                  Mark Read
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleMarkUnread(msg.id)}>
                  Mark Unread
                </Button>
              </div>
              <p className="message-meta">
                From: {msg.sender_name || msg.sender_email}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

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
