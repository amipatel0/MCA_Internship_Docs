import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTicketAlt,
  FaCalendarCheck,
  FaMapMarkerAlt,
  FaClock,
  FaMoneyBillWave,
  FaCheckCircle,
  FaArrowRight,
  FaInbox,
  FaExclamationTriangle,
  FaUserCircle,
} from "react-icons/fa";
import { MdEventAvailable } from "react-icons/md";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import "./styles/CustomerDashboard.css";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [user, setUser] = useState({ name: "", role: "" });
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    past: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get(
          "http://localhost/event_backend/auth/get_user_info.php",
          {
            withCredentials: true,
          },
        );
        if (userRes.data.status) {
          setUser(userRes.data.user);
        } else {
          navigate("/login");
          return;
        }

        const regsRes = await axios.get(
          "http://localhost/event_backend/customer/get_registrations.php",
          {
            withCredentials: true,
          },
        );

        if (regsRes.data.status) {
          const regs = regsRes.data.data;
          setRegistrations(regs);

          const now = new Date();
          const upcoming = regs.filter(
            (r) => new Date(r.date_time) >= now,
          ).length;
          const past = regs.filter((r) => new Date(r.date_time) < now).length;

          setStats({ total: regs.length, upcoming, past });
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };

    fetchData();
  }, [navigate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  return (
    <motion.div
      className="customer-dashboard-premium py-5"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container">
        {/* Welcome Section */}
        <header className="dashboard-header-premium mb-5 pt-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="d-flex align-items-center gap-3 mb-3"
              >
                <div className="user-avatar-premium shadow-lg">
                  <FaUserCircle />
                </div>
                <div>
                  <span className="badge-premium-v2 text-uppercase">
                    MEMBER GATEWAY
                  </span>
                  <h1 className="text-white fw-black mb-0 display-4">
                    Welcome,{" "}
                    <span className="text-primary-gradient">
                      {user.name || "Explorer"}
                    </span>
                  </h1>
                </div>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-secondary lead mb-0 max-w-600"
              >
                Manage your event lifecycle, track reservations, and access your
                digital assets from your centralized command center.
              </motion.p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  variant="glass"
                  className="px-4 py-3"
                  onClick={() => navigate("/customer/tickets")}
                >
                  <FaTicketAlt className="me-2" /> Tickets
                </Button>
              </motion.div>
            </div>
          </div>
        </header>

        {/* Intelligence Grid */}
        <div className="row g-4 mb-5 pb-3">
          {[
            {
              label: "Total Events",
              value: stats.total,
              icon: <FaCalendarCheck />,
              color: "#6366f1",
              desc: "Total engagements",
            },
            {
              label: "Upcoming Events",
              value: stats.upcoming,
              icon: <FaCheckCircle />,
              color: "#10b981",
              desc: "Pending attendance",
            },
            {
              label: "Past Events",
              value: stats.past,
              icon: <FaClock />,
              color: "#f59e0b",
              desc: "Completed journeys",
            },
          ].map((stat, i) => (
            <div key={i} className="col-lg-4 col-md-6">
              <GlassCard
                delay={i * 0.1}
                className="p-4 border-white-5 relative overflow-hidden h-100 stat-card-v3"
              >
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div className="stat-label-v3">
                    <span className="text-white-50 small fw-black tracking-widest text-uppercase d-block mb-1">
                      {stat.label}
                    </span>
                    <h2 className="text-white fw-black mb-0 display-5">
                      {loading ? "..." : stat.value}
                    </h2>
                  </div>
                  <div
                    className="stat-icon-v3 shadow-premium"
                    style={{ "--accent": stat.color }}
                  >
                    {stat.icon}
                  </div>
                </div>
                <div className="stat-footer-v3 d-flex align-items-center gap-2">
                  <span
                    className="dot-mini"
                    style={{ background: stat.color }}
                  ></span>
                  <span className="text-secondary small opacity-50">
                    {stat.desc}
                  </span>
                </div>
              </GlassCard>
            </div>
          ))}
        </div>

        {/* Live Operations */}
        <section className="live-operations mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-white-5">
            <div className="d-flex align-items-center gap-3">
              <span className="section-indicator-dash" />
              <h3 className="text-white fw-black mb-0 fs-4 tracking-tight">
                LIVE EVENTS
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="px-3"
              onClick={() => navigate("/")}
            >
              EXPLORE NEW EVENTS <FaArrowRight className="ms-2 small" />
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <div className="row g-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="col-lg-4">
                    <Skeleton height="320px" borderRadius="24px" />
                  </div>
                ))}
              </div>
            ) : registrations.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="empty-operations py-5 text-center"
              >
                <div className="empty-node-icon mx-auto mb-4">
                  <FaInbox />
                </div>
                <h4 className="text-white fw-black mb-2">
                  No Active Events Detected
                </h4>
                <p className="text-secondary mb-4">
                  Initialize your first booking journey to see activity on this
                  grid.
                </p>
                <Button
                  variant="primary"
                  className="px-5 py-3"
                  onClick={() => navigate("/")}
                >
                  EXPLORE NEW EVENTS
                </Button>
              </motion.div>
            ) : (
              <div className="row g-4">
                {registrations.map((reg, idx) => (
                  <div key={reg.id} className="col-lg-4 col-md-6">
                    <RegistrationNode reg={reg} idx={idx} />
                  </div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </motion.div>
  );
}

function RegistrationNode({ reg, idx }) {
  const navigate = useNavigate();
  const status = reg.status?.toLowerCase();
  const isConfirmed = status === "confirmed";
  const isPaymentPending = status === "pending_payment";
  const isRejected = status === "rejected";
  const isPastEvent = new Date(reg.date_time) < new Date();

  return (
    <GlassCard
      delay={idx * 0.05}
      className="p-0 border-white-5 h-100 d-flex flex-column overflow-hidden node-card-premium"
    >
      <div className="p-4 flex-grow-1">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <NodeStatusChip status={reg.status} isPast={isPastEvent} />
          <div className="node-price-badge">
            {reg.event_type === "paid" ? `₹${reg.price}` : "ACCESS GRANTED"}
          </div>
        </div>

        <h4 className="text-white fw-bold mb-3 fs-5 lh-base truncate-2">
          {reg.event_name}
        </h4>

        <div className="node-metadata-stack gap-2 d-flex flex-column">
          <div className="metadata-item">
            <FaCalendarCheck className="text-primary-gradient-static me-2" />
            <span>
              {new Date(reg.date_time).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="metadata-item">
            <FaMapMarkerAlt className="text-primary-gradient-static me-2" />
            <span className="truncate-1">
              {reg.location}, {reg.city}
            </span>
          </div>
        </div>
      </div>

      <div className="node-footer p-4 pt-2">
        {isPastEvent ? (
          <Button variant="glass" className="w-100 opacity-50" disabled>
            EXPIRED EVENT
          </Button>
        ) : isConfirmed ? (
          <Button
            variant="primary"
            className="w-100 glow-primary"
            onClick={() => navigate(`/customer/ticket/${reg.id}`)}
          >
            <FaTicketAlt className="me-2" /> ACCESS EVENT
          </Button>
        ) : isPaymentPending ? (
          <Button
            variant="primary"
            className="w-100 shadow-orange"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
            onClick={() => navigate(`/customer/book/${reg.id}`)}
          >
            <FaMoneyBillWave className="me-2" /> FINALIZE PAYMENT
          </Button>
        ) : isRejected ? (
          <Button
            variant="outline"
            className="w-100 border-danger text-danger"
            disabled
          >
            <FaExclamationTriangle className="me-2" /> REJECTED EVENT
          </Button>
        ) : (
          <Button variant="glass" className="w-100 border-white-10" disabled>
            <div className="pulse-dot me-2"></div> SYNCING PROTOCOLS...
          </Button>
        )}
      </div>
    </GlassCard>
  );
}

function NodeStatusChip({ status, isPast }) {
  const s = status?.toLowerCase();
  let label = status?.toUpperCase();
  let color = "#6366f1";

  if (isPast) {
    label = "ARCHIVED";
    color = "#64748b";
  } else if (s === "confirmed") {
    label = "STABLE";
    color = "#10b981";
  } else if (s === "pending_payment") {
    label = "PAYMENT REQ";
    color = "#f2994a";
  } else if (s === "rejected" || s === "cancelled") {
    label = "FAILED";
    color = "#ef4444";
  }

  return (
    <div className="node-status-chip" style={{ "--color": color }}>
      <span className="status-dot"></span>
      {label}
    </div>
  );
}
