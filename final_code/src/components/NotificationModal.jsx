import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./NotificationModal.css";

const NotificationModal = ({ isOpen, message, type, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="notification-icon success" />;
      case "error":
        return <FaTimesCircle className="notification-icon error" />;
      case "warning":
        return <FaExclamationTriangle className="notification-icon warning" />;
      default:
        return <FaInfoCircle className="notification-icon info" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="notification-overlay">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotateX: -30, y: 50 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotateX: 30, y: -50 }}
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
            className={`notification-modal glass-card-3d ${type}`}
          >
            <div className="notification-content">
              <div className="icon-wrapper-3d">{getIcon()}</div>
              <div className="notification-text-wrapper">
                <h3 className="notification-title">
                  {type === "success"
                    ? "Success!"
                    : type === "error"
                      ? "Error!"
                      : "Notice"}
                </h3>
                <p className="notification-message">{message}</p>
              </div>
              <button className="notification-close-btn" onClick={onClose}>
                Dismiss
              </button>
            </div>
            <div className="notification-glow"></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NotificationModal;
