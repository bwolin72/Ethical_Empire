// src/components/admin/UserRoleManager.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import authAPI from "../../api/authAPI";
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

const UserGrid = ({
  users,
  selected,
  onToggleSelect,
  onToggleActive,
  loading,
}) => {
  if (loading) return <p className="urm-loading">Loading users...</p>;
  if (!users.length) return <p className="urm-empty">No users found.</p>;

  return (
    <div className="urm-grid">
      {users.map(
        ({ id, name = "Unnamed", email = "No email", role = "", is_active }) => (
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
        )
      )}
    </div>
  );
};

const UserRoleManager = () => {
  const [activeTab, setActiveTab] = useState("admin");
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]); // user IDs
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  // Quick lookup
  const idToEmail = useMemo(
    () => new Map(users.map((u) => [u.id, u.email])),
    [users]
  );

  // Fetch users by role
  const fetchUsers = useCallback(async (role) => {
    setLoading(true);
    try {
      const res = await authAPI.adminListUsers({ role });
      const list = Array.isArray(res?.data) ? res.data : res?.data?.results || [];
      const normalized = list.map((u) => ({
        ...u,
        role: (u.role || "").toLowerCase(),
      }));
      setUsers(normalized);
    } catch (err) {
      console.error("[UserRoleManager] Fetch error:", err);
      toast.error("Failed to fetch users.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setSelected([]); // clear selection on tab change
    setMessage("");  // clear compose box
    fetchUsers(activeTab);
  }, [activeTab, fetchUsers]);

  // selection
  const toggleSelection = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // bulk delete
  const handleDelete = async () => {
    if (!selected.length) {
      toast.warn("No users selected.");
      return;
    }
    setSubmitting(true);
    try {
      const emails = selected.map((id) => idToEmail.get(id)).filter(Boolean);
      if (!emails.length) {
        toast.warn("No emails found for selected users.");
        return;
      }
      await Promise.all(emails.map((email) => authAPI.deleteByEmail({ email })));
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

  // send message to users (User tab)
  const handleSendMsg = async () => {
    if (!selected.length || !message.trim()) {
      toast.warn("Select users and enter a message.");
      return;
    }
    setSubmitting(true);
    try {
      await authAPI.sendMessageToUsers({ ids: selected, message });
      toast.success("Message sent.");
      setMessage("");
    } catch (err) {
      console.error("[UserRoleManager] Send message error:", err);
      toast.error("Failed to send message.");
    } finally {
      setSubmitting(false);
    }
  };

  // send special offer (User tab)
  const handleOffer = async () => {
    if (!selected.length || !message.trim()) {
      toast.warn("Select users and enter an offer.");
      return;
    }
    setSubmitting(true);
    try {
      await authAPI.specialOffer({ ids: selected, message });
      toast.success("Offer sent.");
      setMessage("");
    } catch (err) {
      console.error("[UserRoleManager] Offer error:", err);
      toast.error("Failed to send offer.");
    } finally {
      setSubmitting(false);
    }
  };

  // invite worker (Worker tab)
  const handleInviteWorker = async () => {
    if (!inviteEmail.trim()) {
      toast.warn("Enter worker email.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await authAPI.adminInviteWorker({ email: inviteEmail });
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

  // toggle active/inactive
  const handleToggleActive = async (userId) => {
    setSubmitting(true);
    try {
      await authAPI.toggleUserActive(userId);
      toast.success("User status updated.");
      await fetchUsers(activeTab);
    } catch (err) {
      console.error("[UserRoleManager] Toggle active error:", err);
      toast.error("Failed to update status.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---- shared content renderer (grid + actions that are common) ----
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
      <Tabs
        defaultValue="admin"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="urm-tabs">
          {ROLES.map((role) => (
            <TabsTrigger
              key={role.value}
              value={role.value}
              onClick={() => setActiveTab(role.value)} // fallback to ensure state changes
              className={`urm-tab ${activeTab === role.value ? "urm-tab--active" : ""}`}
            >
              {role.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ADMIN */}
        <TabsContent value="admin">
          {renderCommon()}
          {/* You can add admin-only bulk tools here later (promote/demote, reset passwords, impersonate, export CSV, etc.) */}
        </TabsContent>

        {/* WORKER */}
        <TabsContent value="worker">
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
          {renderCommon()}
        </TabsContent>

        {/* USER */}
        <TabsContent value="user">
          {renderCommon()}
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
        </TabsContent>

        {/* VENDOR */}
        <TabsContent value="vendor">
          {renderCommon()}
          {/* Place vendor-specific actions here if needed (approve vendor, assign manager, etc.) */}
        </TabsContent>

        {/* PARTNER */}
        <TabsContent value="partner">
          {renderCommon()}
          {/* Place partner-specific actions here if needed */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserRoleManager;
