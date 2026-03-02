import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaEnvelope,
  FaLock,
  FaArrowRight,
  FaFingerprint,
} from "react-icons/fa";
import API from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
import GlassCard from "../../components/ui/GlassCard";
import Button from "../../components/ui/Button";
import "./styles/Auth.css";

export default function Login() {
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    let err = {};
    if (!email) err.email = "Email identity required";
    else if (!/^\S+@\S+\.\S+$/.test(email))
      err.email = "Invalid format protocol";
    if (!password) err.password = "Security key required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await API.post("auth/login.php", { email, password });

      if (res.data.status) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        window.dispatchEvent(new Event("storage"));
        showNotification("Identity verified. Welcome back.", "success");

        setTimeout(() => {
          if (res.data.user.role === "admin") navigate("/admin/dashboard");
          else if (res.data.user.role === "organizer")
            navigate("/organizer/dashboard");
          else navigate("/");
        }, 800);
      } else {
        showNotification(
          res.data.message || "Credential mismatch detected",
          "error",
        );
      }
    } catch (err) {
      showNotification("Authentication node failure", "error");
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

      <div className="container d-flex align-items-center justify-content-center min-vh-100">
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
                        Elevate Your
                        <br />
                        <span className="text-primary-dark">Presence</span>
                      </h2>
                      <p className="text-white-50 lead">
                        Join the elite registry of event orchestrators and
                        experience pioneers.
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
                      <h3 className="fw-black mb-2 fs-2">
                        Initialize Session
                      </h3>
                      <p className="text-muted-custom mb-5">
                        Enter your unique identity parameters
                      </p>
                    </motion.div>

                    <form onSubmit={handleLogin}>
                      <motion.div
                        variants={itemVariants}
                        className="premium-input-group mb-4"
                      >
                        <label className="premium-label">EMAIL IDENTITY</label>
                        <div className="input-with-icon">
                          <FaEnvelope className="input-icon-v2" />
                          <input
                            type="email"
                            placeholder="name@nexus.com"
                            className={`premium-input ${errors.email ? "border-danger" : ""}`}
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setErrors({ ...errors, email: "" });
                            }}
                          />
                        </div>
                        {errors.email && (
                          <span className="error-hint">{errors.email}</span>
                        )}
                      </motion.div>

                      <motion.div
                        variants={itemVariants}
                        className="premium-input-group mb-4"
                      >
                        <div className="d-flex justify-content-between">
                          <label className="premium-label">PASSWORD</label>
                          <span
                            className="forgot-link"
                            onClick={() => navigate("/forgot-password")}
                          >
                            RECOVER?
                          </span>
                        </div>
                        <div className="input-with-icon">
                          <FaLock className="input-icon-v2" />
                          <input
                            type="password"
                            placeholder="••••••••"
                            className={`premium-input ${errors.password ? "border-danger" : ""}`}
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              setErrors({ ...errors, password: "" });
                            }}
                          />
                        </div>
                        {errors.password && (
                          <span className="error-hint">{errors.password}</span>
                        )}
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <Button
                          type="submit"
                          variant="primary"
                          className="w-100 py-3 mb-4 shadow-glow"
                          loading={isLoading}
                        >
                          LOGIN <FaArrowRight className="ms-2 small" />
                        </Button>
                      </motion.div>

                      <motion.p
                        variants={itemVariants}
                        className="text-center text-muted-custom small"
                      >
                        Don't have an account?{" "}
                        <Link
                          className="text-primary fw-bold cursor-pointer hover-glow"
                          to="/register"
                        >
                          CREATE ACCOUNT
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
