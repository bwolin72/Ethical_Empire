import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
import { toast } from 'react-hot-toast';
import './VendorProfile.css';

const VendorProfilePage = () => {
  const [form, setForm] = useState({
    company_name: '',
    contact_person: '',
    phone: '',
    address: '',
    website: '',
    trade_notes: '',
    service_equipment_list: '',
    availability_info: '',
    catalog_file: null,
    catalog_image: null,
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVendorProfile = async () => {
      try {
        const res = await axiosInstance.get('/accounts/vendor-profile/');
        setForm((prev) => ({ ...prev, ...res.data }));
      } catch (err) {
        toast.error('Failed to load vendor profile');
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

      await axiosInstance.put('/accounts/vendor-profile/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Vendor profile updated successfully');

      // Redirect to AgencyDashboard
      navigate('/agency-dashboard');

    } catch (err) {
      console.error(err);
      toast.error('Failed to update vendor profile');
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
            {[
              ['company_name', 'Company Name'],
              ['contact_person', 'Contact Person'],
              ['phone', 'Phone'],
              ['website', 'Website'],
            ].map(([name, label]) => (
              <div key={name}>
                <Label htmlFor={name}>{label}</Label>
                <Input
                  id={name}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  required={name === 'company_name'}
                />
              </div>
            ))}

            {[
              ['address', 'Address'],
              ['trade_notes', 'Trade Notes'],
              ['service_equipment_list', 'Service/Equipment List'],
              ['availability_info', 'Availability Info'],
            ].map(([name, label]) => (
              <div key={name}>
                <Label htmlFor={name}>{label}</Label>
                <Textarea
                  id={name}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                />
              </div>
            ))}

            <div>
              <Label htmlFor="catalog_file">Catalog File (PDF, DOCX, TXT)</Label>
              <Input
                type="file"
                name="catalog_file"
                accept=".pdf,.docx,.txt"
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="catalog_image">Catalog Image</Label>
              <Input
                type="file"
                name="catalog_image"
                accept="image/*"
                onChange={handleChange}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default VendorProfilePage;
