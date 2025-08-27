// src/components/admin/UserRoleManager.jsx
import React, { useState, useEffect, useMemo } from "react";
import authAPI from "../../api/authAPI"; // ✅ use centralized auth API that matches urls
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
  const [selected, setSelected] = useState([]); // stores user IDs
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  // quick lookup maps
  const idToEmail = useMemo(
    () => new Map(users.map((u) => [u.id, u.email])),
    [users]
  );

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // /accounts/admin/list-users/
      const res = await authAPI.adminListUsers();
      const list = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setUsers(list);
    } catch (err) {
      console.error("[UserRoleManager] Fetch error:", err);
      toast.error("Failed to fetch users.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    // If the backend doesn't support role filtering via query param,
    // filter on the client by the tab's role.
    return users.filter(
      (u) => (u.role || "").toLowerCase() === activeTab.toLowerCase()
    );
  }, [users, activeTab]);

  const toggleSelection = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (!selected.length) return;
    setSubmitting(true);
    try {
      // /accounts/delete-by-email/ expects POST, one email per request
      const emails = selected
        .map((id) => idToEmail.get(id))
        .filter(Boolean);

      if (!emails.length) {
        toast.warn("No emails found for selected users.");
        return;
      }

      await Promise.all(
        emails.map((email) => authAPI.deleteByEmail({ email }))
      );
      toast.success("Users deleted.");
      setSelected([]);
      await fetchUsers();
    } catch (err) {
      console.error("[UserRoleManager] Delete error:", err);
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "Error deleting users.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMsg = async () => {
    if (!selected.length || !message.trim()) return;
    setSubmitting(true);
    try {
      // /accounts/profiles/send-message/
      await authAPI.sendMessageToUsers({ ids: selected, message });
      toast.success("Message sent.");
      setMessage("");
    } catch (err) {
      console.error("[UserRoleManager] Send message error:", err);
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "Failed to send message.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOffer = async () => {
    if (!selected.length || !message.trim()) return;
    setSubmitting(true);
    try {
      // /accounts/profiles/special-offer/
      await authAPI.specialOffer({ ids: selected, message });
      toast.success("Offer sent.");
      setMessage("");
    } catch (err) {
      console.error("[UserRoleManager] Offer error:", err);
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "Failed to send offer.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInviteWorker = async () => {
    if (!inviteEmail.trim()) return;
    setSubmitting(true);
    try {
      // /accounts/admin/invite-worker/ (optional feature)
      const res = await authAPI.adminInviteWorker({ email: inviteEmail });
      const access = res?.data?.access_code;
      toast.success(
        access ? `Worker invited. Access code: ${access}` : "Worker invited."
      );
      setInviteEmail("");
    } catch (err) {
      console.error("[UserRoleManager] Invite worker error:", err);
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "Worker invite failed.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (userId) => {
    setSubmitting(true);
    try {
      // POST /accounts/profiles/toggle-active/<user_id>/
      await authAPI.toggleUserActive(userId);
      toast.success("Status updated.");
      await fetchUsers();
    } catch (err) {
      console.error("[UserRoleManager] Toggle active error:", err);
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "Failed to update user status.";
      toast.error(msg);
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

        {roles.map((role) => (
          <TabsContent key={role.value} value={role.value}>
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

            {loading ? (
              <p className="urm-loading">Loading users...</p>
            ) : filteredUsers.length > 0 ? (
              <div className="urm-grid">
                {filteredUsers.map((user) => {
                  const {
                    id,
                    name = "Unnamed",
                    email = "No email",
                    role: userRole = "",
                    is_active = false,
                  } = user;

                  return (
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
                              is_active ? "urm-status--active" : "urm-status--inactive"
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
                  );
                })}
              </div>
            ) : (
              <p className="urm-empty">No users found for this role.</p>
            )}

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
        ))}
      </Tabs>
    </div>
  );
};

export default UserRoleManager;
