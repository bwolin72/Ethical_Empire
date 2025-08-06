import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/Textarea';
import { Input } from '../ui/Input';
import { toast } from 'react-toastify';
import './UserRoleManager.css';

const palette = {
  burgundy: '#4B0F24',
  gold: '#D4AF37',
  green: '#228B22',
  cream: '#F5F5DC',
  charcoal: '#36454F',
};

const roles = [
  { label: 'Admin', value: 'admin' },
  { label: 'Worker', value: 'worker' },
  { label: 'User', value: 'user' },
  { label: 'Vendor', value: 'vendor' },
  { label: 'Partner', value: 'partner' },
];

const UserRoleManager = () => {
  const [activeTab, setActiveTab] = useState('admin');
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    fetchUsers(activeTab);
  }, [activeTab]);

  const fetchUsers = async (role) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/accounts/admin/list-users/?role=${role}`);
      console.log('[UserRoleManager] Fetched:', res.data);
      setUsers(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      console.error('[UserRoleManager] Fetch error:', err);
      toast.error('Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (!selected.length) return;
    setSubmitting(true);
    try {
      await Promise.all(
        selected.map((id) =>
          axiosInstance.delete(`/accounts/delete-by-email/`, { data: { id } })
        )
      );
      toast.success('Users deleted');
      setSelected([]);
      fetchUsers(activeTab);
    } catch (err) {
      toast.error('Error deleting users');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMsg = async () => {
    if (!selected.length || !message.trim()) return;
    setSubmitting(true);
    try {
      await axiosInstance.post('/accounts/profiles/send-message/', {
        ids: selected,
        message,
      });
      toast.success('Message sent');
      setMessage('');
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOffer = async () => {
    if (!selected.length || !message.trim()) return;
    setSubmitting(true);
    try {
      await axiosInstance.post('/accounts/profiles/special-offer/', {
        ids: selected,
        message,
      });
      toast.success('Offer sent');
      setMessage('');
    } catch (err) {
      toast.error('Failed to send offer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInviteWorker = async () => {
    if (!inviteEmail.trim()) return;
    setSubmitting(true);
    try {
      const res = await axiosInstance.post('/accounts/admin/invite-worker/', {
        email: inviteEmail,
      });
      toast.success(`Worker invited. Access code: ${res.data.access_code}`);
      setInviteEmail('');
    } catch (err) {
      toast.error('Worker invite failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (userId) => {
    setSubmitting(true);
    try {
      await axiosInstance.post(`/accounts/profiles/toggle-active/${userId}/`);
      toast.success('Status updated');
      fetchUsers(activeTab);
    } catch (err) {
      toast.error('Failed to update user status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: palette.cream }} className="p-4 md:p-8 min-h-screen">
      <Tabs defaultValue="admin" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex gap-3 border-b pb-3 mb-5 overflow-x-auto">
          {roles.map((role) => (
            <TabsTrigger
              key={role.value}
              value={role.value}
              className={`px-4 py-2 rounded-t-xl font-semibold text-sm transition ${
                activeTab === role.value
                  ? 'bg-[#4B0F24] text-white'
                  : 'bg-white text-black border border-gray-200'
              }`}
            >
              {role.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {roles.map((role) => (
          <TabsContent key={role.value} value={role.value}>
            {activeTab === 'worker' && (
              <div className="flex gap-3 mb-6 items-center">
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter worker email"
                />
                <Button
                  onClick={handleInviteWorker}
                  disabled={submitting || !inviteEmail.trim()}
                  className="bg-[#4B0F24] text-white"
                >
                  Invite Worker
                </Button>
              </div>
            )}

            {loading ? (
              <p className="text-center text-gray-500">Loading users...</p>
            ) : users.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user) => {
                  const {
                    id,
                    name = 'Unnamed',
                    email = 'No email',
                    role: userRole = '',
                    is_active = false,
                  } = user;

                  return (
                    <Card key={id} className="rounded-2xl border shadow-md p-4 bg-white">
                      <CardContent className="flex items-start gap-4 justify-between">
                        <div className="pt-1">
                          <Checkbox
                            checked={selected.includes(id)}
                            onCheckedChange={() => toggleSelection(id)}
                          />
                        </div>
                        <div className="flex-grow text-gray-800">
                          <h2 className="font-semibold text-lg">{name}</h2>
                          <p className="text-sm">{email}</p>
                          <p className="text-xs uppercase">{userRole}</p>
                          <p className={`text-xs mt-1 ${is_active ? 'text-green-600' : 'text-red-500'}`}>
                            {is_active ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleToggleActive(id)}
                          className="text-white bg-gray-700 hover:bg-gray-800 px-2 py-1 text-xs"
                        >
                          {is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-400 mt-8">No users found for this role.</p>
            )}

            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleDelete}
                  disabled={submitting || !selected.length}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete Selected
                </Button>

                {activeTab === 'user' && (
                  <>
                    <Button
                      onClick={handleSendMsg}
                      disabled={submitting || !message.trim() || !selected.length}
                      className="bg-[#228B22] hover:bg-green-700 text-white"
                    >
                      Send Message
                    </Button>
                    <Button
                      onClick={handleOffer}
                      disabled={submitting || !message.trim() || !selected.length}
                      className="bg-[#D4AF37] hover:bg-yellow-500 text-white"
                    >
                      Send Offer
                    </Button>
                  </>
                )}
              </div>

              {activeTab === 'user' && (
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message or offer..."
                  className="w-full p-3 border rounded-xl shadow-sm"
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
