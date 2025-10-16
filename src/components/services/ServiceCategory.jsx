import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import ServiceCard from "./ServiceCard";
import "./Services.css";

const ServiceCategory = ({ category }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const controls = useAnimation();
  const ref = useRef(null);

  /* === Scroll-triggered reveal using IntersectionObserver === */
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

  /* === Animation Variants === */
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
    visible: {
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  /* === Render === */
  return (
    <motion.section
      ref={ref}
      className="service-category-section scroll-reveal"
      initial="hidden"
      animate={controls}
      variants={sectionVariants}
    >
      {/* === Category Header === */}
      <motion.header className="category-header" variants={sectionVariants}>
        <h2 className="section-title gradient-text">
          {category?.name || "Unnamed Category"}
        </h2>
        {category?.description && (
          <p className="muted-text">{category.description}</p>
        )}
      </motion.header>

      {/* === Service List === */}
      <motion.div
        className="service-list"
        variants={listVariants}
        initial="hidden"
        animate={controls}
      >
        {category?.services?.length > 0 ? (
          category.services.map((srv, index) => (
            <motion.div
              key={srv.id ?? srv.slug ?? srv.name ?? index}
              variants={cardVariants}
            >
              <ServiceCard
                service={srv}
                isActive={activeIndex === index}
                onToggle={() =>
                  setActiveIndex(activeIndex === index ? null : index)
                }
              />
            </motion.div>
          ))
        ) : (
          <p className="muted-text">No active services in this category.</p>
        )}
      </motion.div>
    </motion.section>
  );
};

export default ServiceCategory;
