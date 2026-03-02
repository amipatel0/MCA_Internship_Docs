import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaRupeeSign,
  FaInbox,
} from "react-icons/fa";
import { useCity } from "../context/CityContext";
import GlassCard from "../components/ui/GlassCard";
import Skeleton, { CardSkeleton } from "../components/ui/Skeleton";
import "./Events.css";

export default function Events({ activeCategory = "All", searchQuery = "" }) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { city } = useCity();

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder-image.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("uploads/"))
      return `http://localhost/event_backend/${imagePath}`;
    return `http://localhost/event_backend/uploads/events/${imagePath}`;
  };

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (activeCategory !== "All") params.category = activeCategory;
      if (city) params.city = city;

      const res = await axios.get(
        "http://localhost/event_backend/getEvents.php",
        { params },
      );

      setEvents(Array.isArray(res.data.events) ? res.data.events : []);
    } catch (err) {
      console.error("Event fetch failed", err);
      setEvents([]);
    } finally {
      setTimeout(() => setIsLoading(false), 600);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [activeCategory, searchQuery, city]);

  return (
    <section id="events" className="all-events-section-premium">
      <div className="container">
        <header className="events-header-premium mb-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="section-title-premium-dash mb-2">
              {city && activeCategory !== "All"
                ? `${activeCategory} Events in ${city}`
                : city
                  ? `Upcoming Events in ${city}`
                  : activeCategory !== "All"
                    ? `${activeCategory} Collections`
                    : "Discover Extraordinary Events"}
            </h2>
            <p className="text-secondary mb-0">
              Browse through handpicked events curated just for you
            </p>
          </motion.div>
        </header>

        {isLoading ? (
          <div className="row g-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="col-lg-4 col-md-6">
                <CardSkeleton />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="no-events-premium py-5 text-center"
          >
            <div className="no-events-icon mb-4 mx-auto">
              <FaInbox />
            </div>
            <h3 className="text-white fw-bold">No Events Found</h3>
            <p className="text-secondary">
              We couldn't find any events matching your current filters.
            </p>
          </motion.div>
        ) : (
          <div className="row g-4">
            <AnimatePresence>
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  className="col-lg-4 col-md-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard className="p-0 overflow-hidden h-100 event-card-premium-v2">
                    <div
                      className="card-media-wrapper"
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      <img
                        src={getImageUrl(event.poster)}
                        alt={event.title}
                        className="card-media-img"
                      />
                      <div className="card-badge-category">
                        {event.category_name}
                      </div>
                    </div>

                    <div className="card-body-premium p-4">
                      <h3
                        className="card-title-premium text-white mb-3"
                        onClick={() => navigate(`/events/${event.id}`)}
                      >
                        {event.title}
                      </h3>

                      <div className="card-meta-premium mb-4">
                        <div className="meta-item-dash">
                          <FaMapMarkerAlt className="text-primary" />
                          <span className="truncate-1">
                            {event.location}, {event.city}
                          </span>
                        </div>
                        <div className="meta-item-dash">
                          <FaCalendarAlt className="text-primary" />
                          <span>
                            {new Date(event.date_time).toDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="card-footer-premium pt-3 border-top border-white-5 d-flex justify-content-between align-items-center">
                        <div className="price-display-premium">
                          {event.event_type === "paid" ? (
                            <>
                              <FaRupeeSign className="small opacity-50" />
                              <span className="fw-black fs-5 text-white">
                                {(+event.price).toLocaleString()}
                              </span>
                            </>
                          ) : (
                            <span className="text-success fw-bold">FREE</span>
                          )}
                        </div>
                        <button
                          className="btn-book-minimal"
                          onClick={() => navigate(`/events/${event.id}`)}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
