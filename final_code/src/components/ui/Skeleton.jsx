import React from "react";
import { motion } from "framer-motion";

const Skeleton = ({
  className,
  width,
  height,
  borderRadius = "var(--radius-md)",
}) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width || "100%",
        height: height || "20px",
        borderRadius: borderRadius,
      }}
    />
  );
};

export const CardSkeleton = () => (
  <div className="premium-glass p-4 h-full">
    <Skeleton height="200px" className="mb-4" />
    <Skeleton width="60%" className="mb-2" />
    <Skeleton width="40%" className="mb-4" />
    <div className="d-flex justify-content-between">
      <Skeleton width="30%" />
      <Skeleton width="30%" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="w-100">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="d-flex gap-3 mb-3">
        <Skeleton height="40px" />
      </div>
    ))}
  </div>
);

export default Skeleton;
