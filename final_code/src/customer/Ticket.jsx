import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTicketAlt,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaDownload,
  FaSync,
  FaChevronLeft,
  FaUndo,
  FaHashtag,
} from "react-icons/fa";
import { MdOutlineConfirmationNumber, MdSecurity } from "react-icons/md";
import { useNotification } from "../context/NotificationContext";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import Skeleton, { TableSkeleton } from "../components/ui/Skeleton";
import "./styles/Ticket.css";

export default function Tickets() {
  const { showNotification } = useNotification();
  const { reg_id } = useParams();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const loadRegistry = async () => {
    setLoading(true);
    const url = reg_id
      ? `http://localhost/event_backend/customer/get_ticket.php?reg_id=${reg_id}`
      : `http://localhost/event_backend/customer/get_ticket.php?type=${filter}`;

    try {
      const res = await axios.get(url, { withCredentials: true });
      if (res.data.status) {
        if (reg_id) {
          setTicket(res.data.ticket);
        } else {
          setTickets(res.data.tickets);
        }
      } else {
        setTickets([]);
        setTicket(null);
      }
    } catch (err) {
      showNotification("Registry synchronization failure", "error");
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    loadRegistry();
  }, [filter, reg_id]);

  const handleRefund = async (booking_id) => {
    // We'll use a simple confirm for now, as useNotification doesn't return value in this version
    if (!window.confirm("Initialize refund protocol for this transaction?"))
      return;

    const formData = new FormData();
    formData.append("booking_id", booking_id);

    try {
      const res = await axios.post(
        "http://localhost/event_backend/customer/refund_payment.php",
        formData,
        { withCredentials: true },
      );

      if (res.data.status) {
        showNotification("Refund protocol executed successfully", "success");
        loadRegistry();
      } else {
        showNotification(res.data.message || "Refund protocol denied", "error");
      }
    } catch {
      showNotification("Communication failure during refund", "error");
    }
  };

  const getTicketStatus = (date_time) => {
    const now = new Date();
    const eventDate = new Date(date_time);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    if (eventDate < todayStart) return "PAST";
    if (eventDate >= todayStart && eventDate <= todayEnd) return "TODAY";
    return "UPCOMING";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  if (loading) {
    return (
      <div className="ticket-page-premium py-5">
        <div className="container">
          <TableSkeleton rows={5} />
        </div>
      </div>
    );
  }

  const renderTicketNode = (t, idx) => {
    const status = getTicketStatus(t.date_time);
    const isCancelled = t.event_status === "cancelled";
    const allowRefund =
      t.payment_status === "paid" &&
      (isCancelled || t.registration_status === "cancelled_by_admin");
    const isPast = status === "PAST";

    return (
      <motion.div
        key={t.reg_id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        className="col-12 mb-4"
      >
        <GlassCard className="p-0 overflow-hidden admission-node border-white-5 shadow-2xl">
          <div className="row g-0">
            {/* Security Stub */}
            <div className="col-md-3 security-stub">
              <div className="d-flex flex-column justify-content-between h-100 p-4 text-center">
                <div className="stub-id-pill mb-3">
                  <FaHashtag className="opacity-50" /> {t.ticket_id}
                </div>
                <div className="auth-level mb-3">
                  <span className="text-secondary small fw-bold tracking-widest text-uppercase">
                    AUTH_LEVEL
                  </span>
                  <div className="text-white fw-black fs-4">
                    {t.event_type.toUpperCase()}
                  </div>
                </div>
                <div className="security-qr-mock mx-auto py-2">
                  <MdSecurity size={64} className="opacity-25" />
                </div>
              </div>
            </div>

            {/* Content Logic */}
            <div className="col-md-9 content-logic p-4 p-md-5 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <h2 className="text-white fw-black display-6 mb-1 tracking-tighter">
                      {t.title}
                    </h2>
                    <div
                      className={`status-tag ${status.toLowerCase()} ${isCancelled ? "cancelled" : ""}`}
                    >
                      {isCancelled ? "CANCELLED" : status}
                    </div>
                  </div>
                  <div className="node-id shadow-glow-sm">REG_{t.reg_id}</div>
                </div>

                <div className="row g-4 mb-5">
                  <div className="col-sm-6">
                    <div className="meta-label">DATE</div>
                    <div className="meta-value d-flex align-items-center gap-2">
                      <FaCalendarAlt className="text-primary opacity-50" />
                      <span>
                        {new Date(t.date_time).toLocaleDateString(undefined, {
                          weekday: "short",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="meta-label">LOCATION</div>
                    <div className="meta-value d-flex align-items-center gap-2">
                      <FaMapMarkerAlt className="text-danger opacity-50" />
                      <span>
                        {t.location}, {t.city}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-3 align-items-center border-top border-white-5 pt-4 mt-auto">
                {isPast && !isCancelled ? (
                  <div className="text-secondary small fw-bold font-monospace opacity-50">
                    SYSTEM ACCESS EXPIRED
                  </div>
                ) : (
                  <>
                    <Button
                      variant="primary"
                      onClick={() =>
                        window.open(
                          `http://localhost/event_backend/customer/downloadTicket.php?reg_id=${t.reg_id}`,
                          "_blank",
                        )
                      }
                      className="px-4"
                    >
                      <FaDownload className="me-2" /> DOWNLOAD TICKET
                    </Button>
                    {allowRefund && (
                      <Button
                        variant="outline"
                        onClick={() => handleRefund(t.booking_id)}
                        className="px-4 text-danger border-danger-low"
                      >
                        <FaUndo className="me-2" /> REFUND
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    );
  };

  const sortedTickets = [...tickets].sort((a, b) => {
    const order = { UPCOMING: 1, TODAY: 2, PAST: 3 };
    const statusA = getTicketStatus(a.date_time);
    const statusB = getTicketStatus(b.date_time);
    if (order[statusA] !== order[statusB])
      return order[statusA] - order[statusB];
    return new Date(a.date_time) - new Date(b.date_time);
  });

  return (
    <motion.div
      className="ticket-page-premium pb-5"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container py-4">
        <header className="dashboard-header-premium mb-5 pt-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <motion.div className="d-flex align-items-center gap-3 mb-3">
                <div className="admission-icon-premium shadow-lg">
                  <FaTicketAlt />
                </div>
                <div>
                  <span className="badge-premium-v2 text-uppercase">
                    SECURE REGISTRY
                  </span>
                  <h1 className="text-white fw-black mb-0 display-4">
                    Admission{" "}
                    <span className="text-primary-gradient">Nodes</span>
                  </h1>
                </div>
              </motion.div>
              <p className="text-secondary lead mb-0 max-w-600">
                Access your authorized event permits and system credentials.
                Validate your admission tokens at the physical sequence
                locations.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <div className="d-flex flex-column gap-3 align-items-lg-end">
                <div className="telemetry-pill">
                  <span className="dot-live" /> {reg_id ? 1 : tickets.length}{" "}
                  ACTIVE PERMITS
                </div>
                <Button
                  variant="glass"
                  onClick={loadRegistry}
                  className="d-flex align-items-center gap-2"
                >
                  <FaSync className={loading ? "spin" : ""} /> REFRESH REGISTRY
                </Button>
              </div>
            </div>
          </div>
        </header>

        {reg_id ? (
          <div className="row justify-content-center">
            <div className="col-xl-9">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="mb-4 d-flex align-items-center gap-2"
              >
                <FaChevronLeft /> RETURN TO REGISTRY
              </Button>
              {renderTicketNode(ticket, 0)}
            </div>
          </div>
        ) : tickets.length === 0 ? (
          <motion.div className="empty-registry-state text-center py-5">
            <MdOutlineConfirmationNumber
              size={80}
              className="text-secondary mb-4 opacity-25"
            />
            <h3 className="text-white fw-black opacity-50 tracking-widest">
              ZERO PERMITS DETECTED
            </h3>
            <Button
              variant="primary"
              onClick={() => navigate("/")}
              className="mt-4"
            >
              ACQUIRE TOKENS
            </Button>
          </motion.div>
        ) : (
          <div className="row g-4 justify-content-center">
            <div className="col-xl-9">
              {sortedTickets.map((t, idx) => renderTicketNode(t, idx))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
