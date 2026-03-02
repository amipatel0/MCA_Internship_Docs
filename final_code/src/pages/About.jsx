import React from "react";
import {
  FaCalendarCheck,
  FaUsers,
  FaChartLine,
  FaShieldAlt,
  FaRocket,
  FaHeart,
} from "react-icons/fa";
import { MdEmojiEvents } from "react-icons/md";
import { motion } from "framer-motion";
import GlassCard from "../components/ui/GlassCard";
import "./About.css";

export default function About() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const features = [
    {
      icon: <FaCalendarCheck />,
      title: "Event Creation & Approval",
      desc: "Organizers can create and manage events. Every event remains in pending status until reviewed and approved by the Admin to maintain quality and authenticity.",
      color: "#6366f1",
    },
    {
      icon: <FaUsers />,
      title: "Role-Based Dashboards",
      desc: "Separate dashboards for Admin, Organizer, and Customer provide secure login access and customized functionalities for each role.",
      color: "#a855f7",
    },
    {
      icon: <FaChartLine />,
      title: "Analytics & Monitoring",
      desc: "Organizers can track registrations and performance analytics, while Admin monitors overall system activities and reports.",
      color: "#ec4899",
    },
    {
      icon: <FaShieldAlt />,
      title: "Secure Registration Flow",
      desc: "Customers register for events, and Admin verifies registrations. Free events generate instant confirmation, while paid events proceed to payment verification.",
      color: "#10b981",
    },
    {
      icon: <FaRocket />,
      title: "Digital Ticket Generation",
      desc: "Automatic ticket generation with downloadable PDF after successful approval or payment confirmation.",
      color: "#f59e0b",
    },
    {
      icon: <FaHeart />,
      title: "User-Friendly Experience",
      desc: "Modern UI with smooth animations, secure workflows, and seamless navigation ensures an intuitive experience for all users.",
      color: "#3b82f6",
    },
  ];

  return (
    <motion.div
      className="about-page-premium py-5"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      {/* Hero Section */}
      <section className="about-hero-premium mb-5">
        <div className="container text-center">
          <motion.div
            className="hero-emoji-icon shadow-lg"
            variants={itemVariants}
          >
            <MdEmojiEvents />
          </motion.div>
          <motion.h1
            className="display-3 fw-black text-white mb-3"
            variants={itemVariants}
          >
            <span className="text-primary-gradient">Event Management</span>
          </motion.h1>
          <motion.p
            className="lead text-secondary max-w-700 mx-auto"
            variants={itemVariants}
          >
            A full-stack Event Management System developed using React and PHP
            to manage events, approvals, registrations, payments, and digital
            tickets efficiently and securely.
          </motion.p>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-premium mb-5 pb-5">
        <div className="container">
          <GlassCard className="p-0 border-0 overflow-hidden" delay={0.2}>
            <div className="row g-0">
              <div className="col-lg-6 d-none d-lg-block">
                <div className="story-image-side h-100"></div>
              </div>
              <div className="col-lg-6 p-4 p-md-5 d-flex flex-column justify-content-center">
                <span className="badge-premium mb-3 text-center">ABOUT THE SYSTEM</span>
                <div className="story-text-premium text-secondary lh-lg">
                  <p>
                    This Event Management System is designed to simplify the
                    complete event lifecycle — from event creation to ticket
                    confirmation. The system connects three core roles: Admin,
                    Organizer, and Customer.
                  </p>
                  <p>
                    Organizers create events, Admin verifies and approves them,
                    and Customers browse and register for events. For paid
                    events, secure payment integration is provided, while free
                    events generate instant confirmation tickets automatically.
                  </p>
                  <p>
                    The platform ensures transparency, security, and efficiency
                    through role-based authentication, seat availability
                    management, registration approval workflow, and automated
                    ticket generation.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-premium mb-5 pb-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge-premium mb-3">SYSTEM FEATURES</span>
            <h2 className="text-white fw-black">
              Core Functional Capabilities
            </h2>
          </div>

          <div className="row g-4">
            {features.map((f, i) => (
              <div key={i} className="col-lg-4 col-md-6">
                <GlassCard
                  className="h-100 p-4 feature-card-item"
                  delay={0.1 * i}
                >
                  <div
                    className="feature-icon-v2 mb-4"
                    style={{ "--accent": f.color }}
                  >
                    {f.icon}
                  </div>
                  <h4 className="text-white fw-bold mb-3">{f.title}</h4>
                  <p className="text-secondary small mb-0 lh-base">{f.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-premium mb-5">
        <div className="container">
          <GlassCard className="p-5 text-center border-white-5" delay={0.6}>
            <div className="mission-content mx-auto max-w-800">
              <div className="mission-decorative mb-4">
                <span className="dot"></span>
                <span className="line"></span>
                <span className="dot"></span>
              </div>
              <h2 className="badge-premium mb-4">OUR MISSION</h2>
              <blockquote className="quote-v2 text-white fw-bold display-6 mb-4 mt-2">
                "To build a secure, efficient, and transparent event management
                platform that connects organizers and participants through a
                streamlined digital experience."
              </blockquote>
              <div className="mission-author-v2 text-primary fw-black tracking-widest small">
                EVENT MANAGEMENT SYSTEM
              </div>
            </div>
          </GlassCard>
        </div>
      </section>
    </motion.div>
  );
}
