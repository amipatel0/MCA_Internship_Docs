import React from "react";
import { motion } from "framer-motion";

const Button = ({
  children,
  variant = "primary",
  className = "",
  onClick,
  type = "button",
  disabled = false,
  isLoading = false,
  icon: Icon,
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case "primary":
        return "btn-premium";
      case "glass":
        return "btn-glass";
      case "danger":
        return "btn-premium bg-danger shadow-danger";
      case "outline":
        return "btn-outline-light border-radius-lg";
      default:
        return "btn-premium";
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${getVariantClass()} ${className} ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={disabled || isLoading ? undefined : onClick}
      type={type}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span
          className="spinner-border spinner-border-sm me-2"
          role="status"
          aria-hidden="true"
        ></span>
      ) : (
        Icon && <Icon size={18} className="me-2" />
      )}
      {children}
    </motion.button>
  );
};

export default Button;
