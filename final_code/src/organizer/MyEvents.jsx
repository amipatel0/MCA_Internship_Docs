import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaRupeeSign,
  FaFileAlt,
  FaSync,
  FaEdit,
  FaTrash,
  FaChevronRight,
} from "react-icons/fa";
import { MdOutlineEventBusy, MdOutlineAnalytics } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import { useNotification } from "../context/NotificationContext";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import Skeleton, { CardSkeleton } from "../components/ui/Skeleton";
import "./MyEvents.css";

export default function MyEvents() {
  const { showNotification } = useNotification();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await API.get("organizer/myevents.php");
      if (res.data.status) {
        setEvents(res.data.events);
      } else {
        setEvents([]);
      }
    } catch (err) {
      showNotification("Failed to synchronize with event registry", "error");
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Initialize terminal termination for this event sequence?",
      )
    )
      return;

    try {
      const res = await API.post(
        "organizer/deleteEvent.php",
        { event_id: id },
        { headers: { "Content-Type": "application/json" } },
      );

      if (res.data?.status) {
        showNotification("Event node purged successfully", "success");
        setEvents((prev) => prev.filter((e) => e.id !== id));
      } else {
        showNotification(res.data?.message || "Purge protocol denied", "error");
      }
    } catch (err) {
      showNotification("Terminal failure during deletion", "error");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const getImageUrl = (poster) => {
    if (!poster) return "/placeholder-image.jpg";
    if (poster.startsWith("http")) return poster;
    return `http://localhost/event_backend/uploads/events/${poster}`;
  };

  return (
    <motion.div
      className="my-events-premium pb-5"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container py-4">
        {/* Operations Header */}
        <header className="dashboard-header-premium mb-5 pt-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="d-flex align-items-center gap-3 mb-3"
              >
                <div className="operations-icon-premium shadow-lg">
                  <FaFileAlt />
                </div>
                <div>
                  <span className="badge-premium-v2 text-uppercase">
                    MISSION READY
                  </span>
                  <h1 className="text-white fw-black mb-0 display-4">
                    Operations{" "}
                    <span className="text-primary-gradient">Log</span>
                  </h1>
                </div>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-secondary lead mb-0 max-w-600"
              >
                Manage and track all your active deployments. Monitor node
                status, modify sequence data, or decommission event protocols.
              </motion.p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="d-flex flex-column gap-3 align-items-lg-end"
              >
                <div className="telemetry-pill">
                  <span className="dot-live" /> {events.length} ACTIVE
                  DEPLOYMENTS
                </div>
                <div className="d-flex gap-2">
                  <Button
                    variant="glass"
                    onClick={fetchEvents}
                    className="btn-sync"
                  >
                    <FaSync className={loading ? "spin" : ""} />
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => navigate("/organizer/create-event")}
                  >
                    NEW SEQUENCE
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="row g-4">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="col-lg-4 col-md-6">
                  <CardSkeleton />
                </div>
              ))}
          </div>
        ) : events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="empty-log-state text-center py-5"
          >
            <MdOutlineEventBusy
              size={80}
              className="text-secondary mb-4 opacity-25"
            />
            <h3 className="text-white fw-black opacity-50 tracking-widest">
              ZERO ACTIVE DEPLOYMENTS
            </h3>
            <Button
              variant="primary"
              onClick={() => navigate("/organizer/create-event")}
              className="mt-4 px-5"
            >
              INITIALIZE FIRST SEQUENCE
            </Button>
          </motion.div>
        ) : (
          <div className="row g-4">
            <AnimatePresence>
              {events.map((event, idx) => (
                <motion.div
                  key={event.id}
                  className="col-lg-4 col-md-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <GlassCard className="p-0 overflow-hidden h-100 border-white-5 operation-node-card">
                    <div className="node-poster-wrapper">
                      <img
                        src={getImageUrl(event.poster)}
                        alt={event.title}
                        className="node-poster"
                      />
                      <div className="node-poster-overlay" />
                      <div className="node-category-tag">
                        {event.category_name}
                      </div>
                      <div className={`node-status-badge ${event.status}`}>
                        {event.status.toUpperCase()}
                      </div>
                    </div>

                    <div className="node-content p-4 d-flex flex-column h-100">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h3 className="text-white fw-black fs-4 tracking-tighter mb-0 truncate-2">
                          {event.title}
                        </h3>
                        <div className="node-id shadow-glow-sm">
                          EVENT_{event.id}
                        </div>
                      </div>

                      <p className="text-secondary small font-monospace opacity-50 mb-4 line-clamp-2">
                        {event.description}
                      </p>

                      <div className="node-intel-grid mb-4">
                        <div className="intel-row">
                          <FaMapMarkerAlt className="text-danger opacity-50" />
                          <span className="text-white-50 small truncate-1">
                            {event.location}
                          </span>
                        </div>
                        <div className="intel-row">
                          <FaCalendarAlt className="text-primary opacity-50" />
                          <span className="text-white-50 small">
                            {new Date(event.date_time).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="intel-row">
                          <FaRupeeSign className="text-warning opacity-50" />
                          <span className="text-white-50 small">
                            {event.event_type === "paid" ? event.price : "FREE"}
                          </span>
                        </div>
                      </div>

                      <div className="d-flex gap-2 mt-auto pt-3 border-top border-white-5">
                        {event.status !== "approved" &&
                        event.status !== "cancelled" ? (
                          <>
                            <Button
                              variant="glass"
                              className="flex-fill btn-node-action"
                              onClick={() =>
                                navigate(`/organizer/update-event/${event.id}`)
                              }
                            >
                              <FaEdit className="me-2" /> MODIFY
                            </Button>
                            <Button
                              variant="glass"
                              className="btn-node-action text-danger"
                              onClick={() => handleDelete(event.id)}
                            >
                              <FaTrash />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="glass"
                            className="w-100 opacity-50 cursor-not-allowed border-white-5"
                          >
                            LOCKED BY SYSTEM ({event.status.toUpperCase()})
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="node-accent-bar" />
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
