import React from "react";
import "./reviews.css";

/**
 * ReviewsLayout
 * A reusable layout wrapper for reviews-related components.
 *
 * Props:
 * - title (string) → section title
 * - children (ReactNode) → review list or form content
 * - description (string, optional) → small text below title
 */
const ReviewsLayout = ({ title = "User Reviews", description = "", children }) => {
  return (
    <section className="reviews-layout">
      {/* Section Heading */}
      <header className="reviews-layout-header">
        <h2>{title}</h2>
        {description && <p className="reviews-layout-description">{description}</p>}
      </header>

      {/* Content Wrapper */}
      <div className="reviews-layout-content">{children}</div>
    </section>
  );
};

export default ReviewsLayout;
