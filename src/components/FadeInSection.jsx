// src/components/FadeInSection.jsx
import React, { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import './FadeInSection.css';

// Optional: enable Framer Motion support
import { motion, AnimatePresence } from 'framer-motion';

const FadeInSection = ({
  children,
  className = '',
  useMotion = false,
  delay = 0, // Optional delay in seconds
}) => {
  const { ref, inView } = useInView({
    triggerOnce: false, // Allows fade out when scrolled out
    threshold: 0.1,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(inView);
  }, [inView]);

  if (useMotion) {
    return (
      <AnimatePresence>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay }}
          className={`fade-in-motion ${className}`}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  }

  // Optional: add fade-in delay classes for staggered effects if needed
  const delayClass =
    delay >= 0.3 ? 'fade-in-delay-3'
    : delay >= 0.2 ? 'fade-in-delay-2'
    : delay >= 0.1 ? 'fade-in-delay-1'
    : '';

  return (
    <div
      ref={ref}
      className={`fade-in-section ${isVisible ? 'is-visible' : ''} ${delayClass} ${className}`}
    >
      {children}
    </div>
  );
};

export default FadeInSection;
