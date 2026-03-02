import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFileAlt,
  FaChartLine,
  FaUsers,
  FaCalendarCheck,
  FaPlus,
  FaChevronRight,
  FaMeteor,
  FaShieldAlt,
} from "react-icons/fa";
import { SiSimpleanalytics } from "react-icons/si";
import { MdEmojiEvents } from "react-icons/md";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import "./OrganizerDashboard.css";

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalRegistrations: 0,
  });
  const [user, setUser] = useState({ name: "", role: "" });
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

        const statsRes = await axios.get(
          "http://localhost/event_backend/organizer/event_analytics.php",
          {
            withCredentials: true,
          },
        );

        if (statsRes.data.status) {
          setStats(statsRes.data.data);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };

    fetchData();
  }, [navigate]);

  const actionCards = [
    {
      title: "CREATE NEW EVENT",
      desc: "Initialize a new extraordinary event sequence",
      icon: <FaPlus />,
      link: "/organizer/create-event",
      color: "#6366f1",
      accent: "rgba(99, 102, 241, 0.1)",
    },
    {
      title: "MY EVENTS",
      desc: "Manage and optimize your active event nodes",
      icon: <FaFileAlt />,
      link: "/organizer/myevents",
      color: "#ec4899",
      accent: "rgba(236, 72, 153, 0.1)",
    },
    {
      title: "EVENT ANALYTICS",
      desc: "Deep-dive into performance and reach metrics",
      icon: <SiSimpleanalytics />,
      link: "/organizer/analytics",
      color: "#06b6d4",
      accent: "rgba(6, 182, 212, 0.1)",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  return (
    <motion.div
      className="organizer-dashboard-premium py-5"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container">
        {/* Command Header */}
        <header className="dashboard-header-premium mb-5 pt-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="d-flex align-items-center gap-3 mb-3"
              >
                <div className="host-avatar-premium shadow-lg">
                  <FaShieldAlt />
                </div>
                <div>
                  <span className="badge-premium-v2 text-uppercase">
                    EVENT COMMAND
                  </span>
                  <h1 className="text-white fw-black mb-0 display-4">
                    Control Room:{" "}
                    <span className="text-primary-gradient">
                      {user.name || "Commander"}
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
                Orchestrate your event portfolio, monitor real-time reach, and
                deploy new experiences from your secure tactical interface.
              </motion.p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  variant="primary"
                  className="px-4 py-3 shadow-glow"
                  onClick={() => navigate("/organizer/create-event")}
                >
                  <FaMeteor className="me-2" /> CREATE NEW EVENT
                </Button>
              </motion.div>
            </div>
          </div>
        </header>

        {/* Tactical Intel Grid */}
        <div className="row g-4 mb-5 pb-3">
          {[
            {
              label: "Active Deployments",
              value: stats.totalEvents,
              icon: <FaCalendarCheck />,
              color: "#6366f1",
              desc: "Total global nodes",
            },
            {
              label: "Upcoming Trajectory",
              value: stats.upcomingEvents,
              icon: <FaChartLine />,
              color: "#ec4899",
              desc: "Future projections",
            },
            {
              label: "Personnel Reach",
              value: stats.totalRegistrations,
              icon: <FaUsers />,
              color: "#10b981",
              desc: "Aggregated footprint",
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
                      {loading ? (
                        <Skeleton width="60px" height="40px" />
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
                      border: `1px solid ${stat.color}30`,
                    }}
                  >
                    {stat.icon}
                  </div>
                </div>
                <div className="stat-footer-v3 d-flex align-items-center gap-2">
                  <span
                    className="dot-mini"
                    style={{
                      background: stat.color,
                      boxShadow: `0 0 10px ${stat.color}`,
                    }}
                  ></span>
                  <span className="text-secondary small opacity-50 tracking-wide font-monospace">
                    {stat.desc}
                  </span>
                </div>
                <div
                  className="glow-corner"
                  style={{
                    background: `radial-gradient(circle at top right, ${stat.color}10, transparent 70%)`,
                  }}
                />
              </GlassCard>
            </div>
          ))}
        </div>

        {/* Mission Control Actions */}
        <div className="d-flex align-items-center gap-3 mb-4 pb-2 border-bottom border-white-5">
          <span className="section-indicator-dash" />
          <h3 className="text-white fw-black mb-0 fs-4 tracking-tight">
            EVENT OPERATIONS
          </h3>
        </div>

        <div className="row g-4">
          {actionCards.map((card, i) => (
            <div key={i} className="col-lg-4">
              <GlassCard
                delay={0.4 + i * 0.1}
                className="p-0 border-white-5 overflow-hidden h-100 action-node-premium"
              >
                <div className="p-4 p-md-5">
                  <div
                    className="action-node-icon mb-4"
                    style={{ color: card.color, background: card.accent }}
                  >
                    {card.icon}
                  </div>
                  <h4 className="text-white fw-black mb-3 tracking-tighter fs-4">
                    {card.title}
                  </h4>
                  <p className="text-secondary mb-5 lh-base opacity-75">
                    {card.desc}
                  </p>

                  <Button
                    variant="glass"
                    className="w-100 justify-content-between border-white-10"
                    onClick={() => navigate(card.link)}
                  >
                    INITIALIZE SEQUENCE{" "}
                    <FaChevronRight className="small opacity-50" />
                  </Button>
                </div>
                <div
                  className="node-accent-bar"
                  style={{ background: card.color }}
                ></div>
              </GlassCard>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
