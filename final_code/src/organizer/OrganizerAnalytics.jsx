import { useEffect, useState } from "react";
import API from "../services/api";
import {
  MdAnalytics,
  MdPeople,
  MdEvent,
  MdStar,
  MdEventAvailable,
  MdTrendingUp,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import "./Analytics.css";
import { OrganizerAccess } from "./OrganizerAccess";
export default function OrganizerAnalytics() {
  const [data, setData] = useState(null);
  const [openEvent, setOpenEvent] = useState(null);
  const [openEventReviews, setOpenEventReviews] = useState(null);
  const [reviewsData, setReviewsData] = useState({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse tracking for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const fetchReviews = async (event_id) => {
    if (reviewsData[event_id]) {
      setOpenEventReviews(openEventReviews === event_id ? null : event_id);
      return;
    }
    try {
      const res = await API.get("organizer/getEventReview.php", {
        params: { event_id },
        withCredentials: true,
      });
      if (res.data.status) {
        setReviewsData((prev) => ({ ...prev, [event_id]: res.data.reviews }));
        setOpenEventReviews(event_id);
      } else {
        setReviewsData((prev) => ({ ...prev, [event_id]: [] }));
        setOpenEventReviews(event_id);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    API.get("organizer/event_analytics.php", {
      withCredentials: true,
    }).then((res) => {
      if (res.data.status) setData(res.data.data);
    });
  }, []);

  if (!data)
    return (
      <div className="loading-container">
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <MdAnalytics size={48} />
        </motion.div>
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="analytics-container"
    >
      {/* Header */}
      <motion.header
        className="analytics-header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.div
          className="header-icon-wrapper"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <MdAnalytics size={40} />
        </motion.div>
        <div className="header-content">
          <h1 className="header-title">Event Analytics</h1>
          <p className="header-subtitle">
            Track your performance and engagement metrics
          </p>
        </div>
        <motion.div
          className="header-accent"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </motion.header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Events"
          value={data.totalEvents}
          icon={<MdEvent />}
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          delay={0.1}
        />
        <StatCard
          title="Upcoming"
          value={data.upcomingEvents}
          icon={<MdEventAvailable />}
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          delay={0.2}
        />
        <StatCard
          title="Past Events"
          value={data.pastEvents}
          icon={<MdTrendingUp />}
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          delay={0.3}
        />
        <StatCard
          title="Registrations"
          value={data.totalRegistrations}
          icon={<MdPeople />}
          gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
          delay={0.4}
        />
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <motion.div
          className="chart-card glass-card-3d"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="card-header-3d">
            <h3 className="card-title text-white">Event Status Distribution</h3>
            <div className="card-icon">
              <MdAnalytics />
            </div>
          </div>
          <div className="card-content">
            <AnalyticsBar
              label="Approved"
              value={data.byStatus.approved}
              total={data.totalEvents}
              color="#10b981"
            />
            <AnalyticsBar
              label="Pending"
              value={data.byStatus.pending}
              total={data.totalEvents}
              color="#f59e0b"
            />
            <AnalyticsBar
              label="Rejected"
              value={data.byStatus.rejected}
              total={data.totalEvents}
              color="#ef4444"
            />
          </div>
        </motion.div>

        <motion.div
          className="chart-card glass-card-3d"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="card-header-3d">
            <h3 className="card-title text-white">Top Categories</h3>
            <div className="card-icon">
              <MdEvent />
            </div>
          </div>
          <div className="card-content">
            {data.byCategory.map((cat, idx) => (
              <AnalyticsBar
                key={idx}
                label={cat.category}
                value={cat.total}
                total={data.totalEvents}
                color="#8b5cf6"
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Events Table */}
      <motion.div
        className="events-table-card glass-card-3d"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="table-header-3d">
          <h3 className="table-title text-white text-bold">
            Detailed Event Statistics
          </h3>
          <div className="table-accent" />
        </div>
        <div className="table-container">
          <table className="events-table">
            <thead>
              <tr>
                <th>Event Details</th>
                <th className="text-center">Capacity</th>
                <th className="text-center">Booked</th>
                <th className="text-center">Available</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.eventStats.map((event, idx) => (
                <EventTableRow
                  key={event.event_id}
                  event={event}
                  index={idx}
                  openEvent={openEvent}
                  setOpenEvent={setOpenEvent}
                  openEventReviews={openEventReviews}
                  fetchReviews={fetchReviews}
                  reviewsData={reviewsData}
                />
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- SUB-COMPONENTS ---

function StatCard({ title, value, icon, gradient, delay }) {
  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 50, rotateX: -30, translateZ: -100 }}
      animate={{ opacity: 1, y: 0, rotateX: 0, translateZ: 0 }}
      transition={{
        duration: 0.8,
        delay,
        type: "spring",
        stiffness: 80,
      }}
      whileHover={{
        y: -15,
        rotateX: 10,
        rotateY: 10,
        translateZ: 50,
        transition: { duration: 0.4 },
      }}
    >
      <div className="stat-card-inner" style={{ background: gradient }}>
        <div className="stat-icon-wrapper">
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              translateZ: [0, 20, 0],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            {icon}
          </motion.div>
        </div>
        <div className="stat-content">
          <h4 className="stat-title">{title}</h4>
          <motion.h2
            className="stat-value"
            initial={{ scale: 0, translateZ: 0 }}
            animate={{ scale: 1, translateZ: 40 }}
            transition={{ delay: delay + 0.4, type: "spring", stiffness: 150 }}
          >
            {value}
          </motion.h2>
        </div>
        <div className="stat-glow" />
      </div>
    </motion.div>
  );
}

function AnalyticsBar({ label, value, total, color }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="analytics-bar-wrapper">
      <div className="analytics-bar-header">
        <span className="bar-label">{label}</span>
        <span className="bar-value">
          {value}{" "}
          <span className="bar-percentage">({Math.round(percentage)}%)</span>
        </span>
      </div>
      <div className="progress-bar-3d">
        <motion.div
          className="progress-fill"
          style={{
            background: `linear-gradient(90deg, ${color}ee, ${color})`,
            boxShadow: `0 0 20px ${color}66`,
          }}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: `${percentage}%`, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
        >
          <div className="progress-shine" />
        </motion.div>
      </div>
    </div>
  );
}

function EventTableRow({
  event,
  index,
  openEvent,
  setOpenEvent,
  openEventReviews,
  fetchReviews,
  reviewsData,
}) {
  const isExpanded =
    openEvent === event.event_id || openEventReviews === event.event_id;

  return (
    <>
      <motion.tr
        className="event-row"
        initial={{ opacity: 0, x: -50, rotateY: -20 }}
        animate={{ opacity: 1, x: 0, rotateY: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        whileHover={{
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          scale: 1.02,
          translateZ: 20,
        }}
      >
        <td className="event-details">
          <div className="event-title">{event.title}</div>
          <div className="event-id">Event ID : {event.event_id}</div>
        </td>
        <td className="text-center">
          {event.total_seats > 0 ? (
            <span className="capacity-badge">{event.total_seats}</span>
          ) : (
            <span className="unlimited-badge">Unlimited</span>
          )}
        </td>
        <td className="text-center">
          <motion.span className="booked-badge" whileHover={{ scale: 1.1 }}>
            {event.registrations}
          </motion.span>
        </td>
        <td className="text-center">
          {event.total_seats > 0 ? (
            <motion.span
              className="available-badge"
              whileHover={{ scale: 1.1 }}
            >
              {event.available_seats}
            </motion.span>
          ) : (
            <span className="unlimited-badge">—</span>
          )}
        </td>
        <td className="text-end">
          <div className="action-btn-group">
            <motion.button
              className="actions-cell action-btn-outline"
              onClick={() =>
                setOpenEvent(
                  openEvent === event.event_id ? null : event.event_id,
                )
              }
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {openEvent === event.event_id ? "Hide Users" : "View Users"}
            </motion.button>

            <motion.button
              className="actions-cell action-btn-primary"
              onClick={() => fetchReviews(event.event_id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {openEventReviews === event.event_id
                ? "Hide Reviews"
                : "View Reviews"}
            </motion.button>
          </div>
        </td>
      </motion.tr>

      <AnimatePresence>
        {isExpanded && (
          <motion.tr
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <td colSpan="5" className="expanded-cell">
              <div className="expanded-content">
                {openEvent === event.event_id && (
                  <motion.div
                    className="expanded-section"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="section-header">
                      <MdPeople /> Registered Participants
                    </div>
                    {event.users.length === 0 ? (
                      <p className="empty-state">No registrations found.</p>
                    ) : (
                      <div className="users-grid">
                        {event.users.map((u, i) => (
                          <motion.div
                            key={i}
                            className="user-card"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{
                              y: -5,
                              boxShadow: "0 10px 30px rgba(139, 92, 246, 0.2)",
                            }}
                          >
                            <div className="user-avatar">
                              {/* {u.name.charAt(0).toUpperCase()} */}
                            </div>
                            <div className="user-info">
                              <div className="user-name">{u.name}</div>
                              <div className="user-email">{u.email}</div>
                              <div className="user-date">{u.registered_at}</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {openEventReviews === event.event_id && (
                  <motion.div
                    className="expanded-section"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="section-header">
                      <MdStar className="star-icon" /> Event Reviews
                    </div>
                    {reviewsData[event.event_id]?.length === 0 ? (
                      <p className="empty-state">No reviews yet.</p>
                    ) : (
                      <div className="reviews-grid">
                        {reviewsData[event.event_id]?.map((rev, i) => (
                          <motion.div
                            key={rev.id}
                            className="review-card"
                            initial={{ opacity: 0, rotateY: -15 }}
                            animate={{ opacity: 1, rotateY: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{
                              rotateY: 5,
                              boxShadow: "0 15px 40px rgba(245, 158, 11, 0.2)",
                            }}
                          >
                            <div className="review-header">
                              <div className="reviewer-avatar">
                                {rev.user_name.charAt(0).toUpperCase()}
                              </div>
                              <div className="reviewer-info">
                                <div className="reviewer-name">
                                  {rev.user_name}
                                </div>
                                <div className="review-date">
                                  {new Date(
                                    rev.created_at,
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="review-rating">
                                {rev.rating} <MdStar />
                              </div>
                            </div>
                            <p className="review-text">"{rev.review}"</p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}
