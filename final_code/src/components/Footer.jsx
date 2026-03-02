import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaGlobe,
  FaShieldAlt,
} from "react-icons/fa";
import { MdEmojiEvents, MdTerminal } from "react-icons/md";
import "./Footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

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
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <footer className="footer-premium">
      <div className="footer-content-premium">
        <motion.div
          className="container"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="footer-grid-premium">
            {/* Brand Synthesis Grid */}
            <motion.div className="footer-brand-node" variants={itemVariants}>
              <div className="brand-identity">
                <div className="brand-title-node">
                  <h3 className="brand-title-premium">
                    <span className="text-primary-gradient">
                      Event Management
                    </span>
                  </h3>
                </div>
              </div>
              <p className="brand-mission">
                We help you create and manage events easily. Our system allows users
                to find events, book tickets instantly, and helps organizers manage
                everything smoothly in one place.
              </p>
              <div className="social-matrix">
                {[
                  { icon: <FaFacebookF />, url: "https://www.facebook.com/",target:"_blank" },
                  { icon: <FaTwitter />, url: "https://www.twitter.com/",target:"_blank" },
                  { icon: <FaInstagram />, url: "https://www.instagram.com/",target:"_blank" },
                  { icon: <FaLinkedinIn />, url: "https://www.linkedin.com/",target:"_blank" },
                ].map((social, idx) => (
                  <motion.a
                    key={idx}
                    href={social.url}
                    target={social.target}
                    className="matrix-node"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Navigation Nodes */}
            <motion.div className="nav-cluster" variants={itemVariants}>
             <h4>Quick Links</h4>
              <ul className="cluster-links">
                {[
                  { to: "/", text: "Home" },
                  { to: "/events", text: "Events" },
                  { to: "/about", text: "About" },
                  { to: "/contact", text: "Contact" },
                ].map((link, idx) => (
                  <li key={idx}>
                    <Link to={link.to} className="cluster-link">
                      <span>{link.text}</span>
                      <span className="link-index">{link.index}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Operator Nodes */}
            <motion.div className="nav-cluster" variants={itemVariants}>
              <h4>User Access</h4>
              <ul className="cluster-links">
                {[
                  { to: "/login", text: "Login" },
                  { to: "/register", text: "Register" },
                  { to: "/customer/dashboard", text: "Dashboard" },
                  { to: "/customer/tickets", text: "Tickets" },
                ].map((link, idx) => (
                  <li key={idx}>
                    <Link to={link.to} className="cluster-link">
                      <span>{link.text}</span>
                      <span className="link-index">{link.index}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact Module */}
            <motion.div className="contact-module" variants={itemVariants}>
              {/* <h4>Comm Channels</h4> */}
              <div className="module-item">
                <div className="module-icon">
                  <FaEnvelope />
                </div>
                <div className="module-data">
                  <span>Email</span>
                  <p>event@gmail.com</p>
                </div>
              </div>
              <div className="module-item">
                <div className="module-icon">
                  <FaPhoneAlt />
                </div>
                <div className="module-data">
                  <span>Phone</span>
                  <p>+91 1010-010-101</p>
                </div>
              </div>
              <div className="module-item">
                <div className="module-icon">
                  <FaMapMarkerAlt />
                </div>
                <div className="module-data">
                  <span>Address</span>
                  <p>Ahmedabad, Gujarat</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Footer Terminal Section */}
      <div className="footer-terminal">
        <div className="terminal-interface">
          <p className="system-copyright">
            &copy; {currentYear} <span>Event Management System</span>. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>

      {/* Decorative Orbs */}
      <div className="blur-orb-premium orb-top-right"></div>
      <div className="blur-orb-premium orb-bottom-left"></div>
    </footer>
  );
}
