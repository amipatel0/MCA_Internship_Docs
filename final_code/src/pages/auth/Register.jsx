import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserTag,
  FaArrowRight,
  FaShieldAlt,
  FaPhone,
} from "react-icons/fa";
import API from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
import GlassCard from "../../components/ui/GlassCard";
import Button from "../../components/ui/Button";
import "./styles/Auth.css";

export default function Register() {
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    let err = {};
    if (!form.name.trim()) err.name = "Full name identity required";
    else if (!/^[A-Za-z\s]{3,}$/.test(form.name))
      err.name = "Invalid name sequence";
    if (!form.email) err.email = "Email parameters required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      err.email = "Invalid protocol format";
    if (!form.phone) err.phone = "Phone number required";
    else if (!/^[0-9]{10,15}$/.test(form.phone))
      err.phone = "Invalid digit sequence";
    if (!form.password) err.password = "Security key required";
    else if (form.password.length < 6) err.password = "Minimum 6 bits required";
    if (!form.role) err.role = "Role classification required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await API.post("auth/register.php", form);
      if (res.data.status) {
        showNotification(
          "Account synthesis complete. Welcome to the grid.",
          "success",
        );
        setTimeout(() => navigate("/login"), 800);
      } else {
        showNotification(
          res.data.message || "Synthesis procedure failed",
          "error",
        );
      }
    } catch (err) {
      showNotification("Terminal synthesis error", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="auth-page-premium">
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />

      <div className="container d-flex align-items-center justify-content-center min-vh-100 py-5">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-100 d-flex justify-content-center"
        >
          <GlassCard className="auth-card-premium p-0 border-0 overflow-hidden">
            <div className="row g-0">
              {/* Design Side */}
              <div className="col-lg-5 d-none d-lg-block">
                <div className="auth-design-side h-100 p-5 d-flex flex-column justify-content-between">
                  <div className="auth-mesh-grid" />
                  <div className="auth-design-content">
                    <div>
                      <h2 className="display-5 fw-black text-white mb-4">
                        Start Your
                        <br />
                        <span className="text-primary-dark">Journey</span>
                      </h2>
                      <p className="text-white-50 lead">
                        Create an account to browse, host, and manage
                        world-class events effortlessly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Side */}
              <div className="col-lg-7">
                <div className="p-4 p-md-5">
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div variants={itemVariants}>
                      <h3 className="fw-black text-white mb-2 fs-2">
                        Account Creation
                      </h3>
                      <p className="text-secondary mb-5">
                        Join our community of experience seekers
                      </p>
                    </motion.div>

                    <form onSubmit={handleSubmit}>
                      <div className="row g-3 mb-4">
                        <motion.div
                          variants={itemVariants}
                          className="col-md-6"
                        >
                          <div className="premium-input-group">
                            <label className="premium-label">FULL NAME</label>
                            <div className="input-with-icon">
                              <FaUser className="input-icon-v2" />
                              <input
                                type="text"
                                name="name"
                                placeholder="Identity Node Name"
                                className={`premium-input ${errors.name ? "border-danger" : ""}`}
                                onChange={handleChange}
                              />
                            </div>
                            {errors.name && (
                              <span className="error-hint">{errors.name}</span>
                            )}
                          </div>
                        </motion.div>
                        <motion.div
                          variants={itemVariants}
                          className="col-md-6"
                        >
                          <div className="premium-input-group">
                            <label className="premium-label">
                              EMAIL ADDRESS
                            </label>
                            <div className="input-with-icon">
                              <FaEnvelope className="input-icon-v2" />
                              <input
                                type="email"
                                name="email"
                                placeholder="email@nexus.com"
                                className={`premium-input ${errors.email ? "border-danger" : ""}`}
                                onChange={handleChange}
                              />
                            </div>
                            {errors.email && (
                              <span className="error-hint">{errors.email}</span>
                            )}
                          </div>
                        </motion.div>
                      </div>

                      <div className="row g-3 mb-4">
                        <motion.div
                          variants={itemVariants}
                          className="col-md-12"
                        >
                          <div className="premium-input-group">
                            <label className="premium-label">PHONE NUMBER</label>
                            <div className="input-with-icon">
                              <FaPhone className="input-icon-v2" />
                              <input
                                type="tel"
                                name="phone"
                                placeholder="+91 XXXXX XXXXX"
                                className={`premium-input ${errors.phone ? "border-danger" : ""}`}
                                onChange={handleChange}
                                value={form.phone}
                              />
                            </div>
                            {errors.phone && (
                              <span className="error-hint">{errors.phone}</span>
                            )}
                          </div>
                        </motion.div>
                      </div>

                      <div className="row g-3 mb-4">
                        <motion.div
                          variants={itemVariants}
                          className="col-md-6"
                        >
                          <div className="premium-input-group">
                            <label className="premium-label">PASSWORD</label>
                            <div className="input-with-icon">
                              <FaLock className="input-icon-v2" />
                              <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                className={`premium-input ${errors.password ? "border-danger" : ""}`}
                                onChange={handleChange}
                              />
                            </div>
                            {errors.password && (
                              <span className="error-hint">
                                {errors.password}
                              </span>
                            )}
                          </div>
                        </motion.div>
                        <motion.div
                          variants={itemVariants}
                          className="col-md-6"
                        >
                          <div className="premium-input-group">
                            <label className="premium-label">ROLE</label>
                            <div className="input-with-icon">
                              <FaUserTag className="input-icon-v2" />
                              <select
                                name="role"
                                className="premium-input select-premium"
                                onChange={handleChange}
                                value={form.role}
                              >
                                <option value="customer">CUSTOMER</option>
                                <option value="organizer">ORGANIZER</option>
                                <option value="admin">ADMIN</option>
                              </select>
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      <motion.div variants={itemVariants}>
                        <Button
                          type="submit"
                          variant="primary"
                          className="w-100 py-3 mb-4 shadow-glow"
                          loading={isLoading}
                        >
                          CREATE ACCOUNT <FaArrowRight className="ms-2 small" />
                        </Button>
                      </motion.div>

                      <motion.p
                        variants={itemVariants}
                        className="text-center text-secondary small"
                      >
                        Already have an account?{" "}
                        <Link
                          className="text-primary fw-bold cursor-pointer hover-glow"
                          to="/login"
                        >
                          LOGIN
                        </Link>
                      </motion.p>
                    </form>
                  </motion.div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
