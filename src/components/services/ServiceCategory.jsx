import React, { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import ServiceCard from "./ServiceCard";
import "./Services.css";

const ServiceCategory = ({ category }) => {
  const controls = useAnimation();
  const ref = useRef(null);

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

  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const listVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  // Support both { services: [...] } or raw array of services
  const servicesArray = Array.isArray(category) ? category : category?.services ?? [];

  return (
    <motion.section
      ref={ref}
      className="service-category-section scroll-reveal"
      initial="hidden"
      animate={controls}
      variants={sectionVariants}
    >
      {/* Only show header if category object with name */}
      {category?.name && (
        <motion.header className="category-header" variants={sectionVariants}>
          <h2 className="section-title gradient-text">{category.name}</h2>
          <p className="muted-text">{category.description || "Explore our amazing services."}</p>
        </motion.header>
      )}

      {servicesArray.length > 0 ? (
        <motion.div className="service-list" variants={listVariants}>
          {servicesArray.map((srv, index) => (
            <motion.div
              key={srv.id ?? srv.slug ?? srv.name ?? index}
              variants={cardVariants}
            >
              <ServiceCard service={srv} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <p className="muted-text">No active services in this category.</p>
      )}
    </motion.section>
  );
};

export default ServiceCategory;
