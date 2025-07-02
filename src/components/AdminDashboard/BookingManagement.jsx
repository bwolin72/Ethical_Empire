import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import './BookingManagement.css';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('created_at');
  const [currentPage, setCurrentPage] = useState(1);
  const [editBooking, setEditBooking] = useState(null);
  const bookingsPerPage = 10;

  const token = localStorage.getItem('access');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/bookings/', { headers });
      let data = res.data;

      if (search) {
        data = data.filter(b =>
          b.name.toLowerCase().includes(search.toLowerCase()) ||
          b.email.toLowerCase().includes(search.toLowerCase())
        );
      }

      data.sort((a, b) =>
        sortBy === 'name'
          ? a.name.localeCompare(b.name)
          : new Date(b.created_at) - new Date(a.created_at)
      );

      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [headers, search, sortBy]);

  const fetchServices = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/services/', { headers });
      setServices(res.data);
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  }, [headers]);

  useEffect(() => {
    fetchBookings();
    fetchServices();
  }, [fetchBookings, fetchServices]);

  const handleEdit = (booking) => {
    setEditBooking({ ...booking, services: booking.service_details.map(s => s.id) });
  };

  const handleEditChange = (field, value) => {
    setEditBooking(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceToggle = (id) => {
    setEditBooking(prev => {
      const exists = prev.services.includes(id);
      return {
        ...prev,
        services: exists
          ? prev.services.filter(sid => sid !== id)
          : [...prev.services, id],
      };
    });
  };

  const saveEdit = async () => {
    try {
      await axiosInstance.patch(`/bookings/${editBooking.id}/`, {
        name: editBooking.name,
        email: editBooking.email,
        phone: editBooking.phone,
        address: editBooking.address,
        message: editBooking.message,
        event_date: editBooking.event_date,
        status: editBooking.status,
        services: editBooking.services,
      }, { headers });

      setEditBooking(null);
      fetchBookings();
    } catch (err) {
      console.error('Failed to save booking:', err);
    }
  };

  const cancelEdit = () => setEditBooking(null);

  const markComplete = async (id) => {
    try {
      await axiosInstance.patch(`/bookings/${id}/`, { status: 'Completed' }, { headers });
      fetchBookings();
    } catch (err) {
      console.error('Failed to mark complete:', err);
    }
  };

  const deleteBooking = async (id) => {
    try {
      await axiosInstance.delete(`/bookings/${id}/`, { headers });
      fetchBookings();
    } catch (err) {
      console.error('Failed to delete booking:', err);
    }
  };

  const indexOfLast = currentPage * bookingsPerPage;
  const indexOfFirst = indexOfLast - bookingsPerPage;
  const currentBookings = bookings.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(bookings.length / bookingsPerPage);
  const handlePageChange = (page) => setCurrentPage(page);

  if (loading) return <p>Loading bookings...</p>;

  return (
    <div className="booking-management">
      <h2>Booking Management</h2>

      <div className="controls">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select onChange={(e) => setSortBy(e.target.value)} value={sortBy}>
          <option value="created_at">Sort by Date</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      <table className="booking-table">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Phone</th>
            <th>Services</th><th>Event Date</th><th>Booking Time</th>
            <th>Address</th><th>Message</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentBookings.map((b) => (
            <tr key={b.id} className={b.status === 'Completed' ? 'completed-row' : ''}>
              <td>{b.name}</td>
              <td>{b.email}</td>
              <td>{b.phone}</td>
              <td>{b.service_details?.map(s => s.name).join(', ') || '-'}</td>
              <td>{b.event_date ? new Date(b.event_date).toLocaleDateString() : '-'}</td>
              <td>{new Date(b.created_at).toLocaleString()}</td>
              <td>{b.address}</td>
              <td>{b.message || '-'}</td>
              <td>{b.status}</td>
              <td>
                <button onClick={() => handleEdit(b)}>✏️ Edit</button>
                <button
                  onClick={() => markComplete(b.id)}
                  disabled={b.status === 'Completed'}
                  className="mark-complete-btn"
                >
                  ✓
                </button>
                <button onClick={() => deleteBooking(b.id)} className="delete-btn">
                  🗑
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => handlePageChange(i + 1)}
            className={currentPage === i + 1 ? 'active' : ''}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Edit Modal */}
      {editBooking && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Booking</h3>
            <input
              value={editBooking.name}
              onChange={e => handleEditChange('name', e.target.value)}
              placeholder="Name"
            />
            <input
              value={editBooking.email}
              onChange={e => handleEditChange('email', e.target.value)}
              placeholder="Email"
            />
            <input
              value={editBooking.phone}
              onChange={e => handleEditChange('phone', e.target.value)}
              placeholder="Phone"
            />
            <input
              value={editBooking.address}
              onChange={e => handleEditChange('address', e.target.value)}
              placeholder="Address"
            />
            <textarea
              value={editBooking.message || ''}
              onChange={e => handleEditChange('message', e.target.value)}
              placeholder="Message"
            />
            <input
              type="date"
              value={editBooking.event_date || ''}
              onChange={e => handleEditChange('event_date', e.target.value)}
            />
            <select
              value={editBooking.status}
              onChange={e => handleEditChange('status', e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <div className="services-list">
              <label>Services:</label>
              {services.map(service => (
                <div key={service.id}>
                  <input
                    type="checkbox"
                    checked={editBooking.services.includes(service.id)}
                    onChange={() => handleServiceToggle(service.id)}
                  />
                  {service.name}
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button onClick={saveEdit}>💾 Save</button>
              <button onClick={cancelEdit}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
