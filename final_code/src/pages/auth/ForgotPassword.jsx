import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaLock, FaKey, FaArrowLeft } from "react-icons/fa";
import { useNotification } from "../../context/NotificationContext";
import GlassCard from "../../components/ui/GlassCard";
import Button from "../../components/ui/Button";
import "./styles/Auth.css";

export default function ForgotPassword() {
  const { showNotification } = useNotification();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(
        "http://localhost/event_backend/auth/forgot_password.php",
        { email, password },
      );

      if (res.data.status) {
        showNotification(
          res.data.message || "Security protocols updated. Identity restored.",
          "success",
        );
        setTimeout(() => navigate("/login"), 1500);
      } else {
        showNotification(
          res.data.message || "Identity verification node failure",
          "error",
        );
      }
    } catch (error) {
      showNotification("Security gateway unreachable", "error");
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
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="auth-icon-circle mb-4"
                      >
                        <FaLock style={{alignItems:"center",justifyContent:"center"}} />
                      </motion.div>
                      <h2 className="display-5 fw-black text-white mb-4">
                        Restore
                        <br />
                        <span className="text-primary-dark">Identity</span>
                      </h2>
                      <p className="text-white-50 lead">
                        Enter the security matrix to re-establish your presence
                        on the grid.
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
                    <motion.div variants={itemVariants} className="mb-4">
                      <button
                        onClick={() => navigate("/login")}
                        className="btn btn-link text-primary p-0 text-decoration-none small fw-bold d-flex align-items-center gap-2 hover-glow"
                      >
                        <FaArrowLeft size={10} /> RETURN TO LOGIN
                      </button>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <h3 className="fw-black text-white mb-2 fs-2">
                        Recovery Sync
                      </h3>
                      <p className="text-secondary mb-5">
                        Initialize credential restoration protocol
                      </p>
                    </motion.div>

                    <form onSubmit={handleReset}>
                      <motion.div
                        variants={itemVariants}
                        className="premium-input-group mb-4"
                      >
                        <label className="premium-label">
                          REGISTERED IDENTITY (EMAIL)
                        </label>
                        <div className="input-with-icon">
                          <FaEnvelope className="input-icon-v2" />
                          <input
                            type="email"
                            required
                            placeholder="name@nexus.com"
                            className="premium-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                      </motion.div>

                      <motion.div
                        variants={itemVariants}
                        className="premium-input-group mb-5"
                      >
                        <label className="premium-label">
                          NEW PASSWORD
                        </label>
                        <div className="input-with-icon">
                          <FaKey className="input-icon-v2" />
                          <input
                            type="password"
                            required
                            placeholder="Min. 8 encrypted bits"
                            className="premium-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <Button
                          type="submit"
                          variant="primary"
                          className="w-100 py-3 mb-4 shadow-glow"
                          loading={isLoading}
                        >
                          Reset Password
                        </Button>
                      </motion.div>
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
