import { useEffect, useState } from "react";
import { FaStar, FaQuoteLeft } from "react-icons/fa";
import { MdRateReview } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import GlassCard from "../components/ui/GlassCard";
import Skeleton from "../components/ui/Skeleton";

export default function OrganizerEventReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(
          "http://localhost/event_backend/organizer/getReviews.php",
          { withCredentials: true }
        );

        if (res.data.status) {
          setReviews(res.data.reviews);
        } else {
          setError(res.data.message || "No reviews available");
        }
      } catch (err) {
        setError("Failed to fetch reviews");
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };

    fetchReviews();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="row g-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="col-md-6">
              <GlassCard className="p-4 h-100 border-white-5">
                <Skeleton height="150px" />
              </GlassCard>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="container py-5"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <header className="mb-5">
        <div className="d-flex align-items-center gap-3 mb-3">
          <div className="p-3 bg-primary-gradient rounded-4 shadow-lg text-white">
            <MdRateReview size={32} />
          </div>
          <div>
            <span className="badge-premium-v2 text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--primary)' }}>FEEDBACK PROTOCOL</span>
            <h1 className="text-white fw-black mb-0 display-5">Event <span className="text-primary-gradient">Reviews</span></h1>
          </div>
        </div>
        <p className="text-secondary lead max-w-600">
          Monitor your event impact through attendee resonance. Analyze community feedback to optimize future experiences.
        </p>
      </header>

      {error || reviews.length === 0 ? (
        <GlassCard className="p-5 text-center border-white-5">
          <MdRateReview size={64} className="text-secondary opacity-25 mb-3" />
          <h4 className="text-white fw-black opacity-50">{error || "ZERO FEEDBACK NODES DETECTED"}</h4>
        </GlassCard>
      ) : (
        <div className="row g-4">
          <AnimatePresence>
            {reviews.map((rev, index) => (
              <motion.div
                key={rev.id}
                className="col-md-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="p-4 h-100 border-white-5 position-relative overflow-hidden">
                  <FaQuoteLeft className="position-absolute opacity-05" style={{ top: '20px', right: '20px', fontSize: '3rem' }} />
                  
                  <div className="d-flex align-items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        color={star <= rev.rating ? "#ffc107" : "rgba(255,255,255,0.1)"}
                        size={14}
                      />
                    ))}
                    <span className="ms-2 small fw-bold text-warning">{rev.rating}.0</span>
                  </div>

                  <p className="text-secondary font-monospace mb-4" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                    "{rev.review}"
                  </p>

                  <div className="d-flex align-items-center justify-content-between pt-3 border-top border-white-5">
                    <div className="d-flex align-items-center gap-2">
                       <div className="rounded-circle bg-primary-gradient d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                        {rev.user_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white small fw-bold">{rev.user_name}</div>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>{new Date(rev.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="badge bg-glass border border-white-5 text-primary small p-2">
                      {rev.event_title}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
