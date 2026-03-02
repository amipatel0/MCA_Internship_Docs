import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaArrowRight,
  FaRupeeSign,
  FaSearch,
  FaClock,
  FaFire,
  FaChevronLeft,
  FaChevronRight,
  FaRegCalendarAlt,
} from "react-icons/fa";
import API from "../services/api";
import "./Home.css";
import Events from "./Events";
import { useCity } from "../context/CityContext";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import Skeleton, { CardSkeleton } from "../components/ui/Skeleton";

export default function Home() {
  const navigate = useNavigate();
  const { city } = useCity();

  // Data States
  const [todayEvents, setTodayEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // UI States
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder-image.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("uploads/"))
      return `http://localhost/event_backend/${imagePath}`;
    return `http://localhost/event_backend/uploads/events/${imagePath}`;
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("admin/getCategories.php");
      const fetchedCategories = res.data.categories || [];
      setCategories(["All", ...fetchedCategories.map((c) => c.category_name)]);
    } catch (error) {
      console.error("Failed to load categories", error);
    }
  };

  const fetchEventsByDate = async () => {
    setIsLoading(true);
    try {
      const res = await API.get("home/events_by_date.php", {
        params: { city },
      });
      if (res.data.status) {
        setTodayEvents(res.data.today_events);
        setUpcomingEvents(res.data.upcoming_events);
      }
    } catch (err) {
      console.error("Event fetch error", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchEventsByDate();
  }, [city]);

  useEffect(() => {
    if (upcomingEvents.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide(
        (prev) => (prev + 1) % Math.min(upcomingEvents.length, 5),
      );
    }, 6000);
    return () => clearInterval(interval);
  }, [upcomingEvents]);

  const heroSlides = upcomingEvents.slice(0, 5);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="home-container">
      {/* Premium Hero Section */}
      <section className="hero-section">
        <AnimatePresence mode="wait">
          {heroSlides.length > 0 ? (
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="hero-slide active"
            >
              <div className="hero-image-wrapper">
                <img
                  src={getImageUrl(heroSlides[currentSlide].poster)}
                  alt={heroSlides[currentSlide].title}
                  className="hero-image"
                />
                <div className="hero-overlay-premium"></div>
              </div>

              <div className="container hero-content-container">
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="hero-info"
                >
                  <span className="hero-badge-premium">
                    <FaFire className="text-primary" />{" "}
                    {heroSlides[currentSlide].category_name}
                  </span>
                  <h1 className="hero-title-premium">
                    {heroSlides[currentSlide].title}
                  </h1>
                  <div className="hero-meta-premium">
                    <div className="meta-item">
                      <span>Date</span>
                      <span>
                        {new Date(
                          heroSlides[currentSlide].date_time,
                        ).toDateString()}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span>Location</span>
                      <span>{heroSlides[currentSlide].location}</span>
                    </div>
                  </div>

                  <div className="hero-actions-premium">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() =>
                        navigate(`/events/${heroSlides[currentSlide].id}`)
                      }
                    >
                      INITIALIZE BOOKING <FaArrowRight className="ms-2" />
                    </Button>

                    {/* <button
                      onClick={() =>
                        setCurrentSlide(
                          (prev) =>
                            (prev - 1 + heroSlides.length) % heroSlides.length,
                        )
                      }
                      className="hero-nav-btn"
                    >
                      <FaChevronLeft />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentSlide(
                          (prev) => (prev + 1) % heroSlides.length,
                        )
                      }
                      className="hero-nav-btn"
                    >
                      <FaChevronRight />
                    </button> */}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <div className="hero-placeholder-premium">
              <div className="container">
                <h1 className="animate-pulse">
                  Discover Extraordinary Experiences
                </h1>
                <p>Wait while we fetch the best events for you...</p>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Carousel Indicators */}
        <div className="hero-indicators-premium">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`indicator-premium ${index === currentSlide ? "active" : ""}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>

      {/* Modern Search Section */}
      <section className="search-bar-section">
        <div className="container">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className={`search-glass-container ${searchFocused ? "focused" : ""}`}
          >
            <div className="search-input-group">
              <FaSearch className="search-icon-premium" />
              <input
                type="text"
                placeholder="Search events, artists, venues..."
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="search-divider" />
            <div className="search-actions">
              <Button
                variant="primary"
                onClick={() =>
                  document
                    .getElementById("events")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Search
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Styled Categories */}
      <section className="categories-filter-section">
        <div className="container">
          <motion.div
            className="categories-container-premium"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {categories.map((cat, idx) => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveCategory(cat);
                  document
                    .getElementById("events")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`category-pill-premium ${activeCategory === cat ? "active" : ""}`}
              >
                {cat}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Loading State or Featured Content */}
      <div className="container content-wrapper-premium">
        {isLoading ? (
          <div className="row g-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="col-lg-3 col-md-6">
                <CardSkeleton />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Today's Events */}
            {todayEvents.length > 0 && (
              <section className="featured-section mb-5">
                <div className="section-head-premium">
                  <div className="title-area">
                    <span className="section-subtitle-premium">
                      <FaFire /> Trending
                    </span>
                    <h2 className="section-title-premium">Happening Today</h2>
                  </div>
                  <Button variant="glass" onClick={() => navigate("/events")}>
                    View All <FaArrowRight className="ms-2" />
                  </Button>
                </div>

                <div className="row g-4">
                  {todayEvents.map((event, idx) => (
                    <div key={event.id} className="col-lg-4 col-md-6">
                      <GlassCard
                        delay={idx * 0.1}
                        className="h-100 p-0 overflow-hidden"
                      >
                        <div
                          className="event-card-img-wrapper"
                          onClick={() => navigate(`/events/${event.id}`)}
                        >
                          <img
                            src={getImageUrl(event.poster)}
                            alt={event.title}
                          />
                          <div className="card-badge-premium today">TODAY</div>
                        </div>
                        <div className="event-card-body-premium">
                          <span className="event-cat">
                            {event.category_name}
                          </span>
                          <h3
                            className="event-title"
                            onClick={() => navigate(`/events/${event.id}`)}
                          >
                            {event.title}
                          </h3>
                          <div className="event-info-row">
                            <span>
                              <FaMapMarkerAlt /> {event.location}
                            </span>
                            <span className="price">
                              {event.event_type === "free" ? (
                                "FREE"
                              ) : (
                                <>
                                  <FaRupeeSign /> {event.price}
                                </>
                              )}
                            </span>
                          </div>
                          <Button
                            variant="glass"
                            className="w-100 mt-3"
                            onClick={() => navigate(`/events/${event.id}`)}
                          >
                            Book Now
                          </Button>
                        </div>
                      </GlassCard>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming Events */}
            <section className="featured-section">
              <div className="section-head-premium">
                <div className="title-area">
                  <span className="section-subtitle-premium">
                    <FaCalendarAlt /> Upcoming
                  </span>
                  <h2 className="section-title-premium">Upcoming Events</h2>
                </div>
              </div>

              {upcomingEvents.length === 0 ? (
                <div className="empty-state-premium">
                  <p>No upcoming events found for this city.</p>
                </div>
              ) : (
                <div className="row g-4">
                  {upcomingEvents.map((event, idx) => (
                    <div key={event.id} className="col-lg-3 col-md-6">
                      <GlassCard
                        delay={idx * 0.05}
                        className="h-100 p-0 overflow-hidden event-compact-card"
                      >
                        <div
                          className="event-card-img-wrapper compact"
                          onClick={() => navigate(`/events/${event.id}`)}
                        >
                          <img
                            src={getImageUrl(event.poster)}
                            alt={event.title}
                          />
                          <div className="card-overlay-compact">
                            <span className="date-badge">
                              {new Date(event.date_time).toLocaleDateString(
                                "en-US",
                                { day: "numeric", month: "short" },
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="event-card-body-premium p-3">
                          <h4 className="event-title-compact text-truncate">
                            {event.title}
                          </h4>
                          <p className="event-loc-compact">
                            <FaMapMarkerAlt /> {event.location}
                          </p>
                          <div className="d-flex justify-content-between align-items-center mt-2">
                            <span className="event-cat-compact">
                              {event.category_name}
                            </span>
                            <span className="event-price-compact">
                              {event.event_type === "free"
                                ? "FREE"
                                : `₹${event.price}`}
                            </span>
                          </div>
                        </div>
                      </GlassCard>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* All Events Explorer */}
      <section id="events" className="all-events-explorer mt-5 pt-4">
        <div className="container">
          <div className="section-head-premium mb-0">
            <h2 className="section-title-premium">Explore All Events</h2>
          </div>
          <Events activeCategory={activeCategory} searchQuery={searchQuery} />
        </div>
      </section>
    </div>
  );
}
