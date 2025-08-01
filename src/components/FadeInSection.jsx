// src/components/FadeInSection.jsx
import React, { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import './FadeInSection.css';

// Optional: uncomment if you want Framer Motion support
// import { motion, AnimatePresence } from 'framer-motion';

const FadeInSection = ({ children, className = '', useMotion = false }) => {
  const { ref, inView } = useInView({
    triggerOnce: false, // Enable fade out on scroll-out
    threshold: 0.1,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(inView);
  }, [inView]);

  // If using Framer Motion (optional):
  // if (useMotion) {
  //   return (
  //     <AnimatePresence>
  //       <motion.div
  //         ref={ref}
  //         initial={{ opacity: 0, y: 20 }}
  //         animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
  //         exit={{ opacity: 0, y: 20 }}
  //         transition={{ duration: 0.8 }}
  //         className={`fade-in-motion ${className}`}
  //       >
  //         {children}
  //       </motion.div>
  //     </AnimatePresence>
  //   );
  // }

  return (
    <div
      ref={ref}
      className={`fade-in-section ${isVisible ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default FadeInSection;
