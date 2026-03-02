import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdPayments,
  MdLocationOn,
  MdReceiptLong,
  MdConfirmationNumber,
  MdArrowBack,
  MdSearch,
  MdFilterList,
} from "react-icons/md";
import { FaRupeeSign, FaInbox } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import { TableSkeleton } from "../components/ui/Skeleton";
import "./ManageBookings.css";

const ManageBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(
          "http://localhost/event_backend/admin/getAllBookings.php",
          {
            withCredentials: true,
          },
        );

        if (response.data.status) {
          setBookings(response.data.bookings);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError("Failed to fetch bookings from server");
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(
    (b) =>
      b.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.event_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.ticket_id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  if (error)
    return (
      <div className="container py-5 mt-5 text-center">
        <GlassCard className="border-danger mx-auto max-w-500">
          <h3 className="text-danger mb-3 fw-black">OPERATIONAL ERROR</h3>
          <p className="text-secondary opacity-75">{error}</p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            RETRY PROTOCOL
          </Button>
        </GlassCard>
      </div>
    );

  return (
    <motion.div
      className="manage-bookings-premium pb-5"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container py-4">
        {/* Registry Header */}
        <header className="dashboard-header-premium mb-5 pt-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="d-flex align-items-center gap-3 mb-3"
              >
                <div className="registry-icon-premium shadow-lg">
                  <MdReceiptLong />
                </div>
                <div>
                  <span className="badge-premium-v2 text-uppercase">
                    FINANCIAL LEDGER
                  </span>
                  <h1 className="text-white fw-black mb-0 display-4">
                    Booking{" "}
                    <span className="text-primary-gradient">Registry</span>
                  </h1>
                </div>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-secondary lead mb-0 max-w-600"
              >
                Monitor global transaction flow, audit attendee registrations,
                and analyze volumetric data across all active system nodes.
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
                  onClick={() => navigate(-1)}
                >
                  <MdArrowBack className="me-2" /> EXIT TERMINAL
                </Button>
              </motion.div>
            </div>
          </div>
        </header>

        {/* Telemetry Stats */}
        {!loading && (
          <div className="row g-4 mb-5">
            {[
              {
                label: "TOTAL VOLUME",
                value: `₹${bookings.reduce((acc, b) => acc + b.amount / 100, 0).toLocaleString()}`,
                icon: <MdPayments />,
                color: "#6366f1",
              },
              {
                label: "NODE ENGAGEMENTS",
                value: bookings.length,
                icon: <MdConfirmationNumber />,
                color: "#10b981",
              },
              {
                label: "PENDING SYNC",
                value: bookings.filter(
                  (b) => b.registration_status !== "confirmed",
                ).length,
                icon: <MdReceiptLong />,
                color: "#f59e0b",
              },
            ].map((stat, i) => (
              <div key={i} className="col-lg-4">
                <GlassCard
                  delay={i * 0.1}
                  className="p-4 border-white-5 relative overflow-hidden h-100 stat-card-v3"
                >
                  <div className="d-flex align-items-center gap-4 relative z-1">
                    <div
                      className="stat-icon-v3 shadow-premium"
                      style={{
                        "--accent": stat.color,
                        background: `${stat.color}15`,
                        color: stat.color,
                      }}
                    >
                      {stat.icon}
                    </div>
                    <div>
                      <h6 className="text-secondary text-uppercase small fw-black mb-1 opacity-50 tracking-widest">
                        {stat.label}
                      </h6>
                      <h2 className="text-white fw-black mb-0 display-6">
                        {stat.value}
                      </h2>
                    </div>
                  </div>
                  <div
                    className="glow-corner"
                    style={{
                      background: `radial-gradient(circle at bottom right, ${stat.color}08, transparent 70%)`,
                    }}
                  />
                </GlassCard>
              </div>
            ))}
          </div>
        )}

        {/* Data Grid Section */}
        <div className="registry-grid-container mb-5">
          <div className="d-flex align-items-center gap-3 mb-4 pb-2 border-bottom border-white-5">
            <span className="section-indicator-dash" />
            <h3 className="text-white fw-black mb-0 fs-4 tracking-tight">
              ACTIVE DATA SETS
            </h3>
          </div>

          <GlassCard className="p-0 overflow-hidden border-white-5 shadow-2xl">
            {/* Operations Bar */}
            <div className="p-4 border-bottom border-white-5 d-flex flex-column flex-md-row justify-content-between gap-3 bg-white-2">
              <div className="search-box-premium flex-grow-1">
                <MdSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="QUERY ATTENDEE, EVENT OR TOKEN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="font-monospace"
                />
              </div>
              <Button
                variant="outline"
                className="d-flex align-items-center border-white-10"
              >
                <MdFilterList className="me-2" /> FILTER LOGS
              </Button>
            </div>

            <div className="table-responsive">
              {loading ? (
                <div className="p-4">
                  <TableSkeleton rows={8} />
                </div>
              ) : (
                <table className="table registry-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th className="px-4 py-4">USER</th>
                      <th className="px-4 py-4">EVENT</th>
                      <th className="px-4 py-4 text-center">TICKET ID</th>
                      <th className="px-4 py-4">AMOUNT</th>
                      <th className="px-4 py-4 text-end">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-5">
                            <div className="empty-registry-state opacity-25">
                              <FaInbox size={64} className="mb-3" />
                              <h4 className="fw-black">
                                NO BOOKINGS MATCHING QUERY
                              </h4>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((b, idx) => (
                          <motion.tr
                            key={b.booking_id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.02 }}
                            className="registry-row"
                          >
                            <td className="px-4 py-4">
                              <div className="d-flex align-items-center">
                                <div className="entity-avatar me-3 shadow-glow-sm">
                                  {b.user_name.charAt(0)}
                                </div>
                                <div className="entity-info">
                                  <div className="text-dark fw-bold lh-1 mb-1">
                                    {b.user_name}
                                  </div>
                                  <div className="text-secondary small font-monospace opacity-50">
                                    {b.user_email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-primary-gradient-static fw-black mb-1 truncate-1 fs-6">
                                {b.event_title}
                              </div>
                              <div className="text-secondary small d-flex align-items-center opacity-75">
                                <MdLocationOn className="me-1" />{" "}
                                {b.event_location}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="token-tag font-monospace">
                                {b.ticket_id}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-dark fw-black d-flex align-items-center">
                                <FaRupeeSign className="me-1 small opacity-50" />
                                {(b.amount / 100).toLocaleString("en-IN")}
                              </div>
                              <div className="text-secondary small font-monospace opacity-50">
                                BOOKING_ID: {b.booking_id}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-end">
                              <div className="d-flex flex-column gap-2 align-items-end">
                                <RegistryStatusChip
                                  status={b.payment_status}
                                  type="PAYMENT"
                                />
                                <RegistryStatusChip
                                  status={b.registration_status}
                                  type="REGISTRATION"
                                />
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
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
};

const RegistryStatusChip = ({ status, type }) => {
  const s = status?.toLowerCase();
  const isPositive = ["paid", "confirmed", "success"].includes(s);
  const isNeutral = ["pending", "processing"].includes(s);

  let color = "#f59e0b";
  if (isPositive) color = "#10b981";
  else if (s === "failed" || s === "rejected" || s === "cancelled")
    color = "#ef4444";

  return (
    <div
      className="registry-status-chip font-monospace"
      style={{ "--accent": color }}
    >
      <span className="opacity-50 me-2">{type}:</span>
      {status?.toUpperCase()}
    </div>
  );
};

export default ManageBookings;
