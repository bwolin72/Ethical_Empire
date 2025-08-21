import { useEffect, useState } from "react";

const Button = ({ className = "", ...props }) => (
  <button
    className={`px-3 py-2 rounded-2xl shadow-sm border border-gray-200 hover:bg-gray-50 active:scale-[.99] transition ${className}`}
    {...props}
  />
);

export default function WorkerProfile({ me, services, onSave }) {
  const [form, setForm] = useState({
    phone: me?.phone || "",
    bio: me?.bio || "",
    gender: me?.gender || "",
    date_of_birth: me?.date_of_birth || "",
    category_id: me?.category?.id || null,
    availability_status: me?.availability_status || "AVAILABLE",
  });

  useEffect(() => {
    setForm({
      phone: me?.phone || "",
      bio: me?.bio || "",
      gender: me?.gender || "",
      date_of_birth: me?.date_of_birth || "",
      category_id: me?.category?.id || null,
      availability_status: me?.availability_status || "AVAILABLE",
    });
  }, [me]);

  const handleChange = (key, value) =>
    setForm((f) => ({
      ...f,
      [key]: value,
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      onSubmit={handleSubmit}
    >
      {/* Phone */}
      <div>
        <label className="text-sm text-gray-600">Phone</label>
        <input
          className="w-full border rounded-xl px-3 py-2"
          value={form.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
        />
      </div>

      {/* Gender */}
      <div>
        <label className="text-sm text-gray-600">Gender</label>
        <select
          className="w-full border rounded-xl px-3 py-2"
          value={form.gender}
          onChange={(e) => handleChange("gender", e.target.value)}
        >
          <option value="">Select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Date of Birth */}
      <div>
        <label className="text-sm text-gray-600">Date of Birth</label>
        <input
          type="date"
          className="w-full border rounded-xl px-3 py-2"
          value={form.date_of_birth}
          onChange={(e) => handleChange("date_of_birth", e.target.value)}
        />
      </div>

      {/* Service Category */}
      <div>
        <label className="text-sm text-gray-600">Service Category</label>
        <select
          className="w-full border rounded-xl px-3 py-2"
          value={form.category_id || ""}
          onChange={(e) => handleChange("category_id", e.target.value || null)}
        >
          <option value="">Select service</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Bio */}
      <div className="md:col-span-2">
        <label className="text-sm text-gray-600">Bio</label>
        <textarea
          className="w-full border rounded-xl px-3 py-2"
          rows={4}
          value={form.bio}
          onChange={(e) => handleChange("bio", e.target.value)}
        />
      </div>

      {/* Availability */}
      <div>
        <label className="text-sm text-gray-600">Availability</label>
        <select
          className="w-full border rounded-xl px-3 py-2"
          value={form.availability_status}
          onChange={(e) => handleChange("availability_status", e.target.value)}
        >
          <option value="AVAILABLE">Available</option>
          <option value="BUSY">Busy</option>
          <option value="OFF">Off / Leave</option>
        </select>
      </div>

      {/* Submit */}
      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" className="bg-black text-white">
          Save Changes
        </Button>
      </div>
    </form>
  );
}
