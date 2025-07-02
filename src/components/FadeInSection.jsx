// src/components/FadeInSection.jsx
import React from 'react';
import { useInView } from 'react-intersection-observer';
import './FadeInSection.css'; // Optional: for custom animation

const FadeInSection = ({ children, className = '' }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div
      ref={ref}
      className={`fade-in-section ${inView ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default FadeInSection;
