import React, { useEffect, useRef, useState } from 'react';
import BannerCards from '../context/BannerCards';
import MediaCards from '../context/MediaCards';
import './MediaHostingServicePage.css';
import { Card, CardContent } from '../ui/Card';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import PhoneInput from 'react-phone-number-input';
import axiosCommon from '../../api/axiosCommon';
import 'react-phone-number-input/style.css';
import { toast } from 'react-toastify';

const hostingServices = [
  'Videography Coverage',
  'Photography Sessions',
  'Drone Footage & Aerial Views',
  'Live Streaming & Event Recording',
  'Portrait & Studio Shoots',
  'On-site Event Hosting',
];

const MediaHostingServicePage = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm();

  const phone = watch('phone');

  useEffect(() => {
    register('phone', { required: 'Phone number is required' });
  }, [register]);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await axiosCommon.get('/videos/', {
          params: { endpoint: 'mediaHostingServicePage', is_active: true },
        });
        if (res.data.length > 0) setVideoUrl(res.data[0].video_url);
      } catch (error) {
        console.error('Video load failed:', error);
      }
    };
    fetchVideo();
  }, []);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  const onSubmit = async (data) => {
    if (!phone) {
      toast.error('Please enter a valid phone number');
      return;
    }

    try {
      // Example backend POST endpoint (replace with actual if needed)
      await axiosCommon.post('/bookings/', {
        ...data,
        phone,
        service_type: 'Media Hosting',
      });
      toast.success('Booking submitted successfully!');
    } catch (err) {
      toast.error('Submission failed. Please try again.');
    }
  };

  return (
    <div className="media-hosting-page">
      {/* === Hero Banner or Video === */}
      <section className="hero-banner">
        {videoUrl ? (
          <div className="video-wrapper">
            <video
              ref={videoRef}
              src={videoUrl}
              className="hero-video"
              autoPlay
              loop
              muted={isMuted}
              playsInline
            />
            <button className="mute-button" onClick={toggleMute}>
              {isMuted ? '🔇' : '🔊'}
            </button>
          </div>
        ) : (
          <BannerCards
            endpoint="mediaHostingServicePage"
            title="Capture & Host with Ethical Precision"
          />
        )}
      </section>

      {/* === Booking Form === */}
      <section className="booking-form-section">
        <h2 className="section-title">Book Hosting Service</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="booking-form">
          <input
            {...register('name', { required: 'Name is required' })}
            type="text"
            placeholder="Your Full Name"
          />
          {errors.name && <span className="error">{errors.name.message}</span>}

          <PhoneInput
            defaultCountry="GH"
            international
            countryCallingCodeEditable={false}
            placeholder="Enter phone number"
            value={phone}
            onChange={(value) => {
              setValue('phone', value);
              trigger('phone');
            }}
          />
          {errors.phone && <span className="error">{errors.phone.message}</span>}

          <input
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Invalid email address',
              },
            })}
            type="email"
            placeholder="Your Email"
          />
          {errors.email && <span className="error">{errors.email.message}</span>}

          <input
            {...register('eventType', { required: 'Event type is required' })}
            type="text"
            placeholder="Type of Event (e.g., Wedding)"
          />
          {errors.eventType && <span className="error">{errors.eventType.message}</span>}

          <input
            {...register('eventDate')}
            type="date"
            placeholder="Event Date"
          />

          <textarea
            {...register('message')}
            placeholder="Additional Information (optional)"
            rows={4}
          />

          <button className="cta-button" type="submit">
            Submit Booking Request
          </button>
        </form>
      </section>

      {/* === Services Grid === */}
      <section className="section services-section">
        <h2 className="section-title">Our Multimedia & Hosting Services</h2>
        <div className="card-grid">
          {hostingServices.map((service, index) => (
            <motion.div
              key={index}
              className="service-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card>
                <CardContent className="card-content">{service}</CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* === Creative Media Preview === */}
      <section className="section creative-section">
        <div className="creative-layout">
          <div className="creative-text">
            <h3 className="section-subtitle">Visual Storytelling & Professional Coverage</h3>
            <p className="section-description">
              Whether it’s a corporate launch, private shoot, or public concert,
              Ethical Multimedia ensures every moment is captured in stunning clarity.
              From cinematic videography to detailed photography and reliable hosting—
              your memories and messages are in expert hands.
            </p>
          </div>
          <div className="creative-media">
            <MediaCards
              endpoint="mediaHostingServicePage"
              type="media"
              limit={3}
              fullWidth={false}
              supportPreview={true}
            />
          </div>
        </div>
      </section>

      {/* === Hosting Venue Info === */}
      <section className="section event-hosting-section">
        <h2 className="section-title">Hosting Event Place</h2>
        <p className="section-description">
          Need a location for your next shoot, seminar, or celebration?
          We offer fully equipped event spaces with lighting, seating, sound,
          and ambiance—ready for recording, streaming, or staging your unforgettable moment.
          Let us be your venue partner.
        </p>
      </section>

      {/* === Full Gallery === */}
      <section className="section">
        <h2 className="section-title">Multimedia Gallery</h2>
        <MediaCards
          endpoint="mediaHostingServicePage"
          type="media"
          limit={6}
          fullWidth={true}
          supportPreview={true}
        />
      </section>
    </div>
  );
};

export default MediaHostingServicePage;
