import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFile,
  FaUserAlt,
  FaCalendarAlt,
  FaRegistered,
  FaChevronRight,
  FaTerminal,
  FaLink,
} from "react-icons/fa";
import { MdReviews, MdDashboard, MdSettings } from "react-icons/md";
import { TbBrandBooking } from "react-icons/tb";
import { FiMessageSquare, FiTrendingUp } from "react-icons/fi";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", role: "" });
  const [stats, setStats] = useState({
    events: 0,
    users: 0,
    registrations: 0,
    bookings: 0,
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

        const [eventsRes, usersRes, regsRes, bookingsRes] = await Promise.all([
          axios.get("http://localhost/event_backend/admin/getAllEvents.php", {
            withCredentials: true,
          }),
          axios.get("http://localhost/event_backend/admin/getUsers.php", {
            withCredentials: true,
          }),
          axios.get(
            "http://localhost/event_backend/admin/getAllRegistrations.php",
            { withCredentials: true },
          ),
          axios.get("http://localhost/event_backend/admin/getAllBookings.php", {
            withCredentials: true,
          }),
        ]);

        setStats({
          events: eventsRes.data.events?.length || 0,
          users: usersRes.data.users?.length || 0,
          registrations: regsRes.data.registrations?.length || 0,
          bookings: bookingsRes.data.bookings?.length || 0,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
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
      className="admin-dashboard-premium py-5"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container">
        {/* Core Header */}
        <header className="dashboard-header-premium mb-5 pt-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="d-flex align-items-center gap-3 mb-3"
              >
                <div>
                  <span className="badge-premium-v2 text-uppercase">
                    SYSTEM KERNEL ACCESS
                  </span>
                  <h1 className="text-white fw-black mb-0 display-4">
                    <span className="text-primary-gradient">
                      {user.name || "Administrator"}
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
                Global platform overview. You have executive authority over all
                system nodes, user permissions, and financial telemetry.
              </motion.p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                {/* <Button
                  variant="glass"
                  className="px-4 py-3"
                  onClick={() => navigate("/")}
                >
                  <FaLink className="me-2" /> PORTAL FRONTEND
                </Button> */}
              </motion.div>
            </div>
          </div>
        </header>

        {/* Global Telemetry Grid */}
        <div className="row g-4 mb-5 pb-3">
          {[
            {
              title: "EVENTS",
              value: stats.events,
              icon: <FaCalendarAlt />,
              color: "#6366f1",
              sub: "Live Events",
            },
            {
              title: "USERS",
              value: stats.users,
              icon: <FaUserAlt />,
              color: "#ec4899",
              sub: "Total Users",
            },
            {
              title: "REGISTRATIONS",
              value: stats.registrations,
              icon: <FaRegistered />,
              color: "#10b981",
              sub: "Total Registrations",
            },
            {
              title: "BOOKINGS",
              value: stats.bookings,
              icon: <TbBrandBooking />,
              color: "#f59e0b",
              sub: "Total Bookings",
            },
          ].map((stat, i) => (
            <div key={i} className="col-lg-3 col-md-6">
              <GlassCard
                delay={i * 0.1}
                className="p-4 border-white-5 relative overflow-hidden h-100 stat-card-v3"
              >
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="stat-label-v3">
                    <span className="text-white-50 small fw-black tracking-widest text-uppercase d-block mb-1">
                      {stat.title}
                    </span>
                    <h2 className="text-white fw-black mb-0 display-5">
                      {loading ? (
                        <Skeleton width="50px" height="35px" />
                      ) : (
                        stat.value
                      )}
                    </h2>
                  </div>
                  <div
                    className="stat-icon-v3 shadow-premium"
                    style={{
                      "--accent": stat.color,
                      background: `${stat.color}15`,
                    }}
                  >
                    {stat.icon}
                  </div>
                </div>
                <div className="d-flex align-items-center justify-content-between pt-2 border-top border-white-5">
                  <span className="text-secondary small opacity-50 font-monospace">
                    {stat.sub}
                  </span>
                  <div className="trend-tag" style={{ color: stat.color }}>
                    <FiTrendingUp className="small" /> LIVE
                  </div>
                </div>
              </GlassCard>
            </div>
          ))}
        </div>

        {/* Management Clusters */}
        <div className="d-flex align-items-center gap-3 mb-4 pb-2 border-bottom border-white-5">
          <span className="section-indicator-dash" />
          <h3 className="text-white fw-black mb-0 fs-4 tracking-tight">
            MANAGEMENT CLUSTERS
          </h3>
        </div>

        <div className="row g-4">
          {[
            {
              to: "/admin/categories",
              title: "CATEGORY MANAGEMENT",
              desc: "Define event taxonomy and global categories",
              icon: <FaFile />,
              grad: "var(--primary-gradient)",
            },
            {
              to: "/admin/users",
              title: "USER MANAGEMENT",
              desc: "Manage system accounts and security roles",
              icon: <FaUserAlt />,
              grad: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
            },
            {
              to: "/admin/events",
              title: "EVENT MANAGEMENT",
              desc: "Moderate global event sequences and catalog",
              icon: <FaCalendarAlt />,
              grad: "linear-gradient(135deg, #f97316 0%, #f43f5e 100%)",
            },
            {
              to: "/admin/registrations",
              title: "REGISTRATION MANAGEMENT",
              desc: "Review global engagement and registration logs",
              icon: <FaRegistered />,
              grad: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
            },
            {
              to: "/admin/bookings",
              title: "BOOKING MANAGEMENT",
              desc: "Audit transaction records and ledger states",
              icon: <MdDashboard />,
              grad: "linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)",
            },
            {
              to: "/admin/reviews",
              title: "FEEDBACK MANAGEMENT",
              desc: "Monitor community sentiment and reviews",
              icon: <MdReviews />,
              grad: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
            },
            {
              to: "/admin/messages",
              title: "MESSAGE MANAGEMENT",
              desc: "Secure support channel and system messages",
              icon: <FiMessageSquare />,
              grad: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
            },
          ].map((action, i) => (
            <div key={i} className="col-lg-4 col-md-6">
              <GlassCard
                delay={0.4 + i * 0.05}
                className="p-4 border-white-5 h-100 action-card-v4"
              >
                <div className="d-flex align-items-start gap-4 mb-4">
                  <div
                    className="action-blob shadow-premium"
                    style={{ background: action.grad }}
                  >
                    {action.icon}
                  </div>
                  <div>
                    <h4 className="text-white fw-black mb-1 tracking-tight fs-5">
                      {action.title}
                    </h4>
                    <p className="text-secondary small mb-0 lh-sm opacity-50">
                      {action.desc}
                    </p>
                  </div>
                </div>
                <Button
                  variant="glass"
                  className="w-100 justify-content-between border-white-10"
                  onClick={() => navigate(action.to)}
                >
                  Go <FaChevronRight className="small opacity-50" />
                </Button>
              </GlassCard>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
