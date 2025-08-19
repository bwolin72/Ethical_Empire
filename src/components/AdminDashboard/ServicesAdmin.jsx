import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import serviceService from "../../api/serviceService";
import "./ServicesAdmin.css";

const ServicesAdmin = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", price: "" });
  const [editingSlug, setEditingSlug] = useState(null);

  // Load services
  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await serviceService.getServices();
      const data = res.data.results || res.data;
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Failed to load services:", err);
      toast.error("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle create or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSlug) {
        await serviceService.updateService(editingSlug, form);
        toast.success("✅ Service updated");
      } else {
        await serviceService.createService(form);
        toast.success("✅ Service created");
      }
      setForm({ name: "", price: "" });
      setEditingSlug(null);
      fetchServices();
    } catch (err) {
      console.error("❌ Failed to save service:", err.response?.data || err);
      toast.error("Failed to save service");
    }
  };

  // Handle edit
  const handleEdit = (srv) => {
    setForm({ name: srv.name, price: srv.price });
    setEditingSlug(srv.slug);
  };

  // Handle delete
  const handleDelete = async (slug) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      await serviceService.deleteService(slug);
      toast.success("🗑️ Service deleted");
      fetchServices();
    } catch (err) {
      console.error("❌ Failed to delete service:", err);
      toast.error("Failed to delete service");
    }
  };

  return (
    <div className="services-admin">
      <h2>Services Admin</h2>

      {/* Form */}
      <form className="service-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Service Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          step="0.01"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
        />
        <button type="submit" className="btn">
          {editingSlug ? "Update Service" : "Add Service"}
        </button>
        {editingSlug && (
          <button
            type="button"
            className="btn cancel"
            onClick={() => {
              setForm({ name: "", price: "" });
              setEditingSlug(null);
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {/* Services List */}
      {loading ? (
        <p>Loading services...</p>
      ) : services.length > 0 ? (
        <motion.table
          className="services-table"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((srv) => (
              <tr key={srv.slug}>
                <td>{srv.name}</td>
                <td>{srv.slug}</td>
                <td>${srv.price}</td>
                <td>
                  <button className="btn small" onClick={() => handleEdit(srv)}>
                    Edit
                  </button>
                  <button
                    className="btn small danger"
                    onClick={() => handleDelete(srv.slug)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </motion.table>
      ) : (
        <p>No services available.</p>
      )}
    </div>
  );
};

export default ServicesAdmin;
