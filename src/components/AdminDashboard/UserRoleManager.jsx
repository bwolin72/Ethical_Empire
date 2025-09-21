// src/components/admin/UserRoleManager.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import authService from "../../api/services/authService";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/Tabs";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/Textarea";
import { Input } from "../ui/Input";
import { toast } from "react-toastify";
import "./UserRoleManager.css";

const ROLES = [
  { label: "Admin", value: "admin" },
  { label: "Worker", value: "worker" },
  { label: "User", value: "user" },
  { label: "Vendor", value: "vendor" },
  { label: "Partner", value: "partner" },
];

const UserGrid = ({ users, selected, onToggleSelect, onToggleActive, loading }) => {
  if (loading) return <p className="urm-loading">Loading users...</p>;
  if (!users.length) return <p className="urm-empty">No users found.</p>;

  return (
    <div className="urm-grid">
      {users.map(({ id, name = "Unnamed", email = "No email", role = "", is_active }) => (
        <Card key={id} className="urm-card">
          <CardContent className="urm-card-content">
            <div className="urm-check">
              <Checkbox
                checked={selected.includes(id)}
                onCheckedChange={() => onToggleSelect(id)}
              />
            </div>

            <div className="urm-user">
              <h2 className="urm-user-name">{name}</h2>
              <p className="urm-user-email">{email}</p>
              <p className="urm-user-role">{(role || "").toUpperCase()}</p>
              <p
                className={`urm-user-status ${
                  is_active ? "urm-status--active" : "urm-status--inactive"
                }`}
              >
                {is_active ? "Active" : "Inactive"}
              </p>
            </div>

            <Button onClick={() => onToggleActive(id)} className="urm-btn-muted">
              {is_active ? "Deactivate" : "Activate"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const UserRoleManager = () => {
  const [activeTab, setActiveTab] = useState("admin");
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const idToEmail = useMemo(() => new Map(users.map((u) => [u.id, u.email])), [users]);

  const fetchUsers = useCallback(async (role) => {
    setLoading(true);
    try {
      const res = await authService.listUsers({ role });
      const list = Array.isArray(res?.data) ? res.data : res?.data?.results || [];
      setUsers(list.map((u) => ({ ...u, role: (u.role || "").toLowerCase() })));
    } catch (err) {
      console.error("[UserRoleManager] Fetch error:", err);
      toast.error("Failed to fetch users.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setSelected([]);
    setMessage("");
    fetchUsers(activeTab);
  }, [activeTab, fetchUsers]);

  const toggleSelection = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (!selected.length) return toast.warn("No users selected.");
    setSubmitting(true);
    try {
      const emails = selected.map((id) => idToEmail.get(id)).filter(Boolean);
      if (!emails.length) return toast.warn("No emails found for selected users.");
      await Promise.all(emails.map((email) => authService.adminDeleteByEmail({ email })));
      toast.success("Users deleted.");
      setSelected([]);
      await fetchUsers(activeTab);
    } catch (err) {
      console.error("[UserRoleManager] Delete error:", err);
      toast.error("Error deleting users.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMsg = async () => {
    if (!selected.length || !message.trim())
      return toast.warn("Select users and enter a message.");
    setSubmitting(true);
    try {
      await authService.adminSendMessage({ ids: selected, message });
      toast.success("Message sent.");
      setMessage("");
    } catch (err) {
      console.error("[UserRoleManager] Send message error:", err);
      toast.error("Failed to send message.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOffer = async () => {
    if (!selected.length || !message.trim())
      return toast.warn("Select users and enter an offer.");
    setSubmitting(true);
    try {
      await authService.adminSpecialOffer({ ids: selected, message });
      toast.success("Offer sent.");
      setMessage("");
    } catch (err) {
      console.error("[UserRoleManager] Offer error:", err);
      toast.error("Failed to send offer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInviteWorker = async () => {
    if (!inviteEmail.trim()) return toast.warn("Enter worker email.");
    setSubmitting(true);
    try {
      const res = await authService.adminInviteWorker({ email: inviteEmail });
      const code = res?.data?.access_code;
      toast.success(code ? `Worker invited. Access code: ${code}` : "Worker invited.");
      setInviteEmail("");
      await fetchUsers("worker");
    } catch (err) {
      console.error("[UserRoleManager] Worker invite error:", err);
      toast.error("Worker invite failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (userId) => {
    setSubmitting(true);
    try {
      // ⚠️ NOTE: Needs a real API endpoint in authService
      await authService.toggleUserActive(userId);
      toast.success("User status updated.");
      await fetchUsers(activeTab);
    } catch (err) {
      console.error("[UserRoleManager] Toggle active error:", err);
      toast.error("Failed to update status.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderCommon = () => (
    <>
      <UserGrid
        users={users}
        selected={selected}
        onToggleSelect={toggleSelection}
        onToggleActive={handleToggleActive}
        loading={loading}
      />
      <div className="urm-actions">
        <div className="urm-actions-row">
          <Button
            onClick={handleDelete}
            disabled={submitting || !selected.length}
            className="urm-btn-danger"
          >
            Delete Selected
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="urm-container">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="urm-tabs">
          {ROLES.map((role) => (
            <TabsTrigger
              key={role.value}
              value={role.value}
              className={`urm-tab ${
                activeTab === role.value ? "urm-tab--active" : ""
              }`}
            >
              {role.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {ROLES.map((role) => (
          <TabsContent key={role.value} value={role.value}>
            {role.value === "worker" && (
              <div className="urm-invite">
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter worker email"
                />
                <Button
                  onClick={handleInviteWorker}
                  disabled={submitting || !inviteEmail.trim()}
                  className="urm-btn-primary"
                >
                  Invite Worker
                </Button>
              </div>
            )}
            {renderCommon()}
            {role.value === "user" && (
              <div className="urm-actions">
                <div className="urm-actions-row">
                  <Button
                    onClick={handleSendMsg}
                    disabled={submitting || !message.trim() || !selected.length}
                    className="urm-btn-success"
                  >
                    Send Message
                  </Button>
                  <Button
                    onClick={handleOffer}
                    disabled={submitting || !message.trim() || !selected.length}
                    className="urm-btn-accent"
                  >
                    Send Offer
                  </Button>
                </div>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message or offer..."
                  className="urm-textarea"
                />
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default UserRoleManager;
