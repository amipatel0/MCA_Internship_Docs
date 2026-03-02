import { useEffect, useState } from "react";
import axios from "axios";
import { FaBell } from "react-icons/fa";

function BellNotification() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchAndTriggerNotifications = async () => {
    try {
      // Trigger upcoming event notifications
      // await axios.get(
      //   "http://localhost/event_backend/notifications/notify_upcoming_event.php",
      //   { withCredentials: true }
      // );

      // Fetch all notifications
      const res = await axios.get(
        "http://localhost/event_backend/notifications/getNotifications.php",
        { withCredentials: true },
      );

      if (res.data.status) {
        setNotifications(res.data.notifications || []);
        setUnread(res.data.unread_count || 0);
      }
    } catch (error) {
      console.error("Notification error:", error);
    }
  };

  useEffect(() => {
    fetchAndTriggerNotifications();

    const interval = setInterval(fetchAndTriggerNotifications, 5000); // repeat every 5s
    return () => clearInterval(interval);
  }, []);

  const handleOpen = async () => {
    setOpen(!open);

    if (unread > 0) {
      await axios.post(
        "http://localhost/event_backend/notifications/mark_read.php",
        {},
        { withCredentials: true },
      );
      fetchAndTriggerNotifications();
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <FaBell
        size={20}
        onClick={handleOpen}
        className="nav-icon-bell"
        style={{ cursor: "pointer", color: "var(--text-main)" }}
      />
      {unread > 0 && (
        <span
          style={{
            position: "absolute",
            top: "-5px",
            right: "-8px",
            background: "red",
            color: "white",
            borderRadius: "50%",
            padding: "3px 7px",
            fontSize: "11px",
            fontWeight: "bold",
          }}
        >
          {unread}
        </span>
      )}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "35px",
            right: "0",
            width: "320px",
            background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            maxHeight: "350px",
            overflowY: "auto",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            zIndex: 9999,
          }}
        >
          {notifications.length === 0 ? (
            <p style={{ padding: "15px", textAlign: "center", color: "rgba(255, 255, 255, 0.5)" }}>
              No Notifications
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                style={{ padding: "12px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}
              >
                <strong style={{ color: "#fff" }}>{n.title}</strong>
                <p style={{ fontSize: "13px", marginTop: "5px", color: "rgba(255, 255, 255, 0.7)" }}>
                  {n.message}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default BellNotification;
