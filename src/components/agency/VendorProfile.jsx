// src/components/agency/VendorProfilePage.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "@/api/axiosInstance";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";

const VendorProfilePage = () => {
  const [form, setForm] = useState({
    company_name: "",
    contact_person: "",
    phone: "",
    address: "",
    website: "",
    trade_notes: "",
    service_equipment_list: "",
    availability_info: "",
    catalog_file: null,
    catalog_image: null,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVendorProfile = async () => {
      try {
        const res = await axiosInstance.get("/api/accounts/vendor-profile/");
        setForm((prev) => ({ ...prev, ...res.data }));
      } catch (err) {
        toast.error("Failed to load vendor profile");
      }
    };

    fetchVendorProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      for (const [key, value] of Object.entries(form)) {
        if (value) data.append(key, value);
      }

      await axiosInstance.put("/api/accounts/vendor-profile/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Vendor profile updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update vendor profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Vendor Profile</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label htmlFor="company_name">Company Name</Label>
              <Input id="company_name" name="company_name" value={form.company_name} onChange={handleChange} required />
            </div>

            <div>
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input id="contact_person" name="contact_person" value={form.contact_person} onChange={handleChange} />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" value={form.phone} onChange={handleChange} />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" name="address" value={form.address} onChange={handleChange} />
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" name="website" value={form.website} onChange={handleChange} />
            </div>

            <div>
              <Label htmlFor="trade_notes">Trade Notes</Label>
              <Textarea id="trade_notes" name="trade_notes" value={form.trade_notes} onChange={handleChange} />
            </div>

            <div>
              <Label htmlFor="service_equipment_list">Service/Equipment List</Label>
              <Textarea id="service_equipment_list" name="service_equipment_list" value={form.service_equipment_list} onChange={handleChange} />
            </div>

            <div>
              <Label htmlFor="availability_info">Availability Info</Label>
              <Textarea id="availability_info" name="availability_info" value={form.availability_info} onChange={handleChange} />
            </div>

            <div>
              <Label htmlFor="catalog_file">Catalog File (PDF, DOCX, TXT)</Label>
              <Input type="file" name="catalog_file" accept=".pdf,.docx,.txt" onChange={handleChange} />
            </div>

            <div>
              <Label htmlFor="catalog_image">Catalog Image</Label>
              <Input type="file" name="catalog_image" accept="image/*" onChange={handleChange} />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Profile"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default VendorProfilePage;
