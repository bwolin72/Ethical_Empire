import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Checkbox } from '../../components/ui/checkbox';
import { Textarea } from '../../components/ui/textarea';

const palette = {
  burgundy: '#4B0F24',
  gold: '#D4AF37',
  green: '#228B22',
  cream: '#F5F5DC',
  charcoal: '#36454F',
};

const UserRoleManager = () => {
  const [activeTab, setActiveTab] = useState('ADMIN');
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchUsers = async (role) => {
    setLoading(true);
    try {
      const res = await axios.get(`/user-account/profiles/list/?role=${role}`);
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
    setLoading(false);
  };

  const handleTabChange = (role) => {
    setActiveTab(role);
    setSelected([]);
    fetchUsers(role);
  };

  const handleDelete = async () => {
    try {
      await Promise.all(
        selected.map((id) =>
          axios.delete(`/user-account/profiles/delete/${id}/`)
        )
      );
      fetchUsers(activeTab);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleSendMsg = async () => {
    try {
      await axios.post('/user-account/profiles/send-message/', {
        ids: selected,
        message,
      });
      setMessage('');
    } catch (err) {
      console.error('Sending message failed:', err);
    }
  };

  const handleOffer = async () => {
    try {
      await axios.post('/user-account/profiles/special-offer/', {
        ids: selected,
        message,
      });
      setMessage('');
    } catch (err) {
      console.error('Sending offer failed:', err);
    }
  };

  const toggleSelection = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    fetchUsers('ADMIN');
  }, []);

  return (
    <div style={{ backgroundColor: palette.cream }} className="p-4 md:p-8 min-h-screen">
      <Tabs defaultValue="ADMIN" className="w-full" onValueChange={handleTabChange}>
        <TabsList className="flex space-x-4 border-b pb-2 mb-4">
          {['ADMIN', 'WORKER', 'USER'].map((role) => (
            <TabsTrigger
              key={role}
              value={role}
              className={`px-4 py-2 rounded-t-xl font-bold text-sm md:text-base transition-colors duration-200 ${
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
            <p className="text-center text-gray-500">Loading...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user) => (
                  <Card key={user.id} className="rounded-2xl border shadow-md p-4 bg-white">
                    <CardContent className="flex items-start gap-4">
                      <Checkbox
                        checked={selected.includes(user.id)}
                        onCheckedChange={() => toggleSelection(user.id)}
                      />
                      <div style={{ color: palette.charcoal }}>
                        <h2 className="font-semibold text-lg">{user.username}</h2>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs uppercase tracking-wider text-gray-400">{user.role}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl"
                  >
                    Delete Selected
                  </Button>
                  {activeTab === 'USER' && (
                    <>
                      <Button
                        onClick={handleSendMsg}
                        className="bg-[#228B22] hover:bg-green-700 text-white px-4 py-2 rounded-xl"
                      >
                        Send Message
                      </Button>
                      <Button
                        onClick={handleOffer}
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
                    placeholder="Write message or offer content here..."
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
