import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaArrowLeft,
  FaRupeeSign,
  FaStar,
  FaTicketAlt,
  FaUsers,
  FaClock,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNotification } from "../context/NotificationContext";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import "./EventDetails.css";

export default function EventDetails() {
  const { showNotification } = useNotification();
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [canReview, setCanReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder-image.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("uploads/"))
      return `http://localhost/event_backend/${imagePath}`;
    return `http://localhost/event_backend/uploads/events/${imagePath}`;
  };

  useEffect(() => {
    const checkReviewEligibility = async () => {
      try {
        const res = await axios.get(
          "http://localhost/event_backend/customer/checkReviewEligibility.php",
          { params: { event_id: id }, withCredentials: true },
        );
        setCanReview(res.data.canReview);
      } catch {
        setCanReview(false);
      }
    };

    const fetchEvent = async () => {
      try {
        const res = await axios.get(
          "http://localhost/event_backend/getEventById.php",
          { params: { id }, withCredentials: true },
        );
        setEvent(res.data.event);
      } catch (error) {
        console.error("Error loading event", error);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };

    const checkRegistrationStatus = async () => {
      try {
        const res = await axios.get(
          "http://localhost/event_backend/customer/checkEventRegistrations.php",
          { params: { event_id: id }, withCredentials: true },
        );
        if (res.data.registered) {
          setAlreadyRegistered(true);
          setRegistrationStatus(res.data.status);
        }
      } catch (err) {
        console.error("Registration check failed");
      }
    };

    fetchEvent();
    checkRegistrationStatus();
    checkReviewEligibility();
  }, [id]);

  const handleRegister = async () => {
    if (event.total_seats > 0 && event.available_seats === 0) {
      showNotification("Seats are full for this event", "warning");
      return;
    }

    setRegistering(true);
    try {
      const res = await axios.post(
        "http://localhost/event_backend/customer/registerEvent.php",
        { event_id: id },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      );

      showNotification(
        res.data.message || "Registration successful!",
        res.data.status ? "success" : "error",
      );

      if (res.data.status) {
        setTimeout(() => navigate("/customer/dashboard"), 1500);
      }
    } catch (error) {
      const msg = error.response?.data?.message ?? "Please login to register";
      showNotification(msg, "error");
      if (error.response?.status === 401) navigate("/login");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 mt-5">
        <div className="row g-5 mt-4">
          <div className="col-md-4">
            <Skeleton height="500px" borderRadius="30px" />
          </div>
          <div className="col-md-8">
            <Skeleton
              width="60%"
              height="60px"
              borderRadius="12px"
              className="mb-4"
            />
            <Skeleton
              width="100%"
              height="200px"
              borderRadius="20px"
              className="mb-4"
            />
            <Skeleton width="40%" height="80px" borderRadius="20px" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container text-center py-5 mt-5">
        <GlassCard className="p-5 d-inline-block border-white-5">
          <h2 className="text-white fw-black mb-4">Event Unavailable</h2>
          <Button onClick={() => navigate("/")}>Explore Events</Button>
        </GlassCard>
      </div>
    );
  }

  const isEventCompleted = new Date(event.date_time) <= new Date();

  return (
    <div className="event-details-premium">
      {/* Immersive Background */}
      <div
        className="immersive-bg"
        style={{ backgroundImage: `url(${getImageUrl(event.poster)})` }}
      />
      <div className="immersive-overlay" />

      <div className="container content-layer-premium">
        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-5 pt-4"
        >
          <button className="btn-back-premium" onClick={() => navigate(-1)}>
            <FaArrowLeft />
            <span>Discover More</span>
          </button>
        </motion.div>

        <div className="row g-5 align-items-start">
          {/* Visual Side */}
          <div className="col-lg-5 col-xl-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="poster-container-premium shadow-2xl"
            >
              <img
                src={getImageUrl(event.poster)}
                alt={event.title}
                className="poster-img-v2"
              />
              <div className="poster-glow" />
              <div className="badge-vertical-premium">
                {event.category_name}
              </div>
            </motion.div>
          </div>

          {/* Details Side */}
          <div className="col-lg-7 col-xl-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <header className="event-header-premium mb-5">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <span className="badge-premium-v2">LIVE EVENT</span>
                  <div className="d-flex align-items-center gap-2 text-primary small fw-bold tracking-widest">
                    <FaClock />{" "}
                    {new Date(event.date_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <h1 className="display-4 fw-black text-white mb-3 tracking-tighter">
                  {event.title}
                </h1>

                <div className="meta-pills-premium d-flex flex-wrap gap-3">
                  <div className="meta-pill-v2">
                    <FaMapMarkerAlt className="text-primary" />
                    <span>
                      {event.location}, {event.city}
                    </span>
                  </div>
                  <div className="meta-pill-v2">
                    <FaCalendarAlt className="text-primary" />
                    <span>{new Date(event.date_time).toDateString()}</span>
                  </div>
                  <div className="meta-pill-v2">
                    <FaUsers className="text-primary" />
                    <span>{event.available_seats} Slots Available</span>
                  </div>
                </div>
              </header>

              <GlassCard className="p-4 p-md-5 mb-5 border-white-5">
                <h4 className="text-white fw-black mb-4 d-flex align-items-center gap-3">
                  <span className="section-indicator" />
                  Event Synopsis
                </h4>
                <p
                  className="text-secondary lead lh-lg mb-5"
                  style={{ fontSize: "1.05rem" }}
                >
                  {event.description}
                </p>

                <div className="pricing-action-section d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-4">
                  <div className="price-container-v2">
                    <span className="text-white-50 small fw-bold tracking-widest text-uppercase">
                      ADMISSION FEE
                    </span>
                    <div className="price-tag-premium text-white mt-1">
                      {event.event_type === "paid" ? (
                        <>
                          <FaRupeeSign className="fs-3 opacity-50 me-1" />
                          <span className="fw-black">
                            {(+event.price).toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="text-success fw-black">
                          COMPLIMENTARY
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="registration-action">
                    <Button
                      variant={alreadyRegistered ? "glass" : "primary"}
                      className="px-5 py-3 fs-5 fw-black"
                      disabled={
                        registering ||
                        alreadyRegistered ||
                        (event.total_seats > 0 && event.available_seats === 0)
                      }
                      onClick={handleRegister}
                    >
                      {registering
                        ? "Processing..."
                        : alreadyRegistered
                          ? (registrationStatus || "Registered").toUpperCase()
                          : event.available_seats === 0
                            ? "FULLY BOOKED"
                            : "RESERVE SEAT"}
                    </Button>
                  </div>
                </div>
              </GlassCard>

              {/* Reviews & Ratings */}
              <AnimatePresence>
                {isEventCompleted && canReview && (
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="review-section-premium"
                  >
                    <GlassCard className="p-4 p-md-5 border-white-5">
                      <h3 className="text-white fw-black mb-5">
                        Attendee Feedback
                      </h3>

                      <div className="star-rating-v2 mb-4 d-flex align-items-center gap-3">
                        <span className="text-secondary fw-bold small">
                          RATING
                        </span>
                        <div className="d-flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <motion.div
                              key={star}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              style={{ cursor: "pointer" }}
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHover(star)}
                              onMouseLeave={() => setHover(0)}
                            >
                              <FaStar
                                size={28}
                                color={
                                  (hover || rating) >= star
                                    ? "#6366f1"
                                    : "rgba(255,255,255,0.1)"
                                }
                                className="star-icon"
                              />
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <textarea
                          className="premium-textarea"
                          rows="4"
                          placeholder="Excellence in every detail. Share your thoughts..."
                          value={review}
                          onChange={(e) => setReview(e.target.value)}
                        />
                      </div>

                      <Button
                        disabled={rating === 0}
                        className="px-5"
                        onClick={async () => {
                          try {
                            const res = await axios.post(
                              "http://localhost/event_backend/customer/addReview.php",
                              { event_id: id, rating, review },
                              { withCredentials: true },
                            );
                            showNotification(
                              res.data.message || "Review processed",
                              "success",
                            );
                            setCanReview(false);
                          } catch (err) {
                            showNotification(
                              err.response?.data?.message || "Review failed",
                              "error",
                            );
                          }
                        }}
                      >
                        Submit Feedback
                      </Button>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
