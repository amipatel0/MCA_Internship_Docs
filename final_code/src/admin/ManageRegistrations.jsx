import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNotification } from "../context/NotificationContext";
import {
  FaUserShield,
  FaCheck,
  FaTimes,
  FaCalendarAlt,
  FaTicketAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { MdOutlineVerifiedUser } from "react-icons/md";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import Skeleton, { TableSkeleton } from "../components/ui/Skeleton";
import "./ManageRegistrations.css";

const ITEMS_PER_PAGE = 5;

export default function ManageRegistrations() {
  const { showNotification } = useNotification();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = async () => {
    try {
      const res = await axios.get(
        "http://localhost/event_backend/admin/getPendingRegistrations.php",
        {
          withCredentials: true,
        },
      );
      setData(res.data);
    } catch (err) {
      showNotification("Failed to fetch registration queue", "error");
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateStatus = (id, status) => {
    axios
      .post(
        "http://localhost/event_backend/admin/updateRegistrationsStatus.php",
        {
          registration_id: id,
          status: status,
        },
        { withCredentials: true },
      )
      .then((res) => {
        if (res.data.status === false) {
          showNotification(
            res.data.message || "Failed to update authorization",
            "error",
          );
        } else {
          showNotification(
            `Identity authorized: ${status.toUpperCase()}`,
            "success",
          );
          loadData();
        }
      })
      .catch(() => showNotification("Protocol failure during update", "error"));
  };

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  return (
    <motion.div
      className="manage-registrations-premium pb-5"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container py-4">
        {/* Protocol Header */}
        <header className="dashboard-header-premium mb-5 pt-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="d-flex align-items-center gap-3 mb-3"
              >
                <div className="registrations-icon-premium shadow-lg">
                  <FaUserShield />
                </div>
                <div>
                  <span className="badge-premium-v2 text-uppercase">
                    ACCESS PROTOCOL
                  </span>
                  <h1 className="text-white fw-black mb-0 display-4">
                    Registration{" "}
                    <span className="text-primary-gradient">Queue</span>
                  </h1>
                </div>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-secondary lead mb-0 max-w-600"
              >
                Verify attendee credentials for upcoming event sequences. You
                must validate each entity token before authorizing system
                access.
              </motion.p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="telemetry-pill">
                  <span className="dot-live" /> {data.length} PENDING
                  AUTHORIZATIONS
                </div>
              </motion.div>
            </div>
          </div>
        </header>

        {/* Authorization Registry */}
        <div className="registration-grid-container mb-5">
          <div className="d-flex align-items-center gap-3 mb-4 pb-2 border-bottom border-white-5">
            <span className="section-indicator-dash" />
            <h3 className="text-white fw-black mb-0 fs-4 tracking-tight">
              IDENTITY PAYLOADS
            </h3>
          </div>

          <GlassCard className="p-0 overflow-hidden border-white-5 shadow-2xl">
            <div className="table-responsive">
              {loading ? (
                <div className="p-4">
                  <TableSkeleton rows={ITEMS_PER_PAGE} />
                </div>
              ) : (
                <table className="table registrations-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th className="px-4 py-4">NAME</th>
                      <th className="px-4 py-4">EVENT TITLE</th>
                      <th className="px-4 py-4">DATE</th>
                      <th className="px-4 py-4">TICKET</th>
                      <th className="px-4 py-4 text-end">DECISION</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {paginatedData.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-5">
                            <div className="empty-state opacity-25">
                              <MdOutlineVerifiedUser
                                size={64}
                                className="mb-3"
                              />
                              <h4 className="fw-black">
                                ZERO PENDING REGISTRATIONS
                              </h4>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedData.map((r, idx) => (
                          <motion.tr
                            key={r.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.02 }}
                            className="registrations-row"
                          >
                            <td className="px-4 py-4">
                              <div className="d-flex align-items-center">
                                <div className="entity-avatar-sm me-3 shadow-glow-sm">
                                  {r.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="text-white fw-bold mb-1">
                                    {r.name}
                                  </div>
                                  <div className="text-secondary fw-bold font-monospace opacity-50">
                                    {r.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="sequence-tag truncate-1">
                                {r.title}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-secondary small font-monospace d-flex align-items-center gap-2">
                                <FaCalendarAlt className="opacity-50" />{" "}
                                {r.date_time}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="token-id-badge font-monospace">
                                <FaTicketAlt className="me-2 opacity-50" />{" "}
                                {r.ticket_id}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-end">
                              <div className="d-flex justify-content-end gap-2">
                                <Button
                                  variant="glass"
                                  className="btn-operation text-success"
                                  onClick={() =>
                                    updateStatus(r.id, "confirmed")
                                  }
                                  title="Authorize Entry"
                                >
                                  <FaCheck />
                                </Button>
                                <Button
                                  variant="glass"
                                  className="btn-operation text-danger"
                                  onClick={() => updateStatus(r.id, "rejected")}
                                  title="Revoke Permission"
                                >
                                  <FaTimes />
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
            {!loading && data.length > ITEMS_PER_PAGE && (
              <div className="d-flex justify-content-between align-items-center p-4 border-top border-white-5 bg-white-2">
                <span className="text-secondary small font-monospace opacity-50">
                  Showing {startIndex + 1} -{" "}
                  {Math.min(startIndex + ITEMS_PER_PAGE, data.length)} of{" "}
                  {data.length} Payloads
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
