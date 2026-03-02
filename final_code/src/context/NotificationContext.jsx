import { createContext, useState, useContext, useCallback } from "react";
import NotificationModal from "../components/NotificationModal";

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    isOpen: false,
    message: "",
    type: "info",
  });

  const showNotification = useCallback((message, type = "info") => {
    setNotification({
      isOpen: true,
      message,
      type,
    });

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, isOpen: false }));
    }, 2000);
  }, []);

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      <NotificationModal
        isOpen={notification.isOpen}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
      />
    </NotificationContext.Provider>
  );
};
