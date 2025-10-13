import { useState } from "react";
import { ChevronDown } from "lucide-react";
import "./FAQ.css"; // import your custom stylesheet

/**
 * FAQ Component
 * - Accessible accordion with keyboard navigation
 * - Uses custom CSS classes (no Tailwind)
 * - Data-driven (easy to add/remove questions)
 */

const faqs = [
  {
    category: "General Information",
    items: [
      {
        q: "Who is Ethical Multimedia GH (EETHM_GH)?",
        a: "We are Ghana’s premier full-service event partner, offering catering, décor, live music, and venue hosting. With over a decade of experience, we fuse creativity, culture, and class into unforgettable celebrations.",
      },
      {
        q: "Do you operate internationally?",
        a: "Yes. While based in Ghana, we also provide catering, décor, and entertainment services for destination and international events.",
      },
    ],
  },
  {
    category: "Booking & Pricing",
    items: [
      {
        q: "How do I book your services?",
        a: "You can book through phone, WhatsApp, or email. We’ll schedule a consultation to discuss your vision and tailor a package for you.",
      },
      {
        q: "Do you require a deposit?",
        a: "Yes. A deposit is required to secure your booking, with the balance payable before or after the event depending on the agreement.",
      },
      {
        q: "How early should I book?",
        a: "We recommend at least 4–8 weeks before your event. For large or international events, 2–3 months in advance is ideal.",
      },
      {
        q: "Do you offer customized packages?",
        a: "Absolutely. Every event is unique, and we design our packages to fit your style, needs, and budget.",
      },
    ],
  },
  {
    category: "Catering",
    items: [
      {
        q: "What cuisines do you provide?",
        a: "We offer authentic Ghanaian dishes and global menus including Mediterranean, Italian, French, Asian, and fusion cuisines.",
      },
      {
        q: "Can you accommodate dietary restrictions?",
        a: "Yes, we provide halal, vegan, gluten-free, and health-conscious menu options.",
      },
      {
        q: "Do you offer tasting sessions?",
        a: "Yes, tasting sessions are available for major events to ensure your menu meets expectations.",
      },
    ],
  },
  {
    category: "Décor & Set Design",
    items: [
      {
        q: "Can you create décor for a custom theme?",
        a: "Yes. Our design team specializes in bespoke themes, from cultural to modern luxury.",
      },
      {
        q: "Do you provide mockups or previews?",
        a: "Yes. We offer mood boards and 3D previews so you can visualize the décor before the event.",
      },
    ],
  },
  {
    category: "Music & Entertainment",
    items: [
      {
        q: "What kind of music do you provide?",
        a: "Our live bands perform highlife, Afrobeat, jazz, gospel, reggae, and contemporary hits. We also provide DJs and cultural ensembles.",
      },
      {
        q: "Do you provide equipment?",
        a: "Yes, we supply sound systems, lighting, and stage setups as part of our entertainment services.",
      },
    ],
  },
  {
    category: "Venue & Hosting",
    items: [
      {
        q: "Do you provide venues?",
        a: "Yes, we have indoor halls, outdoor gardens, and creative studio spaces for events.",
      },
      {
        q: "Can you host hybrid or virtual events?",
        a: "Yes, our venues are equipped for livestreams and hybrid setups.",
      },
    ],
  },
  {
    category: "Payments & Policies",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept bank transfers, mobile money, and cash.",
      },
      {
        q: "What is your cancellation policy?",
        a: "Cancellations must be communicated in writing. Refunds depend on how close to the event the cancellation occurs.",
      },
    ],
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  let counter = 0; // unique index across all categories

  return (
    <section className="faq-container">
      <h2 className="faq-title">Frequently Asked Questions</h2>

      {faqs.map((section, sectionIndex) => (
        <div key={sectionIndex} className="faq-section">
          <h3 className="faq-category">{section.category}</h3>
          <div className="faq-items">
            {section.items.map((item) => {
              const index = counter++;
              const isOpen = openIndex === index;
              return (
                <div key={index} className="faq-item">
                  <button
                    onClick={() => toggleFAQ(index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    className="faq-question"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`faq-icon${isOpen ? " open" : ""}`}
                    />
                  </button>
                  <div
                    id={`faq-answer-${index}`}
                    className={`faq-answer${isOpen ? " show" : ""}`}
                  >
                    <p>{item.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
