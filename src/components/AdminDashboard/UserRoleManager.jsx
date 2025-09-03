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

const roles = [
  { label: "Admin", value: "admin" },
  { label: "Worker", value: "worker" },
  { label: "User", value: "user" },
  { label: "Vendor", value: "vendor" },
  { label: "Partner", value: "partner" },
];

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

  // Fetch users from unified admin endpoint
  const fetchUsers = useCallback(
    async (role) => {
      setLoading(true);
      try {
        const res = await authAPI.adminListUsers({ role });
        const list = Array.isArray(res?.data)
          ? res.data
          : res?.data?.results || [];

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
    },
    []
  );

  useEffect(() => {
    fetchUsers(activeTab);
  }, [activeTab, fetchUsers]);

  // Toggle checkbox
  const toggleSelection = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Delete selected users
  const handleDelete = async () => {
    if (!selected.length) {
      toast.warn("No users selected.");
      return;
    }
    setSubmitting(true);
    try {
      const emails = selected.map((id) => idToEmail.get(id)).filter(Boolean);
      if (!emails.length) {
        toast.warn("No emails found.");
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

  // Send message
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

  // Send special offer
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

  // Invite worker
  const handleInviteWorker = async () => {
    if (!inviteEmail.trim()) {
      toast.warn("Enter worker email.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await authAPI.adminInviteWorker({ email: inviteEmail });
      const code = res?.data?.access_code;
      toast.success(
        code ? `Worker invited. Access code: ${code}` : "Worker invited."
      );
      setInviteEmail("");
      await fetchUsers("worker");
    } catch (err) {
      console.error("[UserRoleManager] Worker invite error:", err);
      toast.error("Worker invite failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle active/inactive
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

  return (
    <div className="urm-container">
      <Tabs defaultValue="admin" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="urm-tabs">
          {roles.map((role) => (
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

        <TabsContent value={activeTab}>
          {/* Worker invite UI */}
          {activeTab === "worker" && (
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

          {/* User grid */}
          {loading ? (
            <p className="urm-loading">Loading users...</p>
          ) : users.length > 0 ? (
            <div className="urm-grid">
              {users.map(
                ({
                  id,
                  name = "Unnamed",
                  email = "No email",
                  role: userRole = "",
                  is_active = false,
                }) => (
                  <Card key={id} className="urm-card">
                    <CardContent className="urm-card-content">
                      <div className="urm-check">
                        <Checkbox
                          checked={selected.includes(id)}
                          onCheckedChange={() => toggleSelection(id)}
                        />
                      </div>

                      <div className="urm-user">
                        <h2 className="urm-user-name">{name}</h2>
                        <p className="urm-user-email">{email}</p>
                        <p className="urm-user-role">
                          {(userRole || "").toUpperCase()}
                        </p>
                        <p
                          className={`urm-user-status ${
                            is_active
                              ? "urm-status--active"
                              : "urm-status--inactive"
                          }`}
                        >
                          {is_active ? "Active" : "Inactive"}
                        </p>
                      </div>

                      <Button
                        onClick={() => handleToggleActive(id)}
                        className="urm-btn-muted"
                      >
                        {is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          ) : (
            <p className="urm-empty">No users found.</p>
          )}

          {/* Actions */}
          <div className="urm-actions">
            <div className="urm-actions-row">
              <Button
                onClick={handleDelete}
                disabled={submitting || !selected.length}
                className="urm-btn-danger"
              >
                Delete Selected
              </Button>

              {activeTab === "user" && (
                <>
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
                </>
              )}
            </div>

            {activeTab === "user" && (
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message or offer..."
                className="urm-textarea"
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserRoleManager;
