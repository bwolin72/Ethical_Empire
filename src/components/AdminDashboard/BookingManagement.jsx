import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './BookingManagement.css';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('created_at'); // 'name' or 'created_at'
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 10;

  const fetchBookings = async () => {
    try {
      setLoading(true);

      // Optionally include token only if needed
      const token = localStorage.getItem('access');
      const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      const res = await axios.get('http://localhost:8000/api/bookings/', {
        headers,
      });

      let data = res.data;

      // Search filter
      if (search) {
        data = data.filter(b =>
          b.name.toLowerCase().includes(search.toLowerCase()) ||
          b.email.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Sorting
      data.sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        } else {
          return new Date(b.created_at) - new Date(a.created_at);
        }
      });

      setBookings(data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [search, sortBy]);

  const markComplete = async (id) => {
    try {
      const token = localStorage.getItem('access');
      await axios.patch(
        `http://localhost:8000/api/bookings/${id}/`,
        { status: 'Completed' },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchBookings();
    } catch (err) {
      console.error('Failed to mark complete:', err);
    }
  };

  const deleteBooking = async (id) => {
    try {
      const token = localStorage.getItem('access');
      await axios.delete(`http://localhost:8000/api/bookings/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBookings();
    } catch (err) {
      console.error('Failed to delete booking:', err);
    }
  };

  // Pagination logic
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
            <th>Service(s)</th><th>Event Date</th><th>Booking Time</th>
            <th>Address</th><th>Message</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentBookings.map((b) => (
            <tr key={b.id} className={b.status === 'Completed' ? 'completed-row' : ''}>
              <td>{b.name}</td>
              <td>{b.email}</td>
              <td>{b.phone}</td>
              <td>{b.service_type?.join(', ') || '-'}</td>
              <td>{b.event_date ? new Date(b.event_date).toLocaleDateString() : '-'}</td>
              <td>{new Date(b.created_at).toLocaleString()}</td>
              <td>{b.address}</td>
              <td>{b.message || '-'}</td>
              <td>{b.status}</td>
              <td>
                <button
                  onClick={() => markComplete(b.id)}
                  disabled={b.status === 'Completed'}
                  className="mark-complete-btn"
                >
                  ✓ Complete
                </button>
                <button
                  onClick={() => deleteBooking(b.id)}
                  className="delete-btn"
                >
                  🗑 Delete
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
    </div>
  );
};

export default BookingManagement;
