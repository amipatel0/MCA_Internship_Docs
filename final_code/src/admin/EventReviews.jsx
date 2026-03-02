import { useEffect, useState, useMemo } from "react";
import {
  FaStar,
  FaQuoteLeft,
  FaSync,
  FaChartLine,
  FaRegStar,
} from "react-icons/fa";
import {
  MdRateReview,
  MdOutlineInsights,
  MdOutlineSentimentSatisfied,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNotification } from "../context/NotificationContext";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import "./EventReviews.css";

export default function EventReviews() {
  const { showNotification } = useNotification();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost/event_backend/admin/getReviews.php",
        { withCredentials: true },
      );

      if (res.data.status) {
        setReviews(res.data.reviews);
        setError("");
      } else {
        setReviews([]);
        setError(res.data.message || "No reviews available in registry");
      }
    } catch (err) {
      setError("Failed to synchronize with sentiment archive");
      showNotification("Archive synchronization failure", "error");
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, rev) => acc + parseInt(rev.rating), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  return (
    <motion.div
      className="event-reviews-premium pb-5"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container py-4">
        {/* Sentiment Header */}
        <header className="dashboard-header-premium mb-5 pt-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="d-flex align-items-center gap-3 mb-3"
              >
                <div className="reviews-icon-premium shadow-lg">
                  <MdRateReview />
                </div>
                <div>
                  <span className="badge-premium-v2 text-uppercase">
                    COMMUNITY SENTIMENT
                  </span>
                  <h1 className="text-white fw-black mb-0 display-4">
                    Reviews{" "}
                    <span className="text-primary-gradient">Archive</span>
                  </h1>
                </div>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-secondary lead mb-0 max-w-600"
              >
                Monitor attendee resonance and system feedback. Analyze
                qualitative data streams to optimize future event sequences.
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
                  <span className="dot-live" /> {reviews.length} FEEDBACK NODES
                </div>
                <div className="telemetry-pill avg-rating-pill">
                  <FaChartLine className="text-warning" /> AVG SCORE:{" "}
                  {avgRating} / 5.0
                </div>
                <Button
                  variant="glass"
                  onClick={fetchReviews}
                  className="btn-sync d-flex align-items-center gap-2"
                >
                  <FaSync className={loading ? "spin" : ""} /> REFRESH
                </Button>
              </motion.div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="row g-4">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="col-md-6 col-lg-4">
                  <GlassCard className="p-4 h-100 border-white-5">
                    <Skeleton height="150px" />
                  </GlassCard>
                </div>
              ))}
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="empty-archive-state text-center py-5"
          >
            <MdOutlineInsights
              size={80}
              className="text-secondary mb-4 opacity-25"
            />
            <h3 className="text-white fw-black opacity-50 text-uppercase tracking-widest">
              {error}
            </h3>
            <Button variant="outline" onClick={fetchReviews} className="mt-4">
              RETRY
            </Button>
          </motion.div>
        ) : (
          <div className="row g-4">
            <AnimatePresence>
              {reviews.map((rev, index) => (
                <ReviewNode key={rev.id} rev={rev} index={index} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ReviewNode({ rev, index }) {
  return (
    <motion.div
      className="col-md-6 col-lg-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ delay: index * 0.05 }}
    >
      <GlassCard className="h-100 border-white-5 sentiment-node-card overflow-hidden p-4 relative">
        <FaQuoteLeft className="node-quote-icon" />

        <div className="relative z-1 d-flex flex-column h-100">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="node-id font-monospace opacity-50">
              REVIEW {rev.id}
            </div>
            {parseInt(rev.rating) === 5 && (
              <div className="top-rated-badge">TOP RATED</div>
            )}
          </div>

          {/* Rating Matrix */}
          <div className="rating-matrix d-flex align-items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={
                  star <= parseInt(rev.rating) ? "star-active" : "star-inactive"
                }
              />
            ))}
            <span className="ms-2 small fw-black text-warning tracking-widest">
              {rev.rating}.0
            </span>
          </div>

          {/* Qualitative Data */}
          <div className="payload-content flex-grow-1 mb-4">
            <p className="text-secondary font-monospace small leading-relaxed">
              "{rev.review}"
            </p>
          </div>

          <div className="node-divider mb-4" />

          {/* Source Identity */}
          <div className="d-flex align-items-center gap-3">
            <div className="source-avatar shadow-glow-sm">
              {rev.user_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h6 className="text-white fw-black m-0 small tracking-tight text-uppercase">
                {rev.user_name}
              </h6>
              <div className="text-secondary small font-monospace opacity-50 mt-1">
                {new Date(rev.created_at)
                  .toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                  .toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        <div className="node-accent-bar" />
      </GlassCard>
    </motion.div>
  );
}
