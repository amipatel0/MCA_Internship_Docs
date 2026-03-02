import React, { useState } from "react";
import { FiMessageCircle, FiSend } from "react-icons/fi";
import {
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaGlobe,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNotification } from "../context/NotificationContext";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import "./Contact.css";

export default function Contact() {
  const { showNotification } = useNotification();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost/event_backend/customer/contact_messages.php",
        form,
      );
      if (response.data.status) {
        setIsSuccess(true);
        showNotification("Message transmitted successfully", "success");
        setForm({ name: "", email: "", message: "" });
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        showNotification(response.data.message, "error");
      }
    } catch (err) {
      showNotification("Communication failure", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <FaEnvelope />,
      title: "Digital Communication",
      detail: "event@gmail.com",
      sub: "Priority support available 24/7",
      color: "var(--primary)",
    },
    {
      icon: <FaPhoneAlt />,
      title: "Direct Contact",
      detail: "+91 98765 43210",
      sub: "Mon - Fri, 9am to 6pm IST",
      color: "#a855f7",
    },
    {
      icon: <FaMapMarkerAlt />,
      title: "Operational Hub",
      detail: "Ahmedabad, Gujarat",
      sub: "Enterprise Plaza, Suite 402",
      color: "#ec4899",
    },
  ];

  return (
    <div className="contact-page-premium py-5">
      <div className="container">
        {/* Header */}
        <header className="text-center mb-5 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="contact-hero-icon mx-auto mb-4"
          >
            <FiMessageCircle />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="display-4 fw-black text-white mb-2">
            Global <span className="text-primary-gradient">Support.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lead text-secondary max-w-700 mx-auto"
          >
            Our dedicated team of professionals is ready to assist you with any
            inquiries or tailored needs you may have.
          </motion.p>
        </header>

        <div className="row g-5">
          {/* Contact Details */}
          <div className="col-lg-5 order-2 order-lg-1">
            <div className="d-flex flex-column gap-4">
              {contactInfo.map((info, i) => (
                <GlassCard
                  key={i}
                  className="p-4 border-0 info-card-premium"
                  delay={0.1 * i}
                >
                  <div className="d-flex align-items-center gap-4">
                    <div
                      className="info-icon-wrapper"
                      style={{ "--accent": info.color }}
                    >
                      {info.icon}
                    </div>
                    <div>
                      <h6 className="text-white-50 small fw-bold tracking-widest mb-1 text-uppercase">
                        {info.title}
                      </h6>
                      <div className="text-white fw-black fs-5 mb-1">
                        {info.detail}
                      </div>
                      <div className="text-secondary small opacity-50">
                        {info.sub}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}

              {/* <GlassCard
                className="p-4 bg-primary-gradient-low border-0 mt-2"
                delay={0.4}
              >
                <div className="d-flex align-items-center gap-3">
                  <FaGlobe className="text-primary fs-3" />
                  <p className="text-white-50 small mb-0 fw-bold">
                    Connecting organizers and attendees across 50+ cities
                    globally.
                  </p>
                </div>
              </GlassCard> */}
            </div>
          </div>

          {/* Form */}
          <div className="col-lg-7 order-1 order-lg-2">
            <GlassCard
              className="p-4 p-md-5 border-0 overflow-hidden"
              delay={0.3}
            >
              <div className="form-head-premium mb-5">
                <h2 className="text-white fw-black mb-2">
                  Initialize Communication
                </h2>
                <p className="text-secondary small">
                  Direct line to our customer success and event operations team.
                </p>
              </div>

              <AnimatePresence>
                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="success-pill mb-4"
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className="success-check-mini">✓</div>
                      <span className="text-white small fw-bold">
                        Inquiry transmitted. We'll be in touch protocols
                        shortly.
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="premium-contact-form">
                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <div className="premium-input-group">
                      <label className="text-secondary small fw-bold mb-2 d-block">
                        YOUR NAME
                      </label>
                      <div className="input-with-icon">
                        <FaUser className="input-icon-v2" />
                        <input
                          type="text"
                          name="name"
                          required
                          placeholder="Enter your name"
                          className="premium-input"
                          value={form.name}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="premium-input-group">
                      <label className="text-secondary small fw-bold mb-2 d-block">
                        EMAIL ADDRESS
                      </label>
                      <div className="input-with-icon">
                        <FaEnvelope className="input-icon-v2" />
                        <input
                          type="email"
                          name="email"
                          required
                          placeholder="name@example.com"
                          className="premium-input"
                          value={form.email}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="premium-input-group mb-5">
                  <label className="text-secondary small fw-bold mb-2 d-block">
                    DETAILED MESSAGE
                  </label>
                  <div className="input-with-icon">
                    <FiMessageCircle className="input-icon-v2 top-20" />
                    <textarea
                      name="message"
                      rows="5"
                      required
                      placeholder="Type your message here..."
                      className="premium-input"
                      value={form.message}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 py-3"
                  disabled={isLoading}
                >
                  Dispatch Message <FiSend className="ms-2 small" />
                </Button>
              </form>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
