import React from "react";
import { motion } from "framer-motion";

const GlassCard = ({
  children,
  className = "",
  animate = true,
  hoverEffect = true,
  delay = 0,
  ...props
}) => {
  const CardContent = (
    <div
      className={`premium-glass p-4 ${hoverEffect ? "card-3d" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );

  if (!animate) return CardContent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay }}
    >
      {CardContent}
    </motion.div>
  );
};

export default GlassCard;
