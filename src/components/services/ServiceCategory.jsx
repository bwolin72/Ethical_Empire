import React, { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import ServiceCard from "./ServiceCard";
import "./Services.css";

const ServiceCategory = ({ category, isFeatured = false }) => {
  const controls = useAnimation();
  const ref = useRef(null);

  /* === Animate section on scroll into view === */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            controls.start("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [controls]);

  /* === Framer Motion Variants === */
  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const listVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  /* === Handle flexible category format === */
  const servicesArray = Array.isArray(category)
    ? category
    : category?.services ?? [];

  return (
    <motion.section
      ref={ref}
      className={`service-category-section ${isFeatured ? 'featured-category' : ''}`}
      initial="hidden"
      animate={controls}
      variants={sectionVariants}
    >
      {/* === CATEGORY HEADER === */}
      {category?.name && (
        <motion.header
          className="category-header"
          variants={sectionVariants}
          transition={{ duration: 0.5 }}
        >
          <h2 className="section-title">
            {category.name}
          </h2>
          {category.description && (
            <p className="section-description">
              {category.description}
            </p>
          )}
        </motion.header>
      )}

      {/* === SERVICE LIST === */}
      {servicesArray.length > 0 ? (
        <motion.div
          className="service-list"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {servicesArray.map((service, index) => (
            <motion.div
              key={service.id ?? service.slug ?? service.name ?? index}
              variants={cardVariants}
            >
              <ServiceCard service={service} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <p className="empty-state">
          No active services in this category.
        </p>
      )}
    </motion.section>
  );
};

export default ServiceCategory;
