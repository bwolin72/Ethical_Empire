import React from "react";
import { useNavigate } from "react-router-dom";
import "./FloatingSocialHubButton.css"; // separate CSS file

const FloatingSocialHubButton = () => {
  const navigate = useNavigate();

  return (
    <button
      className="floating-social-button"
      onClick={() => navigate("/social")}
      title="Open Social Hub"
    >
      🟢 {/* Or use an icon library like react-icons */}
    </button>
  );
};

export default FloatingSocialHubButton;
