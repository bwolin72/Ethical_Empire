import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Button } from '../ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Checkbox } from '../../components/ui/checkbox';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { toast } from 'react-toastify';
import './UserRoleManager.css';

const palette = {
  burgundy: '#4B0F24',
  gold: '#D4AF37',
  green: '#228B22',
  cream: '#F5F5DC',
  charcoal: '#36454F',
};

const roles = ['ADMIN', 'WORKER', 'USER'];

const UserRoleManager = () => {
  const [activeTab, setActiveTab] = useState('ADMIN');
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const fetchUsers = async (role) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/accounts/profiles/list/?role=${role}`);
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (role) => {
    setActiveTab(role);
    setSelected([]);
    setMessage('');
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
          axiosInstance.delete(`/accounts/profiles/delete/${id}/`)
        )
      );
      fetchUsers(activeTab);
      setSelected([]);
    } catch (err) {
      console.error('Delete failed:', err);
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
      setMessage('');
    } catch (err) {
      console.error('Sending message failed:', err);
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
      setMessage('');
    } catch (err) {
      console.error('Sending offer failed:', err);
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
      console.error('Invite failed:', err);
      toast.error('Worker invite failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      await axiosInstance.post(`/accounts/profiles/toggle-active/${userId}/`);
      fetchUsers(activeTab);
    } catch (err) {
      console.error('Toggle active failed:', err);
    }
  };

  useEffect(() => {
    fetchUsers(activeTab);
  }, [activeTab]);

  return (
    <div style={{ backgroundColor: palette.cream }} className="p-4 md:p-8 min-h-screen">
      <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
        <TabsList className="flex gap-3 border-b pb-3 mb-5">
          {roles.map((role) => (
            <TabsTrigger
              key={role}
              value={role}
              className={`px-4 py-2 rounded-t-xl font-semibold text-sm transition ${
                activeTab === role
                  ? 'bg-[#4B0F24] text-white'
                  : 'bg-white text-black border border-gray-200'
              }`}
            >
              {role.charAt(0) + role.slice(1).toLowerCase()}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <p className="text-center text-gray-500">Loading users...</p>
          ) : (
            <>
              {activeTab === 'WORKER' && (
                <div className="flex gap-3 mb-6 items-center">
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter worker email to invite"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user) => (
                  <Card key={user.id} className="rounded-2xl border shadow-md p-4 bg-white">
                    <CardContent className="flex items-start gap-4 justify-between">
                      <Checkbox
                        checked={selected.includes(user.id)}
                        onCheckedChange={() => toggleSelection(user.id)}
                      />
                      <div className="flex-grow" style={{ color: palette.charcoal }}>
                        <h2 className="font-semibold text-lg">{user.name}</h2>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400 uppercase">{user.role}</p>
                        <p className={`text-xs mt-1 ${user.is_active ? 'text-green-600' : 'text-red-500'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => handleToggleActive(user.id)}
                          className="text-white bg-gray-700 hover:bg-gray-800 px-2 py-1 text-xs"
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleDelete}
                    disabled={submitting || !selected.length}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl"
                  >
                    Delete Selected
                  </Button>

                  {activeTab === 'USER' && (
                    <>
                      <Button
                        onClick={handleSendMsg}
                        disabled={submitting || !message.trim()}
                        className="bg-[#228B22] hover:bg-green-700 text-white px-4 py-2 rounded-xl"
                      >
                        Send Message
                      </Button>
                      <Button
                        onClick={handleOffer}
                        disabled={submitting || !message.trim()}
                        className="bg-[#D4AF37] hover:bg-yellow-500 text-white px-4 py-2 rounded-xl"
                      >
                        Send Offer
                      </Button>
                    </>
                  )}
                </div>

                {activeTab === 'USER' && (
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message or offer here..."
                    className="w-full p-3 border border-gray-300 rounded-xl shadow-sm"
                  />
                )}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserRoleManager;
