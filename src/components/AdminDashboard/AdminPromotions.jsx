// src/components/AdminDashboard/AdminPromotions.jsx
import React, { useEffect, useState } from "react";
import promotionService from "../../api/services/promotionService";
import "./AdminPromotions.css";

const AdminPromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [activePromotions, setActivePromotions] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    html_content: "",
    start_time: "",
    end_time: "",
    dismissible: true,
  });
  const [editId, setEditId] = useState(null);
  const [refresh, setRefresh] = useState(false);

  // ==============================
  // Fetch All + Active Promotions
  // ==============================
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const [allRes, activeRes] = await Promise.all([
          promotionService.list(),
          promotionService.active(),
        ]);

        const allData = allRes.data?.results || allRes.data;
        const activeData = activeRes.data?.results || activeRes.data;

        setPromotions(Array.isArray(allData) ? allData : []);
        setActivePromotions(Array.isArray(activeData) ? activeData : []);
      } catch (err) {
        console.error("[AdminPromotions] Fetch error:", err);
      }
    };
    fetchPromotions();
  }, [refresh]);

  // ==============================
  // Handlers
  // ==============================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await promotionService.update(editId, formData);
      } else {
        await promotionService.create(formData);
      }
      resetForm();
      setRefresh((r) => !r);
    } catch (err) {
      console.error("[AdminPromotions] Submit error:", err);
    }
  };

  const handleEdit = (promo) => {
    setFormData({
      title: promo.title,
      html_content: promo.html_content,
      start_time: promo.start_time,
      end_time: promo.end_time,
      dismissible: promo.dismissible,
    });
    setEditId(promo.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this promotion?")) return;
    try {
      await promotionService.remove(id);
      setRefresh((r) => !r);
    } catch (err) {
      console.error("[AdminPromotions] Delete error:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      html_content: "",
      start_time: "",
      end_time: "",
      dismissible: true,
    });
    setEditId(null);
  };

  // ==============================
  // JSX
  // ==============================
  return (
    <div className="admin-promotions">
      <h2>{editId ? "✏️ Edit Promotion" : "➕ Create New Promotion"}</h2>

      {/* Form */}
      <form className="promo-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Promotion Title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <textarea
          name="html_content"
          placeholder="HTML Content"
          value={formData.html_content}
          onChange={handleChange}
          rows="5"
        />

        <label>
          Start Time:
          <input
            type="datetime-local"
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          End Time:
          <input
            type="datetime-local"
            name="end_time"
            value={formData.end_time}
            onChange={handleChange}
            required
          />
        </label>

        <label className="checkbox">
          <input
            type="checkbox"
            name="dismissible"
            checked={formData.dismissible}
            onChange={handleChange}
          />
          Dismissible Popup
        </label>

        <button type="submit">{editId ? "Update" : "Post"} Promotion</button>
        {editId && (
          <button type="button" onClick={resetForm}>
            Cancel Edit
          </button>
        )}
      </form>

      {/* Active Promotions */}
      <h3>✅ Currently Active Promotions</h3>
      <div className="promo-list active-promos">
        {activePromotions.length ? (
          activePromotions.map((promo) => (
            <div key={promo.id} className="promo-card active">
              <h4>{promo.title}</h4>
              <div className="promo-time">
                {new Date(promo.start_time).toLocaleString()} →{" "}
                {new Date(promo.end_time).toLocaleString()}
              </div>
              <div
                className="promo-preview"
                dangerouslySetInnerHTML={{ __html: promo.html_content }}
              />
              <span className="active-badge">LIVE</span>
            </div>
          ))
        ) : (
          <p>No promotions are active right now.</p>
        )}
      </div>

      {/* All Promotions */}
      <h3>📋 All Promotions</h3>
      <div className="promo-list">
        {promotions.map((promo) => (
          <div key={promo.id} className="promo-card">
            <h4>{promo.title}</h4>

            <div className="promo-time">
              {new Date(promo.start_time).toLocaleString()} →{" "}
              {new Date(promo.end_time).toLocaleString()}
            </div>

            <div
              className="promo-preview"
              dangerouslySetInnerHTML={{ __html: promo.html_content }}
            />

            <div className="promo-meta">
              <span>{promo.dismissible ? "Dismissible" : "Fixed"}</span>
              <span className={`status ${promo.status?.toLowerCase() || ""}`}>
                {promo.status || "Unknown"}
              </span>
            </div>

            <div className="promo-actions">
              <button onClick={() => handleEdit(promo)}>Edit</button>
              <button onClick={() => handleDelete(promo.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPromotions;
