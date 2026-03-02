import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdEmail,
  MdPerson,
  MdMessage,
  MdDelete,
  MdDoneAll,
  MdFiberManualRecord,
  MdOutlineMarkEmailRead,
  MdChevronLeft,
  MdChevronRight,
  MdInbox,
  MdReply,
} from "react-icons/md";
import { useNotification } from "../context/NotificationContext";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import Skeleton, { TableSkeleton } from "../components/ui/Skeleton";
import "./ManageMessages.css";

const MESSAGES_PER_PAGE = 8;

const ManageMessages = () => {
  const { showNotification } = useNotification();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyLoading, setReplyLoading] = useState(false);

  // Fetch messages from backend
  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        "http://localhost/event_backend/admin/viewMessages.php",
        { withCredentials: true },
      );
      if (res.data.status) {
        setMessages(res.data.data);
      } else {
        setError(res.data.message || "Failed to fetch messages");
      }
    } catch (err) {
      setError("An error occurred while fetching messages.");
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Update message status to 'Read'
  const updateStatus = async (id, status) => {
    try {
      const res = await axios.post(
        "http://localhost/event_backend/admin/updateMessageStatus.php",
        { id, status },
        { withCredentials: true },
      );
      if (res.data.status) {
        showNotification(
          "Transmission acknowledged and marked as read",
          "success",
        );
        fetchMessages();
      }
    } catch (err) {
      showNotification("Failed to synchronize transmission status", "error");
    }
  };

  // Open reply modal and prefill existing reply
  const openReplyModal = (msg) => {
    setSelectedMessage(msg);
    setReplyText(msg.reply || "");
    setShowReplyModal(true);
  };

  // Handle reply submission
  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setReplyLoading(true);
    try {
      const res = await axios.post(
        "http://localhost/event_backend/admin/replyMessage.php",
        {
          message_id: selectedMessage.id,
          user_email: selectedMessage.email,
          reply_content: replyText,
        },
        { withCredentials: true },
      );

      if (res.data.status) {
        showNotification(
          "Reply transmitted and customer notified successfully",
          "success",
        );
        setShowReplyModal(false);
        setReplyText("");
        fetchMessages();
      } else {
        showNotification(
          res.data.message || "Failed to transmit reply protocol",
          "error",
        );
      }
    } catch (err) {
      showNotification("Reply transmission synchronization failure", "error");
    } finally {
      setReplyLoading(false);
    }
  };

  // Delete a message
  const deleteMessage = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to terminate this transmission node?",
      )
    )
      return;

    try {
      const res = await axios.post(
        "http://localhost/event_backend/admin/deleteMessage.php",
        { id },
        { withCredentials: true },
      );
      if (res.data.status) {
        showNotification("Transmission node securely terminated", "success");
        fetchMessages();
      }
    } catch (err) {
      showNotification("Failed to terminate transmission node", "error");
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(messages.length / MESSAGES_PER_PAGE);
  const startIndex = (currentPage - 1) * MESSAGES_PER_PAGE;
  const currentMessages = messages.slice(
    startIndex,
    startIndex + MESSAGES_PER_PAGE,
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  return (
    <motion.div
      className="manage-messages-premium pb-5"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container py-4">
        {/* Transmission Header */}
        <header className="dashboard-header-premium mb-5 pt-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="d-flex align-items-center gap-3 mb-3"
              >
                <div className="messages-icon-premium shadow-lg">
                  <MdInbox />
                </div>
                <div>
                  <span className="badge-premium-v2 text-uppercase">
                    INQUIRY CENTER
                  </span>
                  <h1 className="text-white fw-black mb-0 display-4">
                    Inquiries{" "}
                    <span className="text-primary-gradient">Center</span>
                  </h1>
                </div>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-secondary lead mb-0 max-w-600"
              >
                Monitor incoming signals from all system sectors. Moderate
                transmission logs, acknowledge receptions, or purge old data
                nodes.
              </motion.p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="telemetry-pill">
                  <span className="dot-live" />{" "}
                  {messages.filter((m) => m.status === "New").length} PENDING
                  SIGNALS
                </div>
              </motion.div>
            </div>
          </div>
        </header>

        {/* Transmission Registry */}
        <div className="message-grid-container mb-5">
          <div className="d-flex align-items-center gap-3 mb-4 pb-2 border-bottom border-white-5">
            <span className="section-indicator-dash" />
            <h3 className="text-white fw-black mb-0 fs-4 tracking-tight">
              INCOMING LOGS
            </h3>
          </div>

          <GlassCard className="p-0 overflow-hidden border-white-5 shadow-2xl">
            <div className="table-responsive">
              {loading ? (
                <div className="p-4">
                  <TableSkeleton rows={MESSAGES_PER_PAGE} />
                </div>
              ) : (
                <table className="table messages-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th className="px-4 py-4">SENDER</th>
                      <th className="px-4 py-4">MESSAGE</th>
                      <th className="px-4 py-4 text-center">STATUS</th>
                      <th className="px-4 py-4 text-end">OPERATIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {currentMessages.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-5">
                            <div className="empty-message-state opacity-25">
                              <MdOutlineMarkEmailRead
                                size={64}
                                className="mb-3"
                              />
                              <h4 className="fw-black">
                                NO INCOMING SIGNALS DETECTED
                              </h4>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        currentMessages.map((msg, idx) => (
                          <motion.tr
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.02 }}
                            className={`messages-row ${msg.status === "New" ? "priority-node" : ""}`}
                          >
                            <td className="px-4 py-4">
                              <div className="d-flex align-items-center">
                                <div
                                  className={`signal-avatar ${msg.status === "New" ? "active" : ""}`}
                                >
                                  {msg.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="text-dark fw-bold mb-1">
                                    {msg.name}
                                  </div>
                                  <div className="text-secondary fw-bold font-monospace opacity-50">
                                    {msg.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td
                              className="px-4 py-4"
                              style={{ maxWidth: "400px" }}
                            >
                              <div className="payload-content text-secondary small font-monospace">
                                {msg.message}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <div
                                className={`status-pill-v2 ${msg.status === "New" ? "blocked" : "active"}`}
                              >
                                <MdFiberManualRecord
                                  className={
                                    msg.status === "New" ? "dot-blink" : ""
                                  }
                                />
                                {msg.status.toUpperCase()}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-end">
                              <div className="d-flex justify-content-end gap-2">
                                {msg.status === "New" && (
                                  <Button
                                    variant="glass"
                                    className="btn-operation text-success"
                                    onClick={() => updateStatus(msg.id, "Read")}
                                    title="Acknowledge Reception"
                                  >
                                    <MdDoneAll />
                                  </Button>
                                )}
                                <Button
                                  variant="glass"
                                  className="btn-operation text-primary"
                                  onClick={() => openReplyModal(msg)}
                                  title="Initialize Reply Protocol"
                                >
                                  <MdReply />
                                </Button>
                                <Button
                                  variant="glass"
                                  className="btn-operation text-danger"
                                  onClick={() => deleteMessage(msg.id)}
                                  title="Purge Signal Node"
                                >
                                  <MdDelete />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {!loading && messages.length > MESSAGES_PER_PAGE && (
              <div className="d-flex justify-content-between align-items-center p-4 border-top border-white-5 bg-white-2">
                <span className="text-secondary small font-monospace opacity-50">
                  Showing {startIndex + 1} -{" "}
                  {Math.min(startIndex + MESSAGES_PER_PAGE, messages.length)} of{" "}
                  {messages.length} Signals
                </span>
                <div className="d-flex gap-3">
                  <Button
                    variant="outline"
                    className="px-3"
                    disabled={currentPage === 1}
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      setCurrentPage((p) => p - 1);
                    }}
                  >
                    <MdChevronLeft />
                  </Button>
                  <Button
                    variant="outline"
                    className="px-3"
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      setCurrentPage((p) => p + 1);
                    }}
                  >
                    <MdChevronRight />
                  </Button>
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Reply Modal */}
        <AnimatePresence>
          {showReplyModal && (
            <div className="reply-modal-overlay">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="reply-modal-content"
              >
                <div className="modal-header-premium mb-4">
                  <h3 className="text-white fw-black mb-1">Reply to Signal</h3>
                  <p className="text-secondary small mb-0">
                    Target: {selectedMessage?.email}
                  </p>
                </div>

                <div className="original-message-preview mb-4">
                  <span className="text-primary-gradient small fw-bold d-block mb-1">
                    ORIGINAL TRANSMISSION:
                  </span>
                  <p className="text-secondary small font-monospace bg-white-2 p-3 rounded border border-white-5">
                    {selectedMessage?.message}
                  </p>
                </div>

                <form onSubmit={handleReply}>
                  <div className="premium-input-group mb-4">
                    <label className="text-secondary small fw-bold mb-2 d-block text-uppercase tracking-widest">
                      Reply Message
                    </label>
                    <textarea
                      className="premium-textarea"
                      rows="5"
                      placeholder="Compose your response protocol..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <div className="d-flex gap-3">
                    <Button
                      variant="glass"
                      className="flex-grow-1"
                      onClick={() => {
                        setShowReplyModal(false);
                        setReplyText("");
                      }}
                      type="button"
                    >
                      ABORT
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-grow-1"
                      type="submit"
                      disabled={replyLoading}
                    >
                      {replyLoading ? "TRANSMITTING..." : "DISPATCH REPLY"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ManageMessages;
