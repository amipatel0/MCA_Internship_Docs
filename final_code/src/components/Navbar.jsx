import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import "./Navbar.css";
import { useCity } from "../context/CityContext";
import {
  FaMapMarkerAlt,
  FaSearch,
  FaChevronDown,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import {FaRadio} from "react-icons/fa6";
import Button from "./ui/Button";
import BellNotification from "./BellNotification";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { city, changeCity } = useCity();
  const [cities, setCities] = useState([]);
  const [citySearch, setCitySearch] = useState("");
  const [showCityModal, setShowCityModal] = useState(false);

  const popularCities = [
    { name: "Mumbai", icon: "🏙️" },
    { name: "Delhi", icon: "🏛️" },
    { name: "Vadodara", icon: "🌳" },
    { name: "Surat", icon: "🕌" },
    { name: "Ahmedabad", icon: "🧵" },
    { name: "Rajkot", icon: "🎓" },
  ];

  // useEffect(() => {
  //   API.get("getCities.php").then((res) => {
  //     if (res.data.status) {
  //       setCities(res.data.cities);
  //     }
  //   });
  // }, []);

  useEffect(() => {
    const checkUser = () => {
      const userData = localStorage.getItem("user");
      setUser(userData ? JSON.parse(userData) : null);
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    checkUser();
    window.addEventListener("storage", checkUser);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("storage", checkUser);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const res = await API.post("auth/logout.php");
      if (res.data.status) {
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("storage"));
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const selectCity = (selectedCity) => {
    changeCity(selectedCity);
    setShowCityModal(false);
  };

  const filteredCities = cities.filter((c) =>
    c.toLowerCase().includes(citySearch.toLowerCase()),
  );

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`navbar-premium ${scrolled ? "scrolled" : ""}`}
      >
        <div className="container nav-content">
          <Link className="nav-brand" to="/">
            <div className="logo-wrapper">
              <motion.div
                className="animated-logo"
                animate={{
                  rotateY: [0, 15, 0, -15, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="logo-inner">
                  <span className="logo-icon"><FaRadio /></span>
                  <span className="logo-letters">EM</span>
                </div>
                <div className="logo-glow"></div>
              </motion.div>
            </div>
            <div className="brand-info">
              <span className="brand-text">
                Event<span className="text-highlight">Manager</span>
              </span>
              <span className="brand-tagline">Book Your Event</span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="nav-links d-none d-lg-flex">
            {/* Show public links only if user is NOT admin */}
            {user?.role !== "admin" &&
              navLinks.map((link) => (
                <Link key={link.name} className="nav-item-link" to={link.path}>
                  {link.name}
                </Link>
              ))}

            {user && (
              <Link className="nav-item-link" to={`/${user.role}/dashboard`}>
                Dashboard
              </Link>
            )}

            {user && (
              <div style={{ marginLeft: "15px" }}>
                <BellNotification />
              </div>
            )}

            {/* Show city selector only for non-admins */}
            {user?.role !== "admin" && (
              <button
                className="city-selector-btn"
                onClick={() => setShowCityModal(true)}
              >
                <FaMapMarkerAlt className="me-2" />
                <span>{city || "Select City"}</span>
                <FaChevronDown className="ms-2 small" />
              </button>
            )}

            {!user ? (
              <div className="auth-btns">
                <Link to="/login" className="login-link">
                  Sign In
                </Link>
                <Button variant="primary" onClick={() => navigate("/register")}>
                  Sign Up
                </Button>
              </div>
            ) : (
              <div className="user-dropdown-container">
                <button className="user-profile-btn">
                  <FaUser className="me-2" />
                  <span>{user.name}</span>
                </button>
                <div className="user-dropdown-menu">
                  <div className="dropdown-header">
                    <p className="user-name">Name: {user.name}</p>
                    <p className="user-role text-small">Role: {user.role}</p>
                  </div>
                  <div className="dropdown-divider" />
                  <button onClick={handleLogout} className="logout-btn">
                    <FaSignOutAlt className="me-2" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-toggle d-lg-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="mobile-menu-overlay"
          >
            <div className="mobile-menu-content">
              {/* Show public links only if NOT admin */}
              {user?.role !== "admin" &&
                navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="mobile-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}

              {user && (
                <Link
                  to={`/${user.role}/dashboard`}
                  className="mobile-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}

              <div className="mobile-divider" />

              {/* Show city selector only for non-admins */}
              {user?.role !== "admin" && (
                <button
                  className="mobile-link text-start w-100 border-0 bg-transparent"
                  onClick={() => {
                    setShowCityModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <FaMapMarkerAlt className="me-2" /> {city || "Select City"}
                </button>
              )}

              {!user ? (
                <div className="mobile-auth mt-4">
                  <Button
                    variant="primary"
                    className="w-100 mb-3"
                    onClick={() => {
                      navigate("/login");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="glass"
                    className="w-100"
                    onClick={() => {
                      navigate("/register");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              ) : (
                <Button
                  variant="danger"
                  className="w-100 mt-4"
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Logout
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* City Selection Modal */}
      <AnimatePresence>
        {showCityModal && (
          <div className="custom-modal-backdrop">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="city-modal-premium"
            >
              <div className="modal-header-premium">
                <h3>Select Your City</h3>
                <button
                  onClick={() => setShowCityModal(false)}
                  className="close-btn"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="modal-body-premium">
                <div className="search-bar-premium">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search for a city..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                  />
                </div>

                {!citySearch && (
                  <div className="popular-cities">
                    <p className="section-label">Popular Cities</p>
                    <div className="cities-grid">
                      {popularCities.map((c) => (
                        <button
                          key={c.name}
                          className={`city-chip-premium ${city === c.name ? "active" : ""}`}
                          onClick={() => selectCity(c.name)}
                        >
                          <span className="me-2">{c.icon}</span>
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* <div className="all-cities">
                  <p className="section-label">
                    {citySearch ? "Search Results" : "All Cities"}
                  </p>
                  <div className="cities-list-premium custom-scrollbar">
                    {filteredCities.length > 0 ? (
                      filteredCities.map((c) => (
                        <button
                          key={c}
                          className={`city-list-item-premium ${city === c ? "active" : ""}`}
                          onClick={() => selectCity(c)}
                        >
                          {c}
                        </button>
                      ))
                    ) : (
                      <p className="no-results">
                        No cities found matching "{citySearch}"
                      </p>
                    )}
                  </div>
                </div> */}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
