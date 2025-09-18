import React from "react";

function isValidChild(child) {
  return (
    typeof child === "string" ||
    typeof child === "number" ||
    React.isValidElement(child)
  );
}

const DebugWrapper = ({ children }) => {
  React.Children.forEach(children, (child) => {
    if (!isValidChild(child) && child !== null && child !== undefined) {
      console.error("🚨 Invalid React child detected:", {
        child,
        type: typeof child,
        parent: children?.type?.name || "Unknown",
        props: children?.props || {},
      });
    }
  });

  return <>{children}</>;
};

export default DebugWrapper;
