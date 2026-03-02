import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Input = ({
  label,
  error,
  icon: Icon,
  type = "text",
  className = "",
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`mb-4 w-100 ${className}`}>
      {label && (
        <label className="form-label text-white-50 small fw-medium mb-2 ms-1">
          {label}
        </label>
      )}
      <div className="position-relative">
        {Icon && (
          <div className="position-absolute top-50 start-0 translate-middle-y ms-3 text-white-50">
            <Icon size={18} />
          </div>
        )}
        <input
          type={type}
          className={`form-control bg-white-5 shadow-none border-0 text-white rounded-4 px-4 py-3 ${Icon ? "ps-5" : ""} ${error ? "border-danger" : ""}`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            transition: "all 0.3s ease",
          }}
          {...props}
        />
        <motion.div
          initial={false}
          animate={{
            scaleX: isFocused ? 1 : 0,
            opacity: isFocused ? 1 : 0,
          }}
          className="position-absolute bottom-0 start-0 w-100"
          style={{
            height: "2px",
            background: "var(--primary-gradient)",
            transformOrigin: "left",
          }}
        />
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-danger small mt-2 ms-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Input;
