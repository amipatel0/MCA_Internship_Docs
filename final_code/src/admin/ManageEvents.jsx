import { useEffect, useState } from "react";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { useNotification } from "../context/NotificationContext";
import {
  FaCalendarAlt,
  FaCheck,
  FaTimes,
  FaBan,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
} from "react-icons/fa";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import Skeleton, { TableSkeleton } from "../components/ui/Skeleton";
import "./ManageEvents.css";
import axios from "axios";

const ITEMS_PER_PAGE = 5;

export default function ManageEvents() {
  const { showNotification } = useNotification();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await API.get("admin/getAllEvents.php");
      if (res.data.status) setEvents(res.data.events);
    } catch (err) {
      showNotification("Failed to fetch events catalog", "error");
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  const updateStatus = async (id, status) => {
    const res = await API.post("admin/updateEventStatus.php", {
      event_id: id,
      status,
    });
    if (res.data.status) {
      showNotification(
        res.data.message || `Event ${status} successfully`,
        "success",
      );
      fetchEvents();
    } else {
      showNotification(
        res.data.message || "Failed to update event status",
        "error",
      );
    }
  };

  const totalPages = Math.ceil(events.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEvents = events.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  return (
    <motion.div
      className="manage-events-premium pb-5"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container py-4">
        {/* Node Header */}
        <header className="dashboard-header-premium mb-5 pt-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="d-flex align-items-center gap-3 mb-3"
              >
                <div className="events-icon-premium shadow-lg">
                  <FaCalendarAlt />
                </div>
                <div>
                  <span className="badge-premium-v2 text-uppercase">
                    EVENT AUDIT PROTOCOL
                  </span>
                  <h1 className="text-white fw-black mb-0 display-4">
                    Event <span className="text-primary-gradient">Catalog</span>
                  </h1>
                </div>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-secondary lead mb-0 max-w-600"
              >
                Moderate global event sequences. You have executive discretion
                to authorize new nodes, revoke existing ones, or decommission
                active sequences.
              </motion.p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="telemetry-pill">
                  <span className="dot-live" /> {events.length} ACTIVE EVENTS
                </div>
              </motion.div>
            </div>
          </div>
        </header>

        {/* Catalog Section */}
        <div className="catalog-grid-container mb-5">
          <div className="d-flex align-items-center gap-3 mb-4 pb-2 border-bottom border-white-5">
            <span className="section-indicator-dash" />
            <h3 className="text-white fw-black mb-0 fs-4 tracking-tight">
              EVENT REGISTRY
            </h3>
          </div>

          <GlassCard className="p-0 overflow-hidden border-white-5 shadow-2xl">
            <div className="table-responsive">
              {loading ? (
                <div className="p-4">
                  <TableSkeleton rows={ITEMS_PER_PAGE} />
                </div>
              ) : (
                <table className="table catalog-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th className="px-4 py-4">EVENT NAME</th>
                      <th className="px-4 py-4">EVENT DATE</th>
                      <th className="px-4 py-4">EVENT Category</th>
                      <th className="px-4 py-4 text-center">STATUS</th>
                      <th className="px-4 py-4 text-end">OPERATIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {paginatedEvents.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-5">
                            <div className="empty-catalog-state opacity-25">
                              <FaCalendarAlt size={64} className="mb-3" />
                              <h4 className="fw-black">
                                ZERO EVENT IN REGISTRY
                              </h4>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedEvents.map((e, idx) => (
                          <motion.tr
                            key={e.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.02 }}
                            className="catalog-row"
                          >
                            <td className="px-4 py-4">
                              <div className="text-white fw-bold truncate-1">
                                {e.title}
                              </div>
                              <div className="text-secondary fw-bold  font-monospace opacity-50">
                                EVENT_ID: {e.id}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-white fw-bold">
                                {e.date_time}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className="classification-tag">
                                {e.category_name}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <StatusBadge status={e.status} />
                            </td>
                            <td className="px-4 py-4 text-end">
                              <div className="d-flex justify-content-end gap-2">
                                <Button
                                  variant="glass"
                                  className="btn-operation text-success"
                                  onClick={() => updateStatus(e.id, "approved")}
                                  title="Approve Sequence"
                                >
                                  <FaCheck />
                                </Button>
                                <Button
                                  variant="glass"
                                  className="btn-operation text-danger"
                                  onClick={() => updateStatus(e.id, "rejected")}
                                  title="Reject Sequence"
                                >
                                  <FaTimes />
                                </Button>
                                <Button
                                  variant="glass"
                                  className="btn-operation text-secondary"
                                  onClick={() =>
                                    updateStatus(e.id, "cancelled")
                                  }
                                  title="Cancel Protocol"
                                >
                                  <FaBan />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Logic */}
            {!loading && events.length > ITEMS_PER_PAGE && (
              <div className="d-flex justify-content-between align-items-center p-4 border-top border-white-5 bg-white-2">
                <span className="text-secondary small font-monospace opacity-50">
                  Showing {startIndex + 1} -{" "}
                  {Math.min(startIndex + ITEMS_PER_PAGE, events.length)} of{" "}
                  {events.length} Events
                </span>
                <div className="d-flex gap-3">
                  <Button
                    variant="outline"
                    className="px-3"
                    disabled={currentPage === 1}
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      setCurrentPage((p) => p - 1);
                    }}
                  >
                    <FaChevronLeft />
                  </Button>
                  <Button
                    variant="outline"
                    className="px-3"
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      setCurrentPage((p) => p + 1);
                    }}
                  >
                    <FaChevronRight />
                  </Button>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    pending: "#f59e0b",
    approved: "#10b981",
    rejected: "#ef4444",
    cancelled: "#6b7280",
  };

  return (
    <div
      className="catalog-status-badge font-monospace"
      style={{ "--accent": colors[status] || "#6b7280" }}
    >
      {status.toUpperCase()}
    </div>
  );
}
